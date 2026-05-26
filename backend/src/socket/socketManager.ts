import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('join:assignment', (assignmentId: string) => {
      const room = `assignment:${assignmentId}`;
      socket.join(room);
      console.log(`Client ${socket.id} joined room: ${room}`);
      socket.emit('joined', { room, assignmentId });
    });

    socket.on('leave:assignment', (assignmentId: string) => {
      socket.leave(`assignment:${assignmentId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id} - ${reason}`);
    });
  });

  return io;
}

export function getSocketManager(): Server {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}
