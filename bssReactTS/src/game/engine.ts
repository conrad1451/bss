// src/game/engine.ts
// import { setupShaders } from "./GLSLShaders";
// import { buildMap } from "./mapMesh";
// import { main as startMainMenu } from "./index"; // if you export it, or call directly

// import { BeeSwarmSimulator } from "./index";
import { BeeSwarmSimulator } from "./index.js";
import type { Checkpoint } from "../utils/dataTypes";
let animFrameId: number;

export function initGame(checkpoint: Checkpoint) {
  // export function initGame(
  //   canvas: HTMLCanvasElement,
  //   saveData: unknown | null,
  //   onSave?: (data: string) => void,
  // ) {
  //   const gl = canvas.getContext("webgl2");
  //   if (!gl) throw new Error("WebGL2 not supported");

  //   setupShaders(gl);
  //   buildMap(gl);
  //   if (saveData) loadState(saveData); // whatever index.js does to restore state

  //   // Expose save hook so the game loop can call back into React
  //   (window as any).__bssSave = onSave;

  //   // Start the loop (currently lives in index.js — pull it into a startLoop() export)
  //   animFrameId = requestAnimationFrame(gameLoop);

  // TODO: wire these up once vanilla JS is converted
  // setupShaders(gl);
  // buildMap(gl);
  // if (saveData) loadState(saveData);

  //   if (onSave) (window as any).__bssSave = onSave;
  // animFrameId = requestAnimationFrame(gameLoop);
  const saved = checkpoint.data ? JSON.parse(checkpoint.data) : null;

  BeeSwarmSimulator({
    id: checkpoint.id,
    name: checkpoint.title,
    saveCode: saved?.saveCode ?? undefined, // undefined = new game
  });
}

// export function destroyGame(_canvas: HTMLCanvasElement) {
//   cancelAnimationFrame(animFrameId);
//   delete (window as any).__bssSave;
//   // tear down event listeners the game registered
// }

export function destroyGame() {
  const w = window.parent as any;
  if (w.raf) {
    cancelAnimationFrame(w.raf);
    w.raf = undefined;
  }
}
