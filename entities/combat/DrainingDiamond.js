class DrainingDiamond {
  constructor() {
    this.life = 2.5;
    this.pos = [
      player.body.position.x,
      player.body.position.y,
      player.body.position.z,
      0,
    ];
    this.y = this.pos[1] + 2;
    this.r = 15;
  }

  die(index) {
    let am = Math.ceil(Math.min(player.convertTotal, player.pollenInBag));

    player.honey += Math.ceil(am * 2 * player.honeyPerPollen);
    player.pollenInBag -= am;

    player.addMessage(
      "+" +
        MATH.addCommas(Math.ceil(am * 2 * player.honeyPerPollen) + "") +
        " Honey (from Diamond Drain)",
    );

    objects.mobs.splice(index, 1);
  }

  update() {
    this.life -= dt;

    if (this.life < 0.1) {
      this.pos[1] -= dt * 40;
    } else {
      this.pos[1] += (this.y - this.pos[1]) * dt * 4;
    }

    if (this.life > 0.7) {
      this.pos[3] += (this.r - this.pos[3]) * dt * 4;
      gl.bindBuffer(gl.ARRAY_BUFFER, meshes.drainingDiamond.vertBuffer);
      gl.bindBuffer(
        gl.ELEMENT_ARRAY_BUFFER,
        meshes.drainingDiamond.indexBuffer,
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
      gl.uniform2f(glCache.mob_instanceInfo2, 1.6, 0.75);
      gl.drawElements(
        gl.TRIANGLES,
        meshes.drainingDiamond.indexAmount,
        gl.UNSIGNED_SHORT,
        0,
      );
    } else {
      gl.bindBuffer(gl.ARRAY_BUFFER, meshes.shiningDiamond.vertBuffer);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes.shiningDiamond.indexBuffer);
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
      gl.uniform2f(glCache.mob_instanceInfo2, 1.6, 1);
      gl.drawElements(
        gl.TRIANGLES,
        meshes.shiningDiamond.indexAmount,
        gl.UNSIGNED_SHORT,
        0,
      );
    }

    return this.life <= 0;
  }
}
