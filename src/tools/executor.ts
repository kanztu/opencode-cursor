import type { ToolRegistry } from "./registry.js";
import type { ToolCall } from "./types.js";

export interface ParsedToolCall {
  name: string;
  arguments: any;
}

export class ToolExecutor {
  constructor(private registry: ToolRegistry) {}

  async execute(toolName: string, args: any): Promise<string> {
    const executor = this.registry.getExecutor(toolName);
    if (!executor) {
      throw new Error(`Tool not found: ${toolName}`);
    }
    return await executor(args);
  }

  parseToolCall(json: string): ParsedToolCall {
    try {
      const parsed = JSON.parse(json);

      // Handle different formats
      if (parsed.tool && parsed.arguments) {
        return {
          name: parsed.tool,
          arguments: parsed.arguments
        };
      }

      if (parsed.name && parsed.arguments) {
        return {
          name: parsed.name,
          arguments: typeof parsed.arguments === "string"
            ? JSON.parse(parsed.arguments)
            : parsed.arguments
        };
      }

      throw new Error("Invalid tool call format");
    } catch (error) {
      throw new Error(`Failed to parse tool call: ${error}`);
    }
  }

  async executeToolCall(toolCall: ToolCall): Promise<string> {
    const args = JSON.parse(toolCall.function.arguments);
    return await this.execute(toolCall.function.name, args);
  }
}