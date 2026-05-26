import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Assignment } from '../models/Assignment';
import { Result } from '../models/Result';
import { enqueueGenerationJob, startWorker } from '../queue/jobQueue';
import { generatePDF } from '../services/pdfService';
import { AppError } from '../middleware/errorHandler';
import { upload } from '../middleware/upload';
import { isRedisAvailable, getRedis } from '../config/redis';

// Safe cache helpers
async function cacheGet(key: string): Promise<string | null> {
  if (!isRedisAvailable()) return null;
  try { return await getRedis().get(key); } catch { return null; }
}
async function cacheSet(key: string, ttl: number, value: string): Promise<void> {
  if (!isRedisAvailable()) return;
  try { await getRedis().setex(key, ttl, value); } catch {}
}
async function cacheDel(key: string): Promise<void> {
  if (!isRedisAvailable()) return;
  try { await getRedis().del(key); } catch {}
}

const router = Router();

// Start worker on route initialization (async — won't block startup)
startWorker().catch((e) => console.warn('Worker start deferred:', e));

const QuestionTypeSchema = z.object({
  type: z.string().min(1),
  count: z.number().int().min(1),
  marks: z.number().int().min(1),
});

const CreateAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject: z.string().min(1, 'Subject is required'),
  className: z.string().min(1, 'Class is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  questionTypes: z.array(QuestionTypeSchema).min(1, 'At least one question type is required'),
  additionalInstructions: z.string().optional(),
  schoolName: z.string().optional(),
  teacherName: z.string().optional(),
  timeAllowed: z.string().optional(),
});

// GET /api/assignments - List all
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'assignments:list';
    const cached = await cacheGet(cacheKey);
    if (cached) {
      res.json({ success: true, data: JSON.parse(cached), cached: true });
      return;
    }

    const assignments = await Assignment.find()
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();

    await cacheSet(cacheKey, 30, JSON.stringify(assignments));
    res.json({ success: true, data: assignments });
  } catch (err) {
    next(err);
  }
});

// GET /api/assignments/:id - Get single
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignment = await Assignment.findById(req.params.id).lean();
    if (!assignment) throw new AppError('Assignment not found', 404);

    const result = await Result.findOne({ assignmentId: req.params.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: { assignment, result: result?.paper || null },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/assignments - Create
router.post('/', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (body.questionTypes && typeof body.questionTypes === 'string') {
      body.questionTypes = JSON.parse(body.questionTypes);
    }
    // Coerce numbers
    if (Array.isArray(body.questionTypes)) {
      body.questionTypes = body.questionTypes.map((qt: Record<string, unknown>) => ({
        ...qt,
        count: Number(qt.count),
        marks: Number(qt.marks),
      }));
    }

    const validated = CreateAssignmentSchema.parse(body);

    const totalQuestions = validated.questionTypes.reduce((s, qt) => s + qt.count, 0);
    const totalMarks = validated.questionTypes.reduce((s, qt) => s + qt.count * qt.marks, 0);

    const assignment = await Assignment.create({
      ...validated,
      dueDate: new Date(validated.dueDate),
      fileUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      totalQuestions,
      totalMarks,
      status: 'pending',
    });

    // Invalidate cache
    await cacheDel('assignments:list');

    // Enqueue generation job
    const jobId = await enqueueGenerationJob({
      assignmentId: assignment._id.toString(),
      assignmentInput: {
        title: assignment.title,
        subject: assignment.subject,
        className: assignment.className,
        dueDate: assignment.dueDate.toISOString(),
        questionTypes: assignment.questionTypes,
        additionalInstructions: assignment.additionalInstructions,
        fileUrl: assignment.fileUrl,
        schoolName: assignment.schoolName,
        teacherName: assignment.teacherName,
        timeAllowed: assignment.timeAllowed,
      },
    });

    if (jobId) await Assignment.findByIdAndUpdate(assignment._id, { jobId });

    res.status(201).json({
      success: true,
      data: { assignment, jobId },
      message: 'Assignment created and generation started',
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError(err.errors.map(e => e.message).join(', '), 400));
    } else {
      next(err);
    }
  }
});

// POST /api/assignments/:id/regenerate
router.post('/:id/regenerate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) throw new AppError('Assignment not found', 404);

    await Assignment.findByIdAndUpdate(req.params.id, { status: 'pending' });

    const jobId = await enqueueGenerationJob({
      assignmentId: assignment._id.toString(),
      assignmentInput: {
        title: assignment.title,
        subject: assignment.subject,
        className: assignment.className,
        dueDate: assignment.dueDate.toISOString(),
        questionTypes: assignment.questionTypes,
        additionalInstructions: assignment.additionalInstructions,
        fileUrl: assignment.fileUrl,
        schoolName: assignment.schoolName,
        teacherName: assignment.teacherName,
        timeAllowed: assignment.timeAllowed,
      },
    });

    await Assignment.findByIdAndUpdate(assignment._id, { jobId, status: 'processing' });
    await cacheDel('assignments:list');

    res.json({ success: true, data: { jobId }, message: 'Regeneration started' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/assignments/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) throw new AppError('Assignment not found', 404);

    await Result.deleteMany({ assignmentId: req.params.id });
    await cacheDel('assignments:list');
    res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /api/assignments/:id/pdf
router.get('/:id/pdf', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) throw new AppError('Assignment not found', 404);

    const result = await Result.findOne({ assignmentId: req.params.id }).sort({ createdAt: -1 });
    if (!result) throw new AppError('No generated paper found', 404);

    const pdfBuffer = await generatePDF(result.paper, assignment.title);

    const filename = `${assignment.title.replace(/[^a-z0-9]/gi, '_')}_question_paper.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

export default router;
