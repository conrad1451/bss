import { useEffect } from "react";
import { initGame, destroyGame } from "../game/engine";
import type { Checkpoint } from "../utils/dataTypes";

// CHQ: Gemini AI refactored
export function useGameEngine(
  glRef: React.RefObject<HTMLCanvasElement | null>, // Allow null
  uiRef: React.RefObject<HTMLCanvasElement | null>, // Allow null
  texRef: React.RefObject<HTMLCanvasElement | null>, // Allow null
  checkpoint: Checkpoint,
  onSave: (data: string) => void, // Pass the save handler
) {
  useEffect(() => {
    if (!glRef.current || !uiRef.current || !texRef.current) return;

    initGame(checkpoint, onSave);

    return () => {
      destroyGame();
    };
  }, [checkpoint.id, onSave]);
}
