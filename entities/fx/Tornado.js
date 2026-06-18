class Tornado {
  constructor(beeLevel) {
    this.life = player.hasteStacks + 7.5 + beeLevel * 0.5;
    this.field = player.fieldIn;
    this.speed = 1 + player.hasteStacks * 0.25 + beeLevel * 0.05;
    this.x = player.flowerIn.x;
    this.z = player.flowerIn.z;
    this._x = player.flowerIn.x;
    this._z = player.flowerIn.z;
    this.moveTo = [
      fieldInfo[this.field].x + this.x,
      fieldInfo[this.field].z + this.z,
    ];
    this.moveDir = [0, 0];
    this.pos = [
      fieldInfo[this.field].x + this.x,
      fieldInfo[this.field].y + 0.5,
      fieldInfo[this.field].z + this.z,
    ];

    this.flowers = [];
    this.timer = 0;

    let rad = 3,
      sqRad = 2 * 2;

    for (let x = -rad; x <= rad; x++) {
      for (let z = -rad; z <= rad; z++) {
        if (x * x + z * z <= sqRad) {
          this.flowers.push([x, z]);
        }
      }
    }
  }

  die(index) {
    objects.mobs.splice(index, 1);
  }

  update() {
    this.life -= dt;

    this.pos[0] += this.moveDir[0] * dt;
    this.pos[2] += this.moveDir[1] * dt;

    this.x = Math.round(this.pos[0] - fieldInfo[this.field].x);
    this.z = Math.round(this.pos[2] - fieldInfo[this.field].z);

    this.timer -= dt;

    if (this.timer <= 0) {
      this.timer = 0.25;

      collectPollen({
        x: this.x,
        z: this.z,
        pattern: [
          [-2, -1],
          [-2, 0],
          [-2, 1],
          [-1, -2],
          [-1, -1],
          [-1, 0],
          [-1, 1],
          [-1, 2],
          [0, -2],
          [0, -1],
          [0, 0],
          [0, 1],
          [0, 2],
          [1, -2],
          [1, -1],
          [1, 0],
          [1, 1],
          [1, 2],
          [2, -1],
          [2, 0],
          [2, 1],
        ],
        amount: 7.5,
        field: this.field,
      });
    }

    if (
      Math.abs(this.pos[0] - this.moveTo[0]) +
        Math.abs(this.pos[2] - this.moveTo[1]) <
      1
    ) {
      this.moveTo = [
        fieldInfo[this.field].x +
          ((Math.random() * fieldInfo[this.field].width) | 0),
        fieldInfo[this.field].z +
          ((Math.random() * fieldInfo[this.field].length) | 0),
      ];

      this.moveDir = [
        this.moveTo[0] - this.pos[0],
        this.moveTo[1] - this.pos[2],
      ];

      vec2.normalize(this.moveDir, this.moveDir);
      vec2.scale(this.moveDir, this.moveDir, this.speed);
    }

    for (let i in objects.tokens) {
      let b = objects.tokens[i];

      if (
        vec3.sqrDist(this.pos, b.pos) <= 16 &&
        !(objects.tokens[i] instanceof DupedToken)
      ) {
        b.collect();
      }
    }

    for (let i in objects.bubbles) {
      let b = objects.bubbles[i];

      if (vec3.sqrDist(this.pos, b.pos) <= 16) {
        b.pop();
      }
    }

    for (let i in objects.fuzzBombs) {
      let b = objects.fuzzBombs[i];

      if (vec3.sqrDist(this.pos, b.pos) <= 16) {
        b.pop();
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, meshes.tornado.vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes.tornado.indexBuffer);
    gl.vertexAttribPointer(glCache.mob_vertPos, 3, gl.FLOAT, gl.FLASE, 24, 0);
    gl.vertexAttribPointer(
      glCache.mob_vertColor,
      3,
      gl.FLOAT,
      gl.FLASE,
      24,
      12,
    );
    this.pos[3] = TIME * (this.speed + 5);
    gl.uniform4fv(glCache.mob_instanceInfo1, this.pos);
    gl.uniform2f(glCache.mob_instanceInfo2, 0.65, 0.7);
    gl.drawElements(
      gl.TRIANGLES,
      meshes.tornado.indexAmount,
      gl.UNSIGNED_SHORT,
      0,
    );

    return this.life <= 0;
  }
}
