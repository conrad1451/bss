class GuidingStar {
  constructor(field) {
    this.guidingstarinstance = true;
    this.life = 600;
    this.field = field;
    this.center = [
      fieldInfo[this.field].x + 0.5 * fieldInfo[this.field].width,
      fieldInfo[this.field].y + 3,
      fieldInfo[this.field].z + 0.5 * fieldInfo[this.field].length,
    ];
    this.particleTimer = 0;
  }

  die(index) {
    objects.mobs.splice(index, 1);
  }

  update() {
    if (player.fieldIn === this.field) {
      player.addEffect("guidingStarAura");
    }

    this.life -= dt;

    gl.bindBuffer(gl.ARRAY_BUFFER, meshes.guidingStar.vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes.guidingStar.indexBuffer);
    gl.vertexAttribPointer(glCache.mob_vertPos, 3, gl.FLOAT, gl.FLASE, 24, 0);
    gl.vertexAttribPointer(
      glCache.mob_vertColor,
      3,
      gl.FLOAT,
      gl.FLASE,
      24,
      12,
    );

    let theta = TIME * 0.75,
      st = Math.sin(theta) * fieldInfo[this.field].width * 0.4,
      ct = Math.cos(theta) * fieldInfo[this.field].length * 0.4;

    let p = [
      this.center[0] + st,
      this.center[1],
      this.center[2] + ct,
      TIME * 2,
    ];

    gl.uniform4fv(glCache.mob_instanceInfo1, p);
    gl.uniform2f(glCache.mob_instanceInfo2, 1.5, 0.4);
    gl.drawElements(
      gl.TRIANGLES,
      meshes.guidingStar.indexAmount,
      gl.UNSIGNED_SHORT,
      0,
    );

    this.particleTimer -= dt;

    if (this.particleTimer <= 0) {
      if (Math.random() < 0.25)
        ParticleRenderer.add({
          x: p[0] + MATH.random(-2, 2),
          y: p[1] + MATH.random(-0.5, 0.5),
          z: p[2] + MATH.random(-2, 2),
          vx: MATH.random(-0.1, 0.1),
          vy: 0,
          vz: MATH.random(-0.1, 0.1),
          grav: 1,
          size: 30,
          col: [1, 0.8, 0],
          life: 1.5,
          rotVel: MATH.random(-3, 3),
          alpha: 0.25,
        });
      else
        ParticleRenderer.add({
          x:
            fieldInfo[this.field].x +
            Math.random() * fieldInfo[this.field].width,
          y: fieldInfo[this.field].y + 3,
          z:
            fieldInfo[this.field].z +
            Math.random() * fieldInfo[this.field].length,
          vx: MATH.random(-0.1, 0.1),
          vy: 0,
          vz: MATH.random(-0.1, 0.1),
          grav: 1,
          size: 60,
          col: [1, 0.8, 0],
          life: 1.5,
          rotVel: MATH.random(-3, 3),
          alpha: 0.5,
        });

      this.particleTimer = 0.2;
    }

    return this.life <= 0;
  }
}
