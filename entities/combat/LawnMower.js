class LawnMower {
  constructor(round) {
    this.dir = Math.random() < 0.5 ? -1 : 1;

    this.pos = [
      -21 + this.dir * 13,
      6,
      -55 + (Math.random() < 0.3333 ? -2.5 : Math.random() < 0.5 ? 1.5 : 5.5),
      (this.dir + 1) * MATH.HALF_PI,
    ];

    this.warning = 2;
    this.speed = Math.min(12.5 + round * 0.25, 27.5);
  }

  die(index) {
    objects.mobs.splice(index, 1);
  }

  update() {
    if (this.warning > 0) {
      this.warning -= dt;

      if (((this.warning * this.speed * 0.35) | 0) % 2) {
        gl.bindBuffer(gl.ARRAY_BUFFER, meshes.lawnMowerWarning.vertBuffer);
        gl.bindBuffer(
          gl.ELEMENT_ARRAY_BUFFER,
          meshes.lawnMowerWarning.indexBuffer,
        );
        gl.vertexAttribPointer(
          glCache.mob_vertPos,
          3,
          gl.FLOAT,
          gl.FLASE,
          24,
          0,
        );
        gl.vertexAttribPointer(
          glCache.mob_vertColor,
          3,
          gl.FLOAT,
          gl.FLASE,
          24,
          12,
        );
        gl.uniform2f(glCache.mob_instanceInfo2, 1, 1);
        gl.uniform4fv(glCache.mob_instanceInfo1, [
          -21 + this.dir * 9.4,
          7.5,
          this.pos[2],
          0,
        ]);
        gl.drawElements(
          gl.TRIANGLES,
          meshes.lawnMowerWarning.indexAmount,
          gl.UNSIGNED_SHORT,
          0,
        );
      }
    } else {
      if (
        !this.damaged &&
        Math.abs(player.body.position.x - this.pos[0]) +
          Math.abs(player.body.position.z - this.pos[2]) <
          1.667
      ) {
        this.damaged = true;
        player.damage(20);
      }

      this.pos[0] -= this.dir * dt * this.speed;

      gl.bindBuffer(gl.ARRAY_BUFFER, meshes.lawnMower.vertBuffer);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes.lawnMower.indexBuffer);
      gl.vertexAttribPointer(glCache.mob_vertPos, 3, gl.FLOAT, gl.FLASE, 24, 0);
      gl.vertexAttribPointer(
        glCache.mob_vertColor,
        3,
        gl.FLOAT,
        gl.FLASE,
        24,
        12,
      );
      gl.uniform2f(glCache.mob_instanceInfo2, 1, 1);
      gl.uniform4fv(glCache.mob_instanceInfo1, this.pos);
      gl.drawElements(
        gl.TRIANGLES,
        meshes.lawnMower.indexAmount,
        gl.UNSIGNED_SHORT,
        0,
      );
    }

    return this.pos[0] > -21 + 14 || this.pos[0] < -21 - 14;
  }
}
