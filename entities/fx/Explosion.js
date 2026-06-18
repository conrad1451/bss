class Explosion {
  constructor(params) {
    this.lifespan = 1 / params.life;
    this.params = params;
    this.size = this.reverse ? params.size : 0;
    this.params.height = this.params.height || 1;
    this.maxAlpha = params.maxAlpha || 1;
    this.backface = params.backface === undefined ? false : params.backface;
    this.primitive = params.primitive || "explosions";
  }

  die(index) {
    objects.explosions.splice(index, 1);
  }

  update() {
    this.params.life -= dt;
    this.size += Math.max(
      (this.params.size - this.size) * this.params.speed,
      this.params.aftershock,
    );

    meshes[this.primitive].instanceData.push(
      this.params.pos[0],
      this.params.pos[1],
      this.params.pos[2],
      this.params.col[0],
      this.params.col[1],
      this.params.col[2],
      Math.min(this.params.life * this.lifespan, this.maxAlpha),
      this.backface ? -this.size : this.size,
      this.params.height,
    );

    return this.params.life <= 0;
  }
}
