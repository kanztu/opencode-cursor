/**
 * Minimal entrypoint for the OpenCode plugin loader.
 * Exports only the CursorPlugin to avoid non-plugin exports being
 * treated as plugins by OpenCode.
 */
import { CursorPlugin } from "./plugin.js";

export default CursorPlugin;
