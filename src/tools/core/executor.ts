import type { IToolExecutor, ExecutionResult } from "./types.js";

/**
 * Executes using the first executor that declares it can handle the toolId.
 */
export async function executeWithChain(
  executors: IToolExecutor[],
  toolId: string,
  args: Record<string, unknown>
): Promise<ExecutionResult> {
  for (const ex of executors) {
    if (ex.canExecute(toolId)) {
      return ex.execute(toolId, args);
    }
  }
  return { status: "error", error: `No executor available for ${toolId}` };
}

