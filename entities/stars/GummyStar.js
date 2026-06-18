class GummyStar {
  constructor(pos) {
    this.size = 0.5;
    this.life = 45;
    this.startValue = player.stats.goo;
    this.value = 0;
    player.gummyStarSize = 0;
    player.addEffect("gummyStarAura");
  }

  die(index) {
    player.gummyStarSize = 0;
    let dir = player.bodyDir.slice(),
      theta = TIME * 2 + MATH.THIRD_PI * 4,
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
        col: [0.1, 1, 0.5],
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
        col: [1, 0.2, 1],
        pos: p,
        life: 0.4,
        size: this.size * 1.5,
        speed: 0.7,
        aftershock: 0.1,
        maxAlpha: 0.3,
      }),
    );

    if (player.fieldIn) {
      let amountPerToken = Math.ceil((this.value * 0.05) / 20) + 1000;

      for (let i = 0, l = 20 + this.value.toString().length; i < l; i++) {
        objects.tokens.push(
          new LootToken(
            30,
            [
              fieldInfo[player.fieldIn].x +
                ((Math.random() * fieldInfo[player.fieldIn].width) | 0),
              fieldInfo[player.fieldIn].y + 1,
              fieldInfo[player.fieldIn].z +
                ((Math.random() * fieldInfo[player.fieldIn].length) | 0),
            ],
            "honey",
            amountPerToken,
            false,
            "Gummy Star",
          ),
        );
      }
    }

    objects.mobs.splice(index, 1);
  }

  update() {
    this.life -= dt;
    this.value = player.stats.goo - this.startValue;
    player.gummyStarSize = this.value;
    this.size = Math.min(Math.sqrt(this.value / 71000000) * 0.055 + 0.5, 2);

    gl.bindBuffer(gl.ARRAY_BUFFER, meshes.gummyStar.vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes.gummyStar.indexBuffer);
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
      theta = TIME * 2 + MATH.THIRD_PI * 4,
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

    gl.uniform4fv(glCache.mob_instanceInfo1, p);
    gl.uniform2f(glCache.mob_instanceInfo2, this.size, 0.9);
    gl.drawElements(
      gl.TRIANGLES,
      meshes.gummyStar.indexAmount,
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
