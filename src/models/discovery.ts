import type { ModelInfo, DiscoveryConfig } from "./types.js";

interface CacheEntry {
  models: ModelInfo[];
  timestamp: number;
}

export class ModelDiscoveryService {
  private cache: CacheEntry | null = null;
  private cacheTTL: number;
  private fallbackModels: ModelInfo[];

  constructor(config: DiscoveryConfig = {}) {
    this.cacheTTL = config.cacheTTL || 5 * 60 * 1000; // 5 minutes
    this.fallbackModels = config.fallbackModels || this.getDefaultModels();
  }

  async discover(): Promise<ModelInfo[]> {
    // Check cache
    if (this.cache && Date.now() - this.cache.timestamp < this.cacheTTL) {
      return this.cache.models;
    }

    try {
      const models = await this.queryCursorAgent();
      this.cache = { models, timestamp: Date.now() };
      return models;
    } catch (error) {
      // Return fallback on error
      return this.fallbackModels;
    }
  }

  private async queryCursorAgent(): Promise<ModelInfo[]> {
    // Try multiple discovery methods

    // Method 1: CLI command
    try {
      return await this.queryViaCLI();
    } catch {}

    // Method 2: Parse from help output
    try {
      return await this.queryViaHelp();
    } catch {}

    // Method 3: Return fallback
    return this.fallbackModels;
  }

  private async queryViaCLI(): Promise<ModelInfo[]> {
    try {
      const proc = Bun.spawn(["cursor-agent", "models", "--json"], {
        timeout: 5000,
        stdout: "pipe",
        stderr: "pipe"
      });

      const stdout = await new Response(proc.stdout).text();
      const exitCode = await proc.exited;

      if (exitCode !== 0) {
        throw new Error(`CLI command failed with exit code ${exitCode}`);
      }

      const modelIds = JSON.parse(stdout);
      return modelIds.map((id: string) => ({
        id,
        name: this.formatModelName(id),
        description: `Cursor ${id} model`
      }));
    } catch {
      throw new Error("CLI query failed");
    }
  }

  private async queryViaHelp(): Promise<ModelInfo[]> {
    try {
      const proc = Bun.spawn(["cursor-agent", "--help"], {
        timeout: 5000,
        stdout: "pipe",
        stderr: "pipe"
      });

      const stdout = await new Response(proc.stdout).text();
      const exitCode = await proc.exited;

      if (exitCode !== 0) {
        throw new Error(`Help command failed with exit code ${exitCode}`);
      }

      // Parse models from help text
      const match = stdout.match(/Available models:?\s*([\w\-,\s]+)/i);
      if (match) {
        const modelIds = match[1].split(/,\s*/).map(s => s.trim());
        return modelIds.map((id: string) => ({
          id,
          name: this.formatModelName(id),
          description: `Cursor ${id} model`
        }));
      }

      throw new Error("No models found in help");
    } catch {
      throw new Error("Help query failed");
    }
  }

  private formatModelName(id: string): string {
    // Convert kebab-case to Title Case
    return id
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  private getDefaultModels(): ModelInfo[] {
    return [
      { id: "auto", name: "Auto", description: "Auto-select best model" },
      { id: "gpt-5.2", name: "GPT-5.2" },
      { id: "sonnet-4.5", name: "Sonnet 4.5" },
      { id: "opus-4.5", name: "Opus 4.5" },
      { id: "gemini-3-pro", name: "Gemini 3 Pro" }
    ];
  }

  invalidateCache(): void {
    this.cache = null;
  }
}