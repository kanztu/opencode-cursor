#!/bin/sh
set -e

# Cursor API auth: use one of the following.
#
# Option A – Mount config dir (no env needed)
#   docker run -v "$HOME/.config/cursor:/root/.config/cursor:ro" ...
#
# Option B – API key
#   Set env CURSOR_API_KEY=your_api_key_here (see Cursor headless docs).
#
# Option C – Full config from env (for CI)
#   Set env CURSOR_CLI_CONFIG_JSON to the contents of cli-config.json.
#   Get it: cursor-agent login, then cat ~/.config/cursor/cli-config.json (or ~/.cursor/cli-config.json on macOS)
if [ -n "$CURSOR_CLI_CONFIG_JSON" ]; then
  CURSOR_CONFIG_DIR="${CURSOR_CONFIG_DIR:-$HOME/.config/cursor}"
  mkdir -p "$CURSOR_CONFIG_DIR"
  echo "$CURSOR_CLI_CONFIG_JSON" > "$CURSOR_CONFIG_DIR/cli-config.json"
  echo "Cursor auth config written to $CURSOR_CONFIG_DIR/cli-config.json"
fi

exec "$@"
