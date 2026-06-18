class GummyBall {
  constructor() {
    this.field = player.fieldIn;
    this.size = (player.gummyBallSize - 1) / 1.5;
    this.size = this.size * this.size * this.size;

    this.flowers = [];

    let rad = (this.size * 2.5 + 2) | 0;

    for (let x = -rad; x <= rad; x++) {
      for (let z = -rad; z <= rad; z++) {
        let _x = x,
          _z = z;

        if (x * x + z * z <= rad * rad) {
          this.flowers.push([_x, _z]);
        }
      }
    }

    this.vel = player.bodyDir.slice();
    vec3.scale(this.vel, this.vel, 17.5);
    this.life = this.size * 15 + 0.5;
    this.collectTimer = 0;
    this.rad = this.size * 0.35 + 0.5;
    this.pos = [
      player.body.position.x,
      fieldInfo[player.fieldIn].y + 0.5 + this.rad,
      player.body.position.z,
      0,
    ];
    this.trail = new TrailRenderer.Trail({
      length: MATH.lerp(20, 50, this.size) | 0,
      size: this.rad,
      triangle: true,
      color: [1, 0.2, 1, 1],
      fadeTo: [0.1, 1, 0.6, 0],
    });
    this.bounds = {
      minX: fieldInfo[this.field].x + this.rad,
      maxX: fieldInfo[this.field].x + fieldInfo[this.field].width - this.rad,
      minZ: fieldInfo[this.field].z + this.rad,
      maxZ: fieldInfo[this.field].z + fieldInfo[this.field].length - this.rad,
    };
    this.amount = 0;
  }

  die(index) {
    this.trail.splice = true;
    objects.mobs.splice(index, 1);
  }

  update() {
    this.life -= dt;

    if (this.pos[0] <= this.bounds.minX) {
      this.pos[0] = this.bounds.minX;
      this.vel[0] = -this.vel[0];
      player.addEffect("gummyBallCombo", false, false, undefined, 2);
      this.amount += 2;
    }

    if (this.pos[0] >= this.bounds.maxX) {
      this.pos[0] = this.bounds.maxX;
      this.vel[0] = -this.vel[0];
      player.addEffect("gummyBallCombo", false, false, undefined, 2);
      this.amount += 2;
    }

    if (this.pos[2] <= this.bounds.minZ) {
      this.pos[2] = this.bounds.minZ;
      this.vel[2] = -this.vel[2];
      player.addEffect("gummyBallCombo", false, false, undefined, 2);
      this.amount += 2;
    }

    if (this.pos[2] >= this.bounds.maxZ) {
      this.pos[2] = this.bounds.maxZ;
      this.vel[2] = -this.vel[2];
      player.addEffect("gummyBallCombo", false, false, undefined, 2);
      this.amount += 2;
    }

    vec3.scaleAndAdd(this.pos, this.pos, this.vel, dt);

    for (let i in objects.tokens) {
      let b = objects.tokens[i];

      if (
        vec3.sqrDist(this.pos, b.pos) <= this.rad * this.rad * 1.5 &&
        !(objects.tokens[i] instanceof DupedToken)
      ) {
        b.collect();
        player.addEffect(
          "gummyBallCombo",
          false,
          false,
          undefined,
          b.type === "honey" ? 3 : 1,
        );
        this.amount += b.type === "honey" ? 3 : 1;
      }
    }

    for (let i in objects.bubbles) {
      let b = objects.bubbles[i];

      if (vec3.sqrDist(this.pos, b.pos) <= 5.5) {
        b.pop();
      }
    }

    for (let i in objects.marks) {
      let b = objects.marks[i];

      if (
        vec3.sqrDist(this.pos, b.pos) <= 25 &&
        TIME - b.gummyBallHitTimer > 1
      ) {
        b.gummyBallHitTimer = TIME;
        player.addEffect(
          "gummyBallCombo",
          false,
          false,
          undefined,
          b.type === "precise" ? 30 : 8,
        );
        this.amount += b.type === "precise" ? 30 : 8;
      }
    }

    this.trail.addPos([this.pos[0], this.pos[1], this.pos[2]]);

    gl.bindBuffer(gl.ARRAY_BUFFER, meshes.gummyBall.vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes.gummyBall.indexBuffer);
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
    gl.uniform2f(glCache.mob_instanceInfo2, this.rad * 2, this.life * 0.5);
    gl.drawElements(
      gl.TRIANGLES,
      meshes.gummyBall.indexAmount,
      gl.UNSIGNED_SHORT,
      0,
    );

    textRenderer.addSingle(
      "x" + MATH.addCommas(this.amount + ""),
      this.pos,
      COLORS.whiteArr,
      -3,
      true,
      false,
    );

    this.collectTimer -= dt;

    if (this.collectTimer <= 0) {
      this.collectTimer = 0.15;

      let x = Math.round(this.pos[0] - fieldInfo[this.field].x),
        z = Math.round(this.pos[2] - fieldInfo[this.field].z);

      collectPollen({
        x: x,
        z: z,
        pattern: this.flowers,
        amount: { r: 3, w: 10, b: 3 },
        stackHeight: 0.75,
        field: this.field,
        gooTrail: true,
        multiplier: this.size + 1,
      });
    }

    return this.life <= 0;
  }
}
