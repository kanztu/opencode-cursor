#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALLER_BIN="/tmp/opencode-cursor-installer-$$"

echo "OpenCode-Cursor Installer"
echo "========================="
echo ""

# Check for Go
if ! command -v go &> /dev/null; then
    echo "Error: Go is not installed"
    echo "Please install Go 1.21 or later from https://golang.org/dl/"
    exit 1
fi

# Build installer
echo "Building installer..."
cd "$SCRIPT_DIR"
go build -o "$INSTALLER_BIN" ./cmd/installer

# Run installer
echo ""
"$INSTALLER_BIN" "$@"
EXIT_CODE=$?

# Cleanup
rm -f "$INSTALLER_BIN"

exit $EXIT_CODE
