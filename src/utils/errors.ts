// src/utils/errors.ts

export type ErrorType = "quota" | "auth" | "network" | "model" | "unknown";

export interface ParsedError {
  type: ErrorType;
  message: string;
  userMessage: string;
  details: Record<string, string>;
  suggestion?: string;
}

/**
 * Strip ANSI escape codes from string
 */
export function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
}

/**
 * Parse cursor-agent error output into structured format
 */
export function parseAgentError(stderr: string): ParsedError {
  const clean = stripAnsi(stderr).trim();

  // Quota/usage limit error
  if (clean.includes("usage limit") || clean.includes("hit your usage limit")) {
    const savingsMatch = clean.match(/saved \$(\d+(?:\.\d+)?)/i);
    const resetMatch = clean.match(/reset[^0-9]*(\d{1,2}\/\d{1,2}\/\d{4})/i);
    const modelMatch = clean.match(/continue with (\w+)/i);

    const details: Record<string, string> = {};
    if (savingsMatch) details.savings = `$${savingsMatch[1]}`;
    if (resetMatch) details.resetDate = resetMatch[1];
    if (modelMatch) details.affectedModel = modelMatch[1];

    return {
      type: "quota",
      message: clean,
      userMessage: "You've hit your Cursor usage limit",
      details,
      suggestion: "Switch to a different model or set a Spend Limit in Cursor settings",
    };
  }

  // Authentication error
  if (clean.includes("not logged in") || clean.includes("auth") || clean.includes("unauthorized")) {
    return {
      type: "auth",
      message: clean,
      userMessage: "Not authenticated with Cursor",
      details: {},
      suggestion: "Run: opencode auth login cursor-acp",
    };
  }

  // Network error
  if (clean.includes("ECONNREFUSED") || clean.includes("network") || clean.includes("fetch failed")) {
    return {
      type: "network",
      message: clean,
      userMessage: "Connection to Cursor failed",
      details: {},
      suggestion: "Check your internet connection and try again",
    };
  }

  // Model not found
  if (clean.includes("model not found") || clean.includes("invalid model")) {
    return {
      type: "model",
      message: clean,
      userMessage: "Requested model not available",
      details: {},
      suggestion: "Run: cursor-agent --list-models to see available models",
    };
  }

  // Unknown error
  return {
    type: "unknown",
    message: clean,
    userMessage: clean.substring(0, 200) || "An error occurred",
    details: {},
  };
}

/**
 * Format parsed error for user display
 */
export function formatErrorForUser(error: ParsedError): string {
  let output = `cursor-acp error: ${error.userMessage}`;

  if (Object.keys(error.details).length > 0) {
    const detailParts = Object.entries(error.details)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" | ");
    output += `\n  ${detailParts}`;
  }

  if (error.suggestion) {
    output += `\n  Suggestion: ${error.suggestion}`;
  }

  return output;
}
