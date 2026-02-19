# Docker: OpenAI-compatible API (serve)

Run the `open-cursor serve` proxy in Docker so any OpenAI-compatible client can call the Cursor API.

## Build

From the repo root (e.g. your fork):

```bash
docker build -t opencode-cursor-serve .
```

## Secrets / auth

The proxy spawns **cursor-agent**, which must be authenticated to the Cursor API. Use **one** of these:

### Option A – Mount your config directory (simplest for local Docker)

If you already ran `cursor-agent login` on your machine, mount the directory that contains `cli-config.json` into the container. The container’s `$HOME` is `/root`, so use one of:

```bash
# Linux (config usually in ~/.config/cursor)
docker run --rm -v "$HOME/.config/cursor:/root/.config/cursor:ro" -p 32124:32124 opencode-cursor-serve

# macOS (config often in ~/.cursor)
docker run --rm -v "$HOME/.cursor:/root/.cursor:ro" -p 32124:32124 opencode-cursor-serve
```

No env vars or secrets needed. Use `:ro` so the container cannot change the file.

### Option B – API key (for CI/GitHub when available)

Cursor’s [headless docs](https://cursor.com/docs/cli/headless) mention `CURSOR_API_KEY` for scripts. If your Cursor account exposes an API key for headless/automation (e.g. in [Cursor settings](https://cursor.com/settings) or account), set it when running the container:

```bash
docker run --rm -e CURSOR_API_KEY="your_api_key_here" -p 32124:32124 opencode-cursor-serve
```

**Where to get it:** Check [cursor.com/settings](https://cursor.com/settings) (or Cursor app → Settings) for an “API” or “Headless” / “CLI” section. If there is no API key option, Cursor may only support login-based auth; use Option A (mount) or Option C (config JSON) instead.

### Option C – Config JSON in an env var (for CI/GitHub without mount)

When you can’t mount a directory (e.g. GitHub Actions), pass the **contents** of the auth file:

1. On your machine run: `cursor-agent login` and complete the browser flow.
2. Copy the auth file:
   - **Linux:** `cat ~/.config/cursor/cli-config.json`
   - **macOS:** `cat ~/.cursor/cli-config.json` or `cat ~/.config/cursor/cli-config.json`
3. Store that **entire JSON** as a secret (e.g. `CURSOR_CLI_CONFIG_JSON`) and pass it into the container. The image entrypoint writes it to `$HOME/.config/cursor/cli-config.json` before starting the server.

**GitHub Actions:** Add secret `CURSOR_CLI_CONFIG_JSON` in repo Settings → Secrets and variables → Actions, then in the workflow pass `CURSOR_CLI_CONFIG_JSON: ${{ secrets.CURSOR_CLI_CONFIG_JSON }}` into the container env.

**Security:** All of these are sensitive. Never commit them; use GitHub Secrets or your platform’s secret store.

## Run

```bash
# A. Mount config dir (easiest if you already ran cursor-agent login)
docker run --rm -v "$HOME/.config/cursor:/root/.config/cursor:ro" -p 32124:32124 opencode-cursor-serve
# or on macOS: -v "$HOME/.cursor:/root/.cursor:ro"

# B. API key (if your account has one)
docker run --rm -e CURSOR_API_KEY="your_api_key" -p 32124:32124 opencode-cursor-serve

# C. Config JSON in env (e.g. for CI)
docker run --rm -e CURSOR_CLI_CONFIG_JSON="$(cat ~/.config/cursor/cli-config.json)" -p 32124:32124 opencode-cursor-serve
```

Then use base URL **http://localhost:32124/v1** (health: `GET /health`, chat: `POST /v1/chat/completions`).

## Optional: build and push with GitHub Actions

Example workflow to build and push the image to GitHub Container Registry (GHCR) for your fork:

```yaml
# .github/workflows/docker-publish.yml
name: Docker publish

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: |
            ghcr.io/${{ github.repository }}:latest
            ghcr.io/${{ github.repository }}:${{ github.sha }}
```

For **kanztu/opencode-cursor** the image would be `ghcr.io/kanztu/opencode-cursor:latest`. At **runtime** (when you run the container), pass the secret as env: `-e CURSOR_API_KEY=${{ secrets.CURSOR_API_KEY }}` or `-e CURSOR_CLI_CONFIG_JSON=${{ secrets.CURSOR_CLI_CONFIG_JSON }}`.
