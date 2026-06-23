class FireTrail {
  constructor(pos) {
    this.life = 7.5;
    this.pos = pos;
    this.damageTimer = 0;
    this.particleTimer = 0;
  }

  die(index) {
    objects.mobs.splice(index, 1);
  }

  update() {
    this.life -= dt;
    this.damageTimer -= dt;
    this.particleTimer -= dt;

    if (this.particleTimer <= 0) {
      this.particleTimer = 0.75;
      ParticleRenderer.add({
        x: this.pos[0] + MATH.random(-0.5, 0.5),
        y: this.pos[1],
        z: this.pos[2] + MATH.random(-0.5, 0.5),
        vx: 0,
        vy: 0,
        vz: 0,
        grav: 0,
        size: 200,
        col: [0.9, 0, 0],
        life: 2,
        rotVel: MATH.random(-0.3, 0.3),
        alpha: 2,
      });
    }

    if (
      this.damageTimer <= 0 &&
      Math.abs(player.body.position.x - this.pos[0]) +
        Math.abs(player.body.position.y - this.pos[1]) +
        Math.abs(player.body.position.z - this.pos[2]) <
        0.75
    ) {
      this.damageTimer = 1;
      player.damage(8);
    }

    return this.life <= 0;
  }
}
