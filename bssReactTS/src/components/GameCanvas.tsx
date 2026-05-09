// CHQ: Claude AI generated

import { useEffect, useRef } from "react";
import { useGameEngine } from "./useGameEngine";
import type { Checkpoint } from "../utils/dataTypes";

interface GameCanvasProps {
  checkpoint: Checkpoint;
  onSave?: (data: string) => void; // TODO: make mandatory when wired up
  onExit: () => void;
}

export function GameCanvas({ checkpoint, onExit }: GameCanvasProps) {
  // export function GameCanvas({ checkpoint, onSave, onExit }: GameCanvasProps) {
  const glRef = useRef<HTMLCanvasElement>(null);
  const uiRef = useRef<HTMLCanvasElement>(null);
  const texRef = useRef<HTMLCanvasElement>(null);

  useGameEngine(glRef, uiRef, texRef, checkpoint);

  // const canvasRef = useRef<HTMLCanvasElement>(null);
  // useGameEngine(canvasRef, checkpoint, onSave);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <canvas
        id="gl-canvas"
        ref={glRef}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      <canvas
        id="ui-canvas"
        ref={uiRef}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      <canvas id="tex-canvas" ref={texRef} style={{ display: "none" }} />
      <button
        onClick={onExit}
        style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}
      >
        Exit
      </button>
    </div>
  );
}
