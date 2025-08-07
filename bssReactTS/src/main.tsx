import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import GameApp from "./GameApp.tsx";

const myChoice: number = 2;

createRoot(document.getElementById("root")!).render(
  <StrictMode>{myChoice === 1 ? <App /> : <GameApp />}</StrictMode>
);
