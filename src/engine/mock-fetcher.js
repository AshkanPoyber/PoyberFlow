/* ============================================================
   Mock Fetcher — for development and demos.

   Activated by:
     - query param `?mock=1`, OR
     - `__poyberflow.setMockMode(true)` in the console.

   Behaviour:
     - Simulates network latency (200–800ms).
     - Returns pattern-based responses for a few common paths.
     - Falls back to a generic { ok: true, echo } payload.
   ============================================================ */

import { CancelledError } from "./errors.js";

let mockEnabled = false;

export function setMockMode(enabled) {
  mockEnabled = Boolean(enabled);
}

export function isMockMode() {
  return mockEnabled;
}

export async function mockFetch({ url, method, body, abortSignal }) {
  const delay = 200 + Math.random() * 600;

  await sleep(delay, abortSignal);

  if (method === "GET" || method === "DELETE") {
    return makeGetResponse(url);
  }

  return {
    ok: true,
    status: 200,
    statusText: "OK",
    headers: { "content-type": "application/json" },
    body: {
      ok: true,
      method,
      url,
      received: safeParse(body),
      mockedAt: new Date().toISOString(),
    },
  };
}

/* ---------- Pattern responses ---------- */

function makeGetResponse(url) {
  const path = safePath(url);

  if (/\/users(\/|$)/.test(path)) {
    return jsonResponse(200, {
      users: [
        { id: 1, name: "Ada Lovelace", age: 36 },
        { id: 2, name: "Alan Turing", age: 41 },
        { id: 3, name: "Grace Hopper", age: 85 },
      ],
    });
  }

  if (/\/posts(\/|$)/.test(path)) {
    return jsonResponse(200, {
      posts: [
        { id: 1, title: "Hello, PoyberFlow", userId: 1 },
        { id: 2, title: "Visual workflows", userId: 1 },
      ],
    });
  }

  if (/\/todos(\/|$)/.test(path)) {
    return jsonResponse(200, {
      todos: [
        { id: 1, title: "Try PoyberFlow", completed: false },
        { id: 2, title: "Build a workflow", completed: false },
      ],
    });
  }

  if (/\/health(\/|$)/.test(path)) {
    return jsonResponse(200, { status: "ok" });
  }

  return jsonResponse(200, {
    ok: true,
    url,
    mocked: true,
    timestamp: Date.now(),
  });
}

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "",
    headers: { "content-type": "application/json" },
    body,
  };
}

function safeParse(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function safePath(url) {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

function sleep(ms, abortSignal) {
  return new Promise((resolve, reject) => {
    if (abortSignal?.aborted) {
      reject(new CancelledError("Mock request cancelled"));
      return;
    }

    const t = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);

    function onAbort() {
      clearTimeout(t);
      cleanup();
      reject(new CancelledError("Mock request cancelled"));
    }

    function cleanup() {
      abortSignal?.removeEventListener("abort", onAbort);
    }

    abortSignal?.addEventListener("abort", onAbort);
  });
}
