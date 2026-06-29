// entities/miscEntities/ReverseExplosion.js

// CHQ: Claude AI (Sonnet) refactored
export class ReverseExplosion {
  constructor(params, gameState) {
    this.gameState = gameState;
    this.transformHeight = params.transformHeight;
    this.primitive = params.primitive || "cylinder_explosions";
    this.lifespan = 1 / params.life;
    this.params = params;
    this.size = params.size;
    this.params.height = this.params.height || 1;
    this.backface = params.backface === undefined ? false : params.backface;
  }

  die(index) {
    this.gameState.objects.explosions.splice(index, 1);
  }

  update(dt, meshes) {
    this.params.life -= dt;
    const s = this.params.life * this.lifespan * this.size;
    meshes[this.primitive].instanceData.push(
      this.params.pos[0],
      this.params.pos[1],
      this.params.pos[2],
      this.params.col[0],
      this.params.col[1],
      this.params.col[2],
      this.params.life * this.lifespan * this.params.alpha,
      this.backface ? -s : s,
      this.transformHeight ? this.params.height : this.params.height / s,
    );
    return this.params.life <= 0;
  }
}
