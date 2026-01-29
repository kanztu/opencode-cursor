export { CursorPlugin } from "./plugin.js";
export { createCursorProvider, cursor } from "./provider.js";
export type { ProviderOptions } from "./provider.js";
export { createProxyServer } from "./proxy/server.js";
export { parseOpenAIRequest } from "./proxy/handler.js";
export type { ParsedRequest } from "./proxy/handler.js";
export { createChatCompletionResponse, createChatCompletionChunk } from "./proxy/formatter.js";

// Default export for OpenCode provider usage
export { default } from "./provider.js";

// Backward compatibility - createCursorProvider is already exported above
