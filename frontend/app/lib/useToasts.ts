"use client";

import { useCallback, useEffect, useState } from "react";

export type ToastTone = "info" | "success" | "danger" | "warn";

export type Toast = {
  id: string;
  tone: ToastTone;
  title: string;
  body?: string;
  ttlMs?: number;
};

const subs = new Set<(list: Toast[]) => void>();
let toasts: Toast[] = [];

function emit() {
  for (const fn of subs) fn(toasts);
}

export function pushToast(t: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2, 9);
  const full: Toast = { id, ttlMs: 4200, ...t };
  toasts = [...toasts, full];
  emit();
  if (full.ttlMs) {
    setTimeout(() => dismiss(id), full.ttlMs);
  }
  return id;
}

export function dismiss(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function useToasts() {
  const [list, setList] = useState(toasts);
  useEffect(() => {
    const fn = (l: Toast[]) => setList(l);
    subs.add(fn);
    return () => {
      subs.delete(fn);
    };
  }, []);
  const close = useCallback((id: string) => dismiss(id), []);
  return { toasts: list, push: pushToast, close };
}
