/* ============================================================
   Logger — structured logs appended to runtime.logs.

   Cap is enforced here so callers don't have to think about it.
   ============================================================ */

export const MAX_LOGS = 500;

export function makeLog({ level, nodeId = null, message, data = null }) {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    level, // 'info' | 'success' | 'error' | 'warning'
    nodeId,
    message,
    data,
  };
}

export function appendLog(logs, log) {
  const next = [...logs, log];
  if (next.length > MAX_LOGS) {
    return next.slice(next.length - MAX_LOGS);
  }
  return next;
}
