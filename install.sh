#!/bin/bash
set -e

# OpenCode-Cursor one-line installer
# Usage: curl -fsSL https://raw.githubusercontent.com/nomadcxx/opencode-cursor/main/install.sh | bash

echo "OpenCode-Cursor Installer"
echo "========================="
echo ""

# Check for Go
if ! command -v go &> /dev/null; then
    echo "Error: Go is not installed"
    echo "Please install Go 1.21 or later from https://golang.org/dl/"
    exit 1
fi

# Permanent installation directory in user's home
INSTALL_DIR="${HOME}/.local/share/opencode-cursor"

echo "Installing to: ${INSTALL_DIR}"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo "Downloading opencode-cursor..."
if [ -d ".git" ]; then
    git pull origin main
else
    git clone --depth 1 https://github.com/nomadcxx/opencode-cursor.git .
fi

echo "Building installer..."
go build -o ./installer ./cmd/installer

echo ""
echo "Running installer..."
echo ""

# Run the installer in the permanent directory
./installer "$@"

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "Installation complete!"
    echo ""
    echo "Plugin installed to: ${HOME}/.config/opencode/plugin/cursor-acp.js"
    echo "Repository kept at: ${INSTALL_DIR} (for uninstall: cd ${INSTALL_DIR} && ./installer --uninstall)"
else
    echo "Installation failed with exit code $EXIT_CODE"
    echo "Repository kept at: ${INSTALL_DIR} for investigation"
fi

exit $EXIT_CODE
