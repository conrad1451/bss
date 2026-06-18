class StarSaw {
  constructor(pos) {
    this.collectTimer = 0;
    this.lastCollectedAmount = 0;
    this.life = 45;
  }

  die(index) {
    let theta = TIME * 3,
      dx = Math.sin(theta) * 4,
      dz = Math.cos(theta) * 4;

    let p = [
      player.body.position.x + dx,
      player.body.position.y + 0.1,
      player.body.position.z + dz,
    ];

    objects.explosions.push(
      new Explosion({
        col: [0.9, 0.9, 0.9],
        pos: p,
        life: 0.4,
        size: 1,
        speed: 0.25,
        aftershock: 0.05,
        maxAlpha: 0.5,
        height: 0.25,
      }),
    );

    objects.mobs.splice(index, 1);
  }

  update() {
    this.life -= dt;

    gl.bindBuffer(gl.ARRAY_BUFFER, meshes.starSaw.vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes.starSaw.indexBuffer);
    gl.vertexAttribPointer(glCache.mob_vertPos, 3, gl.FLOAT, gl.FLASE, 24, 0);
    gl.vertexAttribPointer(
      glCache.mob_vertColor,
      3,
      gl.FLOAT,
      gl.FLASE,
      24,
      12,
    );

    let theta = TIME * 3.5,
      dx = Math.sin(theta) * 4,
      dz = Math.cos(theta) * 4;

    let p = [
      player.body.position.x + dx,
      player.body.position.y + 0.1,
      player.body.position.z + dz,
      TIME * 10,
    ];

    gl.uniform4fv(glCache.mob_instanceInfo1, p);
    gl.uniform2f(glCache.mob_instanceInfo2, 0.65, 1);
    gl.drawElements(
      gl.TRIANGLES,
      meshes.starSaw.indexAmount,
      gl.UNSIGNED_SHORT,
      0,
    );

    for (let i in objects.bubbles) {
      let b = objects.bubbles[i];

      if (vec3.sqrDist(p, b.pos) <= 5) {
        b.pop();
      }
    }

    for (let i in objects.fuzzBombs) {
      let b = objects.fuzzBombs[i];

      if (vec3.sqrDist(p, b.pos) <= 4) {
        b.pop();
      }
    }

    for (let i in objects.tokens) {
      let b = objects.tokens[i];

      if (
        vec3.sqrDist(p, b.pos) <= 4 &&
        !(objects.tokens[i] instanceof DupedToken)
      ) {
        b.collect();
      }
    }

    for (let i in objects.mobs) {
      let b = objects.mobs[i];

      if (
        b.health &&
        b.state === "attack" &&
        b.starSawHitTimer <= 0 &&
        vec3.sqrDist(p, b.pos) <= 6
      ) {
        b.starSawHitTimer = 0.75;
        b.damage(player.attackTotal * 0.3);
      }
    }

    this.collectTimer -= dt;

    if (this.collectTimer <= 0 && player.fieldIn) {
      this.collectTimer = 0.1;

      let x = Math.round(p[0] - fieldInfo[player.fieldIn].x),
        z = Math.round(p[2] - fieldInfo[player.fieldIn].z),
        a = Math.min(
          collectPollen({
            x: x,
            z: z,
            pattern: [
              [0, 0],
              [-1, 0],
              [1, 0],
              [0, 1],
              [0, -1],
            ],
            amount: 5 + 0.05 * player.attackTotal,
            stackHeight: 0.5,
            instantConversion: 1,
          }),
          player.pollen,
        );

      if (a) {
        player.pollen -= a;
        player.honey += Math.ceil(a * player.honeyPerPollen);
      }
    }

    return this.life <= 0;
  }
}
