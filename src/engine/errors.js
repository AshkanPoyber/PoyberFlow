/* ============================================================
   Typed execution errors

   Having a small set of typed errors makes it easy to display
   appropriate messages in the UI and to distinguish between
   user-config errors and infrastructure errors.
   ============================================================ */

export class ExecutionError extends Error {
  constructor(message, { nodeId = null, cause = null } = {}) {
    super(message);
    this.name = "ExecutionError";
    this.nodeId = nodeId;
    this.cause = cause;
  }
}

export class ConfigError extends ExecutionError {
  constructor(message, opts = {}) {
    super(message, opts);
    this.name = "ConfigError";
  }
}

export class NetworkError extends ExecutionError {
  constructor(message, opts = {}) {
    super(message, opts);
    this.name = "NetworkError";
  }
}

export class TimeoutError extends ExecutionError {
  constructor(message, opts = {}) {
    super(message, opts);
    this.name = "TimeoutError";
  }
}

export class CancelledError extends ExecutionError {
  constructor(message = "Execution cancelled", opts = {}) {
    super(message, opts);
    this.name = "CancelledError";
  }
}

export class ExpressionError extends ExecutionError {
  constructor(message, opts = {}) {
    super(message, opts);
    this.name = "ExpressionError";
  }
}

export class StepLimitError extends ExecutionError {
  constructor(message = "Step limit exceeded", opts = {}) {
    super(message, opts);
    this.name = "StepLimitError";
  }
}
