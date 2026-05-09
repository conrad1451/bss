import { gameState } from "../state/gameState";

export class Bee {
  update(dt) {
    // Logic using gameState.player.body.position
    this.moveTo = [
      gameState.player.body.position.x,
      gameState.player.body.position.y,
      gameState.player.body.position.z,
    ];
  }
}
