/* ============================================================
   Expression evaluator + interpolator

   Two responsibilities:

   1. Interpolate `{{path}}` tokens inside strings.
      Example:
        "Hello, {{start.data.name}}"
        "{{last.data.value}}"

   2. Evaluate simple boolean expressions for the IF node:
        user.age >= 18
        count > 0 && count < 10

   No `eval`. No `Function()`. The parser is intentionally small
   and only supports what IF and URLs realistically need.
   ============================================================ */

import { ExpressionError } from "./errors.js";

/* ============================================================
   1. Interpolator — replaces {{...}} tokens with values
   ============================================================ */

const TOKEN_RE = /\{\{\s*([^}]+?)\s*\}\}/g;

/**
 * Resolve a dotted path against the execution context.
 * Supported paths:
 *   start.data.name        → context.results["start-id"].data.name
 *   <nodeId>.data.field    → resolved by looking up node id first
 *   last.data.value        → context.results[context.lastNodeId].data.value
 */
export function resolvePath(context, nodeIdMap, path) {
  const parts = path
    .split(".")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return undefined;

  let root;
  if (parts[0] === "last") {
    if (!context.lastNodeId) return undefined;
    root = context.results[context.lastNodeId];
    parts.shift();
  } else if (parts[0] === "vars") {
    root = context.variables;
    parts.shift();
  } else {
    // Try to resolve by literal node id, then by node type name.
    const head = parts.shift();
    let realId = head;
    if (!context.results[head] && nodeIdMap) {
      realId = nodeIdMap[head] ?? head;
    }
    root = context.results[realId];
  }

  for (const part of parts) {
    if (root == null) return undefined;
    root = root[part];
  }
  return root;
}

/**
 * Replace every {{token}} in a string with its resolved value.
 * Non-string values are stringified. Missing paths resolve to ''.
 */
export function interpolateString(template, context, nodeIdMap) {
  if (typeof template !== "string") return template;
  return template.replace(TOKEN_RE, (_, rawPath) => {
    const value = resolvePath(context, nodeIdMap, rawPath);
    if (value == null) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  });
}

/* ============================================================
   2. Expression parser — small recursive-descent evaluator

   Grammar (informal):
     expr      := or
     or        := and ( '||' and )*
     and       := not ( '&&' not )*
     not       := '!' not | comparison
     comparison:= primary ( ('==' | '!=' | '<=' | '>=' | '<' | '>') primary )?
     primary   := number | string | true | false | null | path | '(' expr ')'
   ============================================================ */

export function evaluateExpression(source, context, nodeIdMap) {
  if (!source || typeof source !== "string") {
    throw new ExpressionError("Expression is empty");
  }

  const tokens = tokenize(source);
  const parser = createParser(tokens, context, nodeIdMap);
  const value = parser.parseExpression();
  parser.expectEnd();
  return Boolean(value);
}

/* ---------- Tokenizer ---------- */

function tokenize(src) {
  const tokens = [];
  let i = 0;

  while (i < src.length) {
    const ch = src[i];

    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }

    // Multi-char operators
    const two = src.slice(i, i + 2);
    if (["==", "!=", "<=", ">=", "&&", "||"].includes(two)) {
      tokens.push({ kind: "op", value: two });
      i += 2;
      continue;
    }

    // Single-char operators / punctuation
    if ("<>!()".includes(ch)) {
      tokens.push({ kind: "op", value: ch });
      i += 1;
      continue;
    }

    // String
    if (ch === '"' || ch === "'") {
      const quote = ch;
      i += 1;
      let value = "";
      while (i < src.length && src[i] !== quote) {
        if (src[i] === "\\" && i + 1 < src.length) {
          value += src[i + 1];
          i += 2;
        } else {
          value += src[i];
          i += 1;
        }
      }
      if (src[i] !== quote) {
        throw new ExpressionError(`Unterminated string in expression`);
      }
      i += 1;
      tokens.push({ kind: "literal", value });
      continue;
    }

    // Number
    if (/\d/.test(ch) || (ch === "." && /\d/.test(src[i + 1] || ""))) {
      let num = "";
      while (i < src.length && /[\d.]/.test(src[i])) {
        num += src[i];
        i += 1;
      }
      const n = Number(num);
      if (!Number.isFinite(n)) {
        throw new ExpressionError(`Invalid number: ${num}`);
      }
      tokens.push({ kind: "literal", value: n });
      continue;
    }

    // Identifier / keyword / path
    if (/[A-Za-z_$]/.test(ch)) {
      let id = "";
      while (i < src.length && /[A-Za-z0-9_$.]/.test(src[i])) {
        id += src[i];
        i += 1;
      }
      if (id === "true") tokens.push({ kind: "literal", value: true });
      else if (id === "false") tokens.push({ kind: "literal", value: false });
      else if (id === "null") tokens.push({ kind: "literal", value: null });
      else tokens.push({ kind: "path", value: id });
      continue;
    }

    throw new ExpressionError(`Unexpected character: ${ch}`);
  }

  return tokens;
}

/* ---------- Parser ---------- */

function createParser(tokens, context, nodeIdMap) {
  let pos = 0;

  function peek() {
    return tokens[pos] || null;
  }
  function next() {
    return tokens[pos++] || null;
  }
  function expectEnd() {
    if (pos !== tokens.length) {
      throw new ExpressionError("Unexpected token at end of expression");
    }
  }

  function parseExpression() {
    return parseOr();
  }

  function parseOr() {
    let left = parseAnd();
    while (peek()?.kind === "op" && peek().value === "||") {
      next();
      const right = parseAnd();
      left = Boolean(left) || Boolean(right);
    }
    return left;
  }

  function parseAnd() {
    let left = parseNot();
    while (peek()?.kind === "op" && peek().value === "&&") {
      next();
      const right = parseNot();
      left = Boolean(left) && Boolean(right);
    }
    return left;
  }

  function parseNot() {
    if (peek()?.kind === "op" && peek().value === "!") {
      next();
      return !parseNot();
    }
    return parseComparison();
  }

  function parseComparison() {
    const left = parsePrimary();
    const op = peek();
    if (
      op &&
      op.kind === "op" &&
      ["==", "!=", "<=", ">=", "<", ">"].includes(op.value)
    ) {
      next();
      const right = parsePrimary();
      switch (op.value) {
        case "==":
          return left == right; // eslint-disable-line eqeqeq
        case "!=":
          return left != right; // eslint-disable-line eqeqeq
        case "<=":
          return left <= right;
        case ">=":
          return left >= right;
        case "<":
          return left < right;
        case ">":
          return left > right;
      }
    }
    return left;
  }

  function parsePrimary() {
    if (peek()?.kind === "op" && peek().value === "(") {
      next();
      const v = parseExpression();
      const closing = next();
      if (!closing || closing.value !== ")") {
        throw new ExpressionError("Missing closing parenthesis");
      }
      return v;
    }

    const token = next();
    if (!token) throw new ExpressionError("Unexpected end of expression");

    if (token.kind === "literal") return token.value;
    if (token.kind === "path")
      return resolvePath(context, nodeIdMap, token.value);

    throw new ExpressionError(`Unexpected token: ${token.value}`);
  }

  return { parseExpression, expectEnd };
}
