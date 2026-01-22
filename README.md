# opencode-cursor

A lightweight OpenCode plugin for Cursor Agent integration via stdin (fixes E2BIG errors).

## Background

[PR #5095](https://github.com/sst/opencode/pull/5095) by [@rinardmclern](https://github.com/rinardmclern) proposed native ACP support for OpenCode. The OpenCode maintainers decided not to merge it, so this plugin provides an alternative solution as a standalone tool.

## Problem Solved

`opencode-cursor-auth` passes prompts as CLI arguments → causes `E2BIG: argument list too long` errors.

This plugin uses stdin/stdout to bypass argument length limits.

## Installation

### Quick Install (Recommended)

```bash
git clone https://github.com/nomadcxx/opencode-cursor.git
cd opencode-cursor
./install.sh
```

The installer will:
- Check prerequisites (bun, cursor-agent)
- Build the TypeScript plugin
- Create symlink to OpenCode plugin directory
- Update opencode.json with cursor-acp provider
- Validate the configuration

### Manual Installation

```bash
# Install dependencies and build
bun install
bun run build

# Create plugin directory
mkdir -p ~/.config/opencode/plugin

# Symlink plugin
ln -s $(pwd)/dist/index.js ~/.config/opencode/plugin/cursor-acp.js

# Add to ~/.config/opencode/opencode.json:
# {
#   "provider": {
#     "cursor-acp": {
#       "npm": "@ai-sdk/openai-compatible",
#       "name": "Cursor Agent (ACP stdin)",
#       "options": {
#         "baseURL": "http://127.0.0.1:32123/v1"
#       }
#     }
#   }
# }
```

## Usage

OpenCode will automatically use this provider when configured. Select `cursor-acp/auto` as your model.

## Features

- ✅ Passes prompts via stdin (fixes E2BIG)
- ✅ Full streaming support with proper buffering
- ✅ Tool calling support
- ✅ Minimal complexity (~200 lines)
- ✅ TUI installer with animated terminal art
- ✅ Pre/post install validation

## Prerequisites

- [Bun](https://bun.sh/) - JavaScript runtime
- [cursor-agent](https://cursor.com/) - Cursor CLI tool
- [Go 1.21+](https://golang.org/) - For building installer

## Development

```bash
# Install dependencies
bun install

# Build plugin
bun run build

# Watch mode
bun run dev

# Run installer in debug mode
./install.sh --debug
```

## License

ISC
