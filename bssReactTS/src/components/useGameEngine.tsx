// CHQ: Claude AI generated

import { useEffect } from "react";
import { initGame, destroyGame } from "../game/engine";
import type { Checkpoint } from "../utils/dataTypes";

export function useGameEngine(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  checkpoint: Checkpoint,
  onSave: (data: string) => void,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Parse checkpoint.data blob and pass it to the engine
    const saveData = checkpoint.data ? JSON.parse(checkpoint.data) : null;
    initGame(canvas, saveData, onSave);

    return () => {
      destroyGame(canvas);
    };
  }, [checkpoint.id]); // re-init only if checkpoint changes
}
