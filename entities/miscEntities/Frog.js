class Frog {
  constructor(field, x, z, bee) {
    this.life = 25 + bee.level;
    this.gifted = Math.random() < 0.1 + 0.02 * bee.level && bee.gifted;
    this.mesh = this.gifted ? "giftedFrog" : "frog";
    this.field = field;
    this.y = fieldInfo[field].y + 0.75;
    this.pos = [fieldInfo[field].x + x, this.y, fieldInfo[field].z + z];
    this.moveTo = [this.pos[0], this.pos[2] + 0.1];

    this.vel = 0;
    this.jumpDelay = 0;
    this.state = 0;
    this.jumpCount = 0;

    this.jumpPattern = [
      [-5, -3],
      [-5, -2],
      [-5, -1],
      [-5, 0],
      [-5, 1],
      [-5, 2],
      [-5, 3],
      [-4, -4],
      [-4, -3],
      [-4, 3],
      [-4, 4],
      [-3, -5],
      [-3, -4],
      [-3, 4],
      [-3, 5],
      [-2, -5],
      [-2, 5],
      [-1, -5],
      [-1, 5],
      [0, -5],
      [0, 5],
      [1, -5],
      [1, 5],
      [2, -5],
      [2, 5],
      [3, -5],
      [3, -4],
      [3, 4],
      [3, 5],
      [4, -4],
      [4, -3],
      [4, 3],
      [4, 4],
      [5, -3],
      [5, -2],
      [5, -1],
      [5, 0],
      [5, 1],
      [5, 2],
    ];
  }

  die(index) {
    objects.explosions.push(
      new Explosion({
        col: [0, 0.5, 1],
        pos: this.pos.slice(),
        life: 0.2,
        size: 4,
        speed: 0.5,
        aftershock: 0.05,
      }),
    );

    objects.mobs.splice(index, 1);
  }

  update() {
    this.life -= dt;

    if (this.state === 0) {
      this.jumpDelay -= dt;

      if (this.jumpDelay <= 0) {
        this.state = 1;
      }
    } else {
      let dir = [this.moveTo[0] - this.pos[0], this.moveTo[1] - this.pos[2]],
        m = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1]),
        d = 1 / m,
        s = dt * d * 4;

      this.pos[0] += dir[0] * s;
      this.pos[2] += dir[1] * s;

      if (m < 1) {
        let index = (Math.random() * this.jumpPattern.length) | 0,
          x = this.jumpPattern[index][0],
          z = this.jumpPattern[index][1];

        while (
          Math.round(this.moveTo[0] - fieldInfo[this.field].x + x) < 0 ||
          Math.round(this.moveTo[0] - fieldInfo[this.field].x + x) >=
            fieldInfo[this.field].width ||
          Math.round(this.moveTo[1] - fieldInfo[this.field].z + z) < 0 ||
          Math.round(this.moveTo[1] - fieldInfo[this.field].z + z) >=
            fieldInfo[this.field].length
        ) {
          index = (Math.random() * this.jumpPattern.length) | 0;
          x = this.jumpPattern[index][0];
          z = this.jumpPattern[index][1];
        }

        this.moveTo = [this.moveTo[0] + x, this.moveTo[1] + z];

        this.state = 0;
        this.jumpDelay = 0.5;
        this.vel = 0.12;
        this.pos[1] = this.y;
        this.jumpCount++;

        if (this.jumpCount % 3 !== 0)
          objects.bubbles.push(
            new Bubble(
              this.field,
              (this.pos[0] - fieldInfo[this.field].x) | 0,
              (this.pos[2] - fieldInfo[this.field].z) | 0,
            ),
          );

        for (let i in objects.tokens) {
          let b = objects.tokens[i];

          if (
            !b.collected &&
            vec3.sqrDist(b.pos, this.pos) < (this.gifted ? 14 : 9) &&
            Math.random() < (this.gifted ? 0.25 : 0.4) &&
            !(objects.tokens[i] instanceof DupedToken)
          ) {
            objects.explosions.push(
              new Explosion({
                col: [0.9, 0, 0.15],
                pos: b.pos.slice(),
                life: 1.25,
                size: 1.8,
                speed: 0.2,
                aftershock: 0.005,
              }),
            );
            let bx = (b.pos[0] - fieldInfo[this.field].x) | 0,
              bz = (b.pos[2] - fieldInfo[this.field].z) | 0;

            if (
              bx >= 0 &&
              bx < fieldInfo[this.field].width &&
              bz >= 0 &&
              bz < fieldInfo[this.field].length
            )
              objects.bubbles.push(new Bubble(this.field, bx, bz));

            b.collect();
            break;
          }
        }
      }

      this.pos[3] = Math.atan2(dir[1] * d, dir[0] * d) + MATH.HALF_PI;
      this.vel -= dt * 0.2;
      this.pos[1] = Math.max(this.pos[1] + this.vel, this.y);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, meshes[this.mesh].vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes[this.mesh].indexBuffer);
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
    gl.uniform2f(glCache.mob_instanceInfo2, 0.9, 1);
    gl.drawElements(
      gl.TRIANGLES,
      meshes[this.mesh].indexAmount,
      gl.UNSIGNED_SHORT,
      0,
    );

    return this.life <= 0;
  }
}
