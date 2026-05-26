'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAssignmentStore } from '@/store/assignmentStore';
import type { JobProgressEvent } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function useWebSocket(assignmentId?: string) {
  const setJobProgress = useAssignmentStore((s) => s.setJobProgress);
  const clearJobProgress = useAssignmentStore((s) => s.clearJobProgress);
  const isJoined = useRef(false);

  const handleProgress = useCallback(
    (event: JobProgressEvent) => {
      setJobProgress(event);
    },
    [setJobProgress]
  );

  useEffect(() => {
    const sock = getSocket();

    if (assignmentId && !isJoined.current) {
      sock.emit('join:assignment', assignmentId);
      isJoined.current = true;
    }

    sock.on('job:progress', handleProgress);
    sock.on('job:complete', handleProgress);
    sock.on('job:error', handleProgress);
    sock.on('job:queued', handleProgress);

    sock.on('connect', () => {
      console.log('🔌 WebSocket connected');
      if (assignmentId && !isJoined.current) {
        sock.emit('join:assignment', assignmentId);
        isJoined.current = true;
      }
    });

    sock.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
      isJoined.current = false;
    });

    return () => {
      if (assignmentId) {
        sock.emit('leave:assignment', assignmentId);
        isJoined.current = false;
      }
      sock.off('job:progress', handleProgress);
      sock.off('job:complete', handleProgress);
      sock.off('job:error', handleProgress);
      sock.off('job:queued', handleProgress);
    };
  }, [assignmentId, handleProgress]);

  const joinAssignment = useCallback((id: string) => {
    const sock = getSocket();
    sock.emit('join:assignment', id);
  }, []);

  const leaveAssignment = useCallback((id: string) => {
    const sock = getSocket();
    sock.emit('leave:assignment', id);
    clearJobProgress(id);
  }, [clearJobProgress]);

  return { joinAssignment, leaveAssignment };
}
