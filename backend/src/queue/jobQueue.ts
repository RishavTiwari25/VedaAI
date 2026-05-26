import { generateQuestionPaper } from '../services/aiService';
import { Assignment } from '../models/Assignment';
import { Result } from '../models/Result';
import { getSocketManager } from '../socket/socketManager';
import { isRedisAvailable, getRedis } from '../config/redis';
import { AssignmentInput } from '../types';

export interface GenerationJobData {
  assignmentId: string;
  assignmentInput: AssignmentInput;
}

// ─── BullMQ Queue (only when Redis is available) ──────────────────────────
let Queue: typeof import('bullmq').Queue | null = null;
let Worker: typeof import('bullmq').Worker | null = null;
let generationQueue: import('bullmq').Queue | null = null;

async function loadBullMQ() {
  if (!isRedisAvailable()) return;
  try {
    const bullmq = await import('bullmq');
    Queue = bullmq.Queue;
    Worker = bullmq.Worker;
  } catch {
    console.warn('⚠️  BullMQ could not be loaded');
  }
}

// ─── Core job processor ────────────────────────────────────────────────────
export async function processGenerationJob(
  data: GenerationJobData,
  onProgress?: (progress: number, msg: string) => void
): Promise<void> {
  const { assignmentId, assignmentInput } = data;

  let io: ReturnType<typeof getSocketManager> | null = null;
  try { io = getSocketManager(); } catch {}

  const emit = (progress: number, message: string) => {
    onProgress?.(progress, message);
    io?.to(`assignment:${assignmentId}`).emit('job:progress', {
      assignmentId, status: 'processing', progress, message,
    });
  };

  try {
    await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
    emit(5, 'Starting question generation...');

    const paper = await generateQuestionPaper(assignmentInput, emit);
    emit(95, 'Saving results...');

    await Result.deleteMany({ assignmentId });
    await Result.create({ assignmentId, paper, version: 1 });
    await Assignment.findByIdAndUpdate(assignmentId, { status: 'completed' });

    io?.to(`assignment:${assignmentId}`).emit('job:complete', {
      assignmentId, status: 'completed', progress: 100,
      message: 'Question paper generated successfully!',
      result: paper,
    });

    console.log(`✅ Generation complete: ${assignmentId}`);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Generation failed (${assignmentId}):`, errMsg);
    await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
    io?.to(`assignment:${assignmentId}`).emit('job:error', {
      assignmentId, status: 'failed', progress: 0,
      message: 'Generation failed', error: errMsg,
    });
    throw error;
  }
}

// ─── Queue enqueue (BullMQ if available, otherwise run directly) ──────────
export async function enqueueGenerationJob(data: GenerationJobData): Promise<string> {
  if (isRedisAvailable() && Queue && generationQueue) {
    const job = await generationQueue.add('generate', data, { priority: 1 });
    console.log(`📋 Job queued: ${job.id}`);
    return job.id || '';
  }

  // Fallback: run asynchronously without BullMQ
  console.log('📋 Running job directly (no Redis)');
  setImmediate(() => processGenerationJob(data).catch(console.error));
  return `direct-${Date.now()}`;
}

// ─── Worker start ──────────────────────────────────────────────────────────
export async function startWorker(): Promise<void> {
  await loadBullMQ();

  if (!isRedisAvailable() || !Queue || !Worker) {
    console.log('ℹ️  BullMQ worker not started (Redis unavailable) — using direct processing');
    return;
  }

  const QUEUE_NAME = 'question-generation';
  const redis = getRedis();

  generationQueue = new Queue(QUEUE_NAME, {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    },
  });

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      await processGenerationJob(job.data, (p) => job.updateProgress(p));
    },
    { connection: redis, concurrency: 3 }
  );

  worker.on('completed', (job) => console.log(`✅ Job ${job.id} done`));
  worker.on('failed', (job, err) => console.error(`❌ Job ${job?.id} failed:`, err.message));
  console.log('🔧 BullMQ worker started');
}
