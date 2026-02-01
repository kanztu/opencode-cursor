# OpenCode-Cursor Setup Guide

## Installation

### Prerequisites
- **Bun**: Install with `curl -fsSL https://bun.sh/install | bash`
- **cursor-agent**: Install with `curl -fsS https://cursor.com/install | bash`
- **OpenCode**: Install from https://opencode.ai
- **cursor-agent authentication**: Run `cursor-agent login` and complete browser authentication

### Automated Installation
```bash
./cmd/installer/installer-binary
```

The installer will:
1. Check prerequisites (bun, cursor-agent, opencode)
2. Build the plugin (`bun install && bun run build`)
3. Install AI SDK (`@ai-sdk/openai-compatible`) to OpenCode
4. Create symlink in `~/.config/opencode/node_modules/opencode-cursor`
5. Update `~/.config/opencode/opencode.json` with plugin and provider config
6. Validate configuration
7. Verify plugin loads correctly

### Manual Installation

If you prefer manual setup:

1. **Build the plugin:**
   ```bash
   cd /path/to/opencode-cursor
   bun install
   bun run build
   ```

2. **Install AI SDK to OpenCode:**
   ```bash
   cd ~/.config/opencode
   bun install @ai-sdk/openai-compatible
   ```

3. **Create symlink:**
   ```bash
   ln -sf /path/to/opencode-cursor ~/.config/opencode/node_modules/opencode-cursor
   ```

4. **Update `~/.config/opencode/opencode.json`:**
   ```json
   {
     "plugin": [
       "opencode-cursor"
     ],
     "provider": {
       "cursor-acp": {
         "name": "Cursor Agent (ACP stdin)",
         "npm": "@ai-sdk/openai-compatible",
         "options": {
           "baseURL": "http://127.0.0.1:32124/v1"
         },
         "models": {
           "auto": { "name": "Cursor Agent Auto" },
           "composer-1": { "name": "Cursor Agent Composer 1" },
           "sonnet-4.5": { "name": "Cursor Agent Claude 4.5 Sonnet" },
           ...
         }
       }
     }
   }
   ```

## How It Works

### Architecture
1. **OpenCode** loads the plugin from `node_modules/opencode-cursor`
2. **Plugin** starts a Node.js HTTP proxy server on port 32124
3. **Plugin hook** (`chat.params`) overrides the baseURL for cursor-acp requests
4. **Proxy server** spawns `cursor-agent` for each request
5. **cursor-agent** processes the request and returns JSON events
6. **Proxy** forwards the response back to OpenCode

### Request Flow
```
OpenCode → @ai-sdk/openai-compatible → Plugin Hook → Proxy (port 32124) → cursor-agent → Response
```

### Key Files
- **`dist/index.js`** - Built plugin (default export is CursorPlugin)
- **`src/plugin.ts`** - Plugin implementation with proxy server
- **`src/provider.ts`** - Alternative provider implementation (not currently used)
- **`cmd/installer/`** - TUI installer

## Usage

### CLI
```bash
opencode run "your question here" --model cursor-acp/auto
```

### TUI
```bash
opencode
```
Then select any `cursor-acp/*` model from the model picker.

### Available Models
- `auto` - Cursor's auto model (free, 0 multiplier)
- `sonnet-4.5` - Claude 4.5 Sonnet
- `opus-4.5` - Claude 4.5 Opus
- `gemini-3-pro` - Gemini 3 Pro
- `gpt-5.2` - GPT-5.2
- And many more (see config for full list)

## Troubleshooting

### "cursor-agent not responding" or timeouts
- Ensure cursor-agent is authenticated: `cursor-agent login`
- Test cursor-agent directly: `cursor-agent --print "test"`

### "undefined/chat/completions" error
- Plugin isn't loaded or proxy server didn't start
- Check that symlink exists: `ls -la ~/.config/opencode/node_modules/opencode-cursor`
- Check that AI SDK is installed: `ls ~/.config/opencode/node_modules/@ai-sdk/`

### "Workspace path does not exist" error
- Restart the proxy by killing old processes: `pkill -f "node.*32124"`
- Run opencode from a valid directory (not `/tmp`)

### Port 32124 already in use
- The proxy will automatically use a different port if 32124 is taken
- Or manually kill the process: `lsof -i :32124` then `kill <PID>`

## Uninstallation
```bash
./cmd/installer/installer-binary
# Press 'u' for uninstall
```

This will remove:
- Symlink from `~/.config/opencode/node_modules/opencode-cursor`
- Plugin entry from opencode.json
- Provider configuration
- AI SDK package

## Development

### Building
```bash
bun run build
```

### Testing
```bash
# Test the proxy directly
curl -X POST http://127.0.0.1:32124/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"auto","messages":[{"role":"user","content":"test"}]}'

# Test with OpenCode
opencode run "test" --model cursor-acp/auto
```

### Debug Mode
```bash
# Installer debug mode
./cmd/installer/installer-binary --debug

# Check logs
tail -f /tmp/opencode-cursor-installer-*.log
```

## Important Notes

- **Must run cursor-agent login first** - cursor-agent requires authentication
- **Needs @ai-sdk/openai-compatible** - The npm provider package is required
- **Both plugin AND provider config needed** - Plugin provides the proxy, provider config tells OpenCode how to use it
- **Proxy uses Node.js http server** - Works in Node.js runtime (not Bun-only)
- **Auto-spawns cursor-agent** - No need to run cursor-agent separately
