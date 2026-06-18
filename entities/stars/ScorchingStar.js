class ScorchingStar {
  constructor(pos) {
    this.size = 0.5;
    this.life = 45;
    this.startValue = player.stats.scorchingStar;
    this.value = 0;
    player.scorchingStarSize = 0;
    player.addEffect("scorchingStarAura");
    this.particleTimer = 0;
  }

  die(index) {
    player.scorchingStarSize = 0;
    let dir = player.bodyDir.slice(),
      theta = TIME * 2 + MATH.THIRD_PI * 2,
      st = Math.sin(theta) * (this.size + 1),
      ct = Math.cos(theta) * (this.size + 1);

    dir[0] = dir[0] * st - dir[2] * ct;
    dir[2] = player.bodyDir[0] * ct + dir[2] * st;

    let p = [
      player.body.position.x + dir[0],
      player.body.position.y +
        this.size * 2 +
        Math.sin(TIME * 3) * this.size -
        0.5,
      player.body.position.z + dir[2],
    ];

    objects.explosions.push(
      new Explosion({
        col: [0.75, 0, 0],
        pos: p,
        life: 0.4,
        size: this.size * 1.25,
        speed: 0.25,
        aftershock: 0.05,
        maxAlpha: 0.5,
      }),
    );

    objects.explosions.push(
      new Explosion({
        col: [0.75, 0, 0],
        pos: p,
        life: 0.4,
        size: this.size * 1.5,
        speed: 0.7,
        aftershock: 0.1,
        maxAlpha: 0.3,
      }),
    );

    objects.mobs.splice(index, 1);
  }

  update() {
    this.life -= dt;
    this.value = player.stats.scorchingStar - this.startValue;
    this.size = Math.min(Math.sqrt(this.value * 0.045) * 0.05 + 0.5, 2);
    player.scorchingStarSize = this.value;

    gl.bindBuffer(gl.ARRAY_BUFFER, meshes.scorchingStar.vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes.scorchingStar.indexBuffer);
    gl.vertexAttribPointer(glCache.mob_vertPos, 3, gl.FLOAT, gl.FLASE, 24, 0);
    gl.vertexAttribPointer(
      glCache.mob_vertColor,
      3,
      gl.FLOAT,
      gl.FLASE,
      24,
      12,
    );

    let dir = player.bodyDir.slice(),
      theta = TIME * 2 + MATH.THIRD_PI * 2,
      st = Math.sin(theta) * (this.size + 1),
      ct = Math.cos(theta) * (this.size + 1);

    dir[0] = dir[0] * st - dir[2] * ct;
    dir[2] = player.bodyDir[0] * ct + dir[2] * st;

    let p = [
      player.body.position.x + dir[0],
      player.body.position.y +
        this.size * 2 +
        Math.sin(TIME * 3) * this.size -
        0.5,
      player.body.position.z + dir[2],
      -player.playerAngle + Math.PI,
    ];

    this.particleTimer -= dt;

    if (this.particleTimer < 0) {
      ParticleRenderer.add({
        x: p[0] + MATH.random(-this.size, this.size),
        y: p[1] + MATH.random(-this.size, this.size),
        z: p[2] + MATH.random(-this.size, this.size),
        vx: 0,
        vy: 0,
        vz: 0,
        grav: 0,
        size: 80,
        col: [1, Math.random() * 0.3 + 0.6, 0],
        life: 1,
        rotVel: 0,
        alpha: 2,
        rot: MATH.HALF_PI,
      });
      this.particleTimer = 0.1;
    }

    gl.uniform4fv(glCache.mob_instanceInfo1, p);
    gl.uniform2f(glCache.mob_instanceInfo2, this.size, 1);
    gl.drawElements(
      gl.TRIANGLES,
      meshes.scorchingStar.indexAmount,
      gl.UNSIGNED_SHORT,
      0,
    );

    p[0] += player.cameraDir[0];
    p[1] += player.cameraDir[1];
    p[2] += player.cameraDir[2];
    p[1] += 0.1;
    textRenderer.addSingle(
      (this.value | 0).toString(),
      p.slice(),
      COLORS.whiteArr,
      -2,
    );
    p[1] -= 0.3;
    textRenderer.addSingle(MATH.doTime(this.life), p, COLORS.whiteArr, -1);

    return this.life <= 0;
  }
}
