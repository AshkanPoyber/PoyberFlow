/* ============================================================
   HTTP Fetcher — a small, focused wrapper around fetch()
   with timeout and cancellation.

   Headers and query are parsed from the node's simple textarea
   format:
     "Content-Type: application/json"
     "Authorization: Bearer xyz"

   Empty lines and lines starting with '#' are ignored.
   ============================================================ */

import { NetworkError, TimeoutError, CancelledError } from "./errors.js";
import { interpolateString } from "./expression.js";

const MAX_TIMEOUT_MS = 30_000;

export async function performHttpRequest({
  node,
  context,
  nodeIdMap,
  abortSignal,
}) {
  const data = node.data || {};
  const method = (data.method || "GET").toUpperCase();
  const rawUrl = (data.url || "").trim();

  if (!rawUrl) {
    throw new NetworkError("URL is empty", { nodeId: node.id });
  }

  const url = interpolateString(rawUrl, context, nodeIdMap);

  const headers = parseKeyValueBlock(
    interpolateString(data.headers || "", context, nodeIdMap),
  );
  const query = parseKeyValueBlock(
    interpolateString(data.query || "", context, nodeIdMap),
  );

  const finalUrl = appendQuery(url, query);

  const timeout = Math.min(
    Number.isFinite(Number(data.timeout)) ? Number(data.timeout) : 10_000,
    MAX_TIMEOUT_MS,
  );

  const body =
    method === "GET" || method === "DELETE"
      ? undefined
      : interpolateString(data.body || "", context, nodeIdMap) || undefined;

  return withTimeoutAndCancel(
    doFetch(finalUrl, { method, headers, body }),
    timeout,
    abortSignal,
    node.id,
  );
}

async function doFetch(url, { method, headers, body }) {
  let response;
  try {
    response = await fetch(url, { method, headers, body });
  } catch (err) {
    throw new NetworkError(err.message || "Fetch failed", { cause: err });
  }

  const text = await response.text();
  let parsed = text;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Keep raw text if not JSON
  }

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    body: parsed,
  };
}

function withTimeoutAndCancel(promise, timeoutMs, abortSignal, nodeId) {
  return new Promise((resolve, reject) => {
    let settled = false;

    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(
        new TimeoutError(`Request timed out after ${timeoutMs}ms`, { nodeId }),
      );
    }, timeoutMs);

    const onAbort = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new CancelledError("Request cancelled", { nodeId }));
    };

    if (abortSignal) {
      if (abortSignal.aborted) return onAbort();
      abortSignal.addEventListener("abort", onAbort);
    }

    promise.then(
      (v) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(v);
      },
      (err) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(err);
      },
    );

    function cleanup() {
      clearTimeout(timeoutId);
      if (abortSignal) abortSignal.removeEventListener("abort", onAbort);
    }
  });
}

/* ---------- Helpers ---------- */

export function parseKeyValueBlock(text) {
  const result = {};
  if (!text || typeof text !== "string") return result;

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    if (!key) continue;

    result[key] = value;
  }

  return result;
}

function appendQuery(url, query) {
  const entries = Object.entries(query);
  if (entries.length === 0) return url;

  const sep = url.includes("?") ? "&" : "?";
  const qs = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  return url + sep + qs;
}
