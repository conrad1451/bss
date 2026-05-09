// bssReactTS/src/game/engine.ts
import { BeeSwarmSimulator } from "./index.js";
import type { Checkpoint } from "../utils/dataTypes";

export function initGame(
  checkpoint: Checkpoint,
  onSave: (data: string) => void,
) {
  // Bind the React onSave handler to a global window property
  // so index.js can call it
  (window as any).__bssSave = onSave;

  const saved = checkpoint.data ? JSON.parse(checkpoint.data) : null;

  BeeSwarmSimulator({
    id: checkpoint.id,
    name: checkpoint.title,
    saveCode: saved?.saveCode ?? undefined,
  });
}

export function destroyGame() {
  const w = window.parent as any;
  if (w.raf) {
    cancelAnimationFrame(w.raf);
    w.raf = undefined;
  }
  delete (window as any).__bssSave; // Cleanup
}
