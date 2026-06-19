class Spike {
  constructor(bee) {
    this.bee = bee;
    this.target =
      player.attacked.length > 0
        ? player.attacked[(Math.random() * player.attacked.length) | 0]
        : false;
    this.life = 1;

    if (this.target) {
      this.y = this.target.pos[1] + MATH.random(-4, -1);
      this.pos = [
        this.target.pos[0] + MATH.random(-1, 1),
        this.y - 5,
        this.target.pos[2] + MATH.random(-1, 1),
        0,
      ];
    }
  }

  die(index) {
    objects.mobs.splice(index, 1);
  }

  update() {
    if (!this.target) return true;

    this.life -= dt;

    if (this.life > 0.5) {
      this.pos[1] += (this.y - this.pos[1]) * dt * 22.5;

      if (!this.hitTarget && this.life < 0.75) {
        this.hitTarget = true;

        let d =
          this.target.health * 0.05 +
          (this.bee.attack +
            player[beeInfo[this.bee.type].color + "BeeAttack"]) *
            player.beeAttack;

        if (d > 1000) {
          d = Math.sqrt((d - 1000) * 0.1) * 10 + 1000;
        }

        if (
          !this.target.lastTimeImpaled ||
          TIME - this.target.lastTimeImpaled > 5
        ) {
          this.target.impaledSessionCount = 0;
        }

        d *= 1 - Math.min(this.target.impaledSessionCount, 20) * 0.0375;

        d *= MATH.random(0.740740741, 1.35);

        this.target.damage(d);

        this.target.impaledSessionCount++;
        this.target.lastTimeImpaled = TIME;
      }
    } else {
      this.pos[1] += (this.y - 10 - this.pos[1]) * dt * 10;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, meshes.spike.vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes.spike.indexBuffer);
    gl.vertexAttribPointer(glCache.mob_vertPos, 3, gl.FLOAT, gl.FLASE, 24, 0);
    gl.vertexAttribPointer(
      glCache.mob_vertColor,
      3,
      gl.FLOAT,
      gl.FLASE,
      24,
      12,
    );
    gl.uniform4fv(glCache.mob_instanceInfo1, this.pos);
    gl.uniform2f(glCache.mob_instanceInfo2, 1, 1);
    gl.drawElements(
      gl.TRIANGLES,
      meshes.spike.indexAmount,
      gl.UNSIGNED_SHORT,
      0,
    );

    return this.life <= 0;
  }
}
