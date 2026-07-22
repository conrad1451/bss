class FallingStar {
  constructor(parent) {
    this.life = 2.25;
    this.field = parent.field;
    this.land = parent.center.slice();

    this.land[0] += MATH.random(-3, 3);
    this.land[1] -= 1;
    this.land[2] += MATH.random(-3, 3);

    this.x = Math.round(this.land[0] - fieldInfo[this.field].x);
    this.z = Math.round(this.land[2] - fieldInfo[this.field].z);

    this.pos = [this.land[0] + 3, this.land[1] + 10, this.land[2] + 3];
    this.theta = Math.random() * 6.2;

    this.dir = vec3.sub([], this.pos, this.land);
    vec3.normalize(this.dir, this.dir);
  }

  die(index) {
    collectPollen({
      x: this.x,
      z: this.z,
      pattern: [
        [0, 0],
        [1, 0],
        [-1, 0],
        [0, -1],
        [0, 1],
      ],
      amount: 30,
      stackHeight: 0.465 + Math.random() * 0.7,
      field: this.field,
      instantConversion: 1,
    });

    if (
      vec3.sqrDist(this.pos, [
        player.body.position.x,
        player.body.position.y,
        player.body.position.z,
      ]) <= 6
    ) {
      let amountToConvert = Math.min(
        player.convertTotal * 0.1,
        player.pollenInBag,
      );

      player.pollenInBag -= amountToConvert;

      if (player.extraInfo.enablePollenText)
        textRenderer.add(
          Math.ceil(Math.abs(amountToConvert)),
          [
            player.body.position.x,
            player.body.position.y + Math.random() * 2 + 0.5,
            player.body.position.z,
          ],
          COLORS.honey,
          0,
          "+",
        );

      player.addEffect("inspire");
    }

    objects.mobs.splice(index, 1);
  }

  update() {
    this.life -= dt;

    if (this.life < 0.75) {
      this.life -= dt;
      this.pos[3] += dt * 5;

      vec3.scaleAndAdd(this.pos, this.pos, this.dir, -dt * 30);
    }

    this.theta += dt * 20;
    this.pos[3] = this.theta;

    meshes.explosions.instanceData.push(
      this.land[0],
      this.land[1] + 0.1,
      this.land[2],
      0,
      10,
      0,
      (2.25 - this.life) * 3,
      1.5,
      0.001,
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, meshes.fallingStar.vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes.fallingStar.indexBuffer);
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
    gl.uniform2f(glCache.mob_instanceInfo2, 0.8, 1);
    gl.drawElements(
      gl.TRIANGLES,
      meshes.fallingStar.indexAmount,
      gl.UNSIGNED_SHORT,
      0,
    );

    return this.life <= 0;
  }
}
