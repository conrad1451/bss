class StarShower {
  constructor(field) {
    this.life = 3;
    this.field = field;
    this.center = [
      fieldInfo[this.field].x +
        MATH.random(0.25, 0.75) * fieldInfo[this.field].width,
      fieldInfo[this.field].y + 1.5,
      fieldInfo[this.field].z +
        MATH.random(0.25, 0.75) * fieldInfo[this.field].length,
    ];
    this.pos = [
      player.body.position.x,
      fieldInfo[this.field].y + 1.5,
      player.body.position.z,
      10,
    ];
  }

  die(index) {
    objects.mobs.splice(index, 1);
  }

  update() {
    this.life -= dt;

    if (this.life < 2.5) {
      this.pos[0] += (this.center[0] - this.pos[0]) * dt;
      this.pos[2] += (this.center[2] - this.pos[2]) * dt;
      this.pos[3] *= 0.98;
    }

    if (this.life < 1 && !this.startShower) {
      let t = this;

      for (let i = 0; i < 3.5; i += 0.35) {
        window.setTimeout(function () {
          objects.mobs.push(new FallingStar(t));
        }, 1000 * i);
      }

      this.startShower = true;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, meshes.levitatingStarShower.vertBuffer);
    gl.bindBuffer(
      gl.ELEMENT_ARRAY_BUFFER,
      meshes.levitatingStarShower.indexBuffer,
    );
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
    gl.uniform2f(
      glCache.mob_instanceInfo2,
      Math.min(this.life * 3, 1) * 1.5,
      Math.min((3 - this.life) * 0.5, 1),
    );
    gl.drawElements(
      gl.TRIANGLES,
      meshes.levitatingStarShower.indexAmount,
      gl.UNSIGNED_SHORT,
      0,
    );

    return this.life <= 0;
  }
}
