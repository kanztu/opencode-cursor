import type { ToolDefinition } from "./types.js";

export function createToolSchemaPrompt(tools: ToolDefinition[]): string {
  if (tools.length === 0) return "";

  const toolDescriptions = tools.map(tool => {
    const params = Object.entries(tool.function.parameters.properties)
      .map(([name, schema]: [string, any]) => {
        const required = tool.function.parameters.required?.includes(name);
        return `  - ${name}${required ? " (required)" : ""}: ${schema.type}`;
      })
      .join("\n");

    const paramExamples = Object.keys(tool.function.parameters.properties)
      .map(k => `"${k}": "..."`)
      .join(", ");

    return `## Tool: ${tool.function.name}
${tool.function.description}
Parameters:
${params || "  (none)"}

Usage: {"tool": "${tool.function.name}", "arguments": {${paramExamples}}}`;
  });

  return `You have access to the following tools. Use them when needed:

${toolDescriptions.join("\n\n")}

When you need to use a tool, output ONLY the JSON object. The system will execute it and return the result.`;
}