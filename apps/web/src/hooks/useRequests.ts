'use client';

import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';
import type { ServiceRequestDTO } from '@/types';

const QUEUE_KEY = 'pending-request-status-updates';

interface StatusUpdate {
  requestId: string;
  status:    string;
  updatedAt: string;
}

function loadQueue(): StatusUpdate[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveQueue(queue: StatusUpdate[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

function enqueueStatusUpdate(requestId: string, status: string) {
  const queue = loadQueue().filter((u) => u.requestId !== requestId);
  queue.push({ requestId, status, updatedAt: new Date().toISOString() });
  saveQueue(queue);
}

function dequeueRequestId(requestId: string) {
  saveQueue(loadQueue().filter((u) => u.requestId !== requestId));
}

export function useRequests(hotelId: string, department?: string | null) {
  const [requests,   setRequests]   = useState<ServiceRequestDTO[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const fetchRequests = useCallback(async () => {
    if (!hotelId) return;
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (department) params.department = department;
      const { data } = await api.get(`/requests/hotel/${hotelId}`, { params });
      setRequests(data.data);
    } finally {
      setLoading(false);
    }
  }, [hotelId, department]);

  const updateRequestStatus = useCallback(async (requestId: string, status: string) => {
    setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: status as any } : r)));
    setPendingIds((prev) => new Set(prev).add(requestId));

    if (!navigator.onLine) {
      enqueueStatusUpdate(requestId, status);
      return;
    }

    try {
      const { data } = await api.patch(`/requests/${requestId}/status`, { status });
      setRequests((prev) => prev.map((r) => (r.id === requestId ? data.data : r)));
      setPendingIds((prev) => { const s = new Set(prev); s.delete(requestId); return s; });
      dequeueRequestId(requestId);
      return data.data as ServiceRequestDTO;
    } catch {
      enqueueStatusUpdate(requestId, status);
    }
  }, []);

  const addRequest = useCallback((request: ServiceRequestDTO) => {
    setRequests((prev) => [request, ...prev]);
  }, []);

  return { requests, loading, fetchRequests, updateRequestStatus, addRequest, setRequests, pendingIds };
}

export function useSyncRequestQueue(
  updateRequestStatus: (requestId: string, status: string) => Promise<any>,
) {
  useEffect(() => {
    const handleOnline = async () => {
      const queue = loadQueue();
      if (queue.length === 0) return;
      saveQueue([]);
      const sorted = [...queue].sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
      for (const { requestId, status } of sorted) {
        await updateRequestStatus(requestId, status);
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [updateRequestStatus]);
}
