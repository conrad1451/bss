class PopStar {
  constructor(pos) {
    this.size = 0.5;
    this.life = 45;
    this.startValue = player.stats.popStar;
    this.value = 0;
    player.popStarSize = 0;
    player.popStarActive = this;
    this.popParticles = [];

    player.addEffect("bubbleBloat", 60 / (60 * 60));
    player.addEffect("popStarAura");
  }

  die(index) {
    player.popStarSize = 0;
    player.popStarActive = undefined;

    let dir = player.bodyDir.slice(),
      theta = TIME * 2,
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
        col: [0, 0.5, 1],
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
        col: [0, 0.5, 1],
        pos: p,
        life: 0.4,
        size: this.size * 1.5,
        speed: 0.7,
        aftershock: 0.1,
        maxAlpha: 0.3,
      }),
    );

    if (player.fieldIn) {
      for (let i = 0, l = this.value * 0.1 + 5; i < l; i++) {
        objects.bubbles.push(
          new Bubble(
            player.fieldIn,
            (Math.random() * fieldInfo[player.fieldIn].width) | 0,
            (Math.random() * fieldInfo[player.fieldIn].length) | 0,
          ),
        );
      }
    }

    objects.mobs.splice(index, 1);
  }

  update() {
    this.life -= dt;
    this.value = player.stats.popStar - this.startValue;
    this.size = Math.min(Math.sqrt(this.value) * 0.06 + 0.5, 2);
    player.popStarSize = this.value;

    gl.bindBuffer(gl.ARRAY_BUFFER, meshes.popStar.vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes.popStar.indexBuffer);
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
      theta = TIME * 2,
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

    for (let i in this.popParticles) {
      let a = this.popParticles[i];

      vec3.lerp(a, a, p, dt * 7 + 0.075);

      meshes.explosions.instanceData.push(a[0], a[1], a[2], 1, 1, 1, 1, 0.5, 1);

      if (
        Math.abs(a[0] - p[0]) + Math.abs(a[1] - p[1]) + Math.abs(a[2] - p[2]) <
        1.75
      ) {
        this.popParticles.splice(i, 1);
      }
    }

    gl.uniform4fv(glCache.mob_instanceInfo1, p);
    gl.uniform2f(glCache.mob_instanceInfo2, this.size, 0.7);
    gl.drawElements(
      gl.TRIANGLES,
      meshes.popStar.indexAmount,
      gl.UNSIGNED_SHORT,
      0,
    );

    p[0] += player.cameraDir[0];
    p[1] += player.cameraDir[1];
    p[2] += player.cameraDir[2];
    p[1] += 0.1;
    textRenderer.addSingle(
      this.value.toString(),
      p.slice(),
      COLORS.whiteArr,
      -2,
    );
    p[1] -= 0.3;
    textRenderer.addSingle(MATH.doTime(this.life), p, COLORS.whiteArr, -1);

    return this.life <= 0;
  }
}
