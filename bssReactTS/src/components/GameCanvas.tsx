// CHQ: Claude AI generated

import { useEffect, useRef } from "react";
import { useGameEngine } from "./useGameEngine";
import type { Checkpoint } from "../utils/dataTypes";

interface GameCanvasProps {
  checkpoint: Checkpoint;
  onSave?: (data: string) => void; // TODO: make mandatory when wired up
  onExit: () => void;
}

export function GameCanvas({ checkpoint, onSave, onExit }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useGameEngine(canvasRef, checkpoint, onSave);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
      <button
        onClick={onExit}
        style={{ position: "absolute", top: 8, right: 8 }}
      >
        Exit
      </button>
    </div>
  );
}
