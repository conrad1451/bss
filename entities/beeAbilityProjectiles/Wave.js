class Wave {
  constructor(pos, vel) {
    let size = player.tidalSurge ? 3.4 : player.tidePower * 0.85 + 0.45;
    this.pos = [...pos, Math.atan2(vel[2], vel[0]) + Math.PI * 0.5];
    this.vel = vel;
    this.lifespan = 3.5 + size * 0.25;
    this.life = 3.5 + size * 0.25;
    this.y = pos[1];

    vec3.scale(vel, vel, size + 5);

    this.size = size;
    this.collectTimer = 0;
    this.balloonsHit = [];
    this.hitBees = [];
  }

  die(index) {
    objects.mobs.splice(index, 1);
  }

  update() {
    this.life -= dt;

    this.pos[0] += this.vel[0] * dt;
    this.pos[2] += this.vel[2] * dt;
    this.pos[1] =
      Math.min(this.y, this.y - (this.lifespan - this.life) * this.size) +
      Math.sin(TIME * 12.5) * 0.35 * this.size;

    for (let i in objects.bees) {
      let b = objects.bees[i];

      if (
        this.hitBees.indexOf(i) < 0 &&
        Math.abs(b.pos[0] - this.pos[0]) +
          Math.abs(b.pos[1] - this.y) +
          Math.abs(b.pos[2] - this.pos[2]) <
          1
      ) {
        objects.explosions.push(
          new Explosion({
            col: [0.2, 0.5, 1],
            pos: [this.pos[0], this.y, this.pos[2]],
            life: 0.5,
            size: 1.2,
            speed: 0.35,
            aftershock: 0.005,
          }),
        );

        this.hitBees.push(i);

        let amountToConvert = Math.ceil(
          Math.min(
            player.pollen,
            10000 +
              b.convertAmount *
                10 *
                player[beeInfo[b.type].color + "ConvertRate"],
          ),
        );

        player.pollen -= amountToConvert;
        player.honey += Math.ceil(amountToConvert * player.honeyPerPollen);

        if (amountToConvert)
          textRenderer.add(
            Math.ceil(amountToConvert * player.honeyPerPollen) + "",
            [b.pos[0], b.pos[1] + 0.75, b.pos[2]],
            COLORS.honey,
            1,
            "⇆",
          );
      }
    }

    for (let i in objects.bubbles) {
      let b = objects.bubbles[i];

      if (vec3.sqrDist(this.pos, b.pos) <= 4.5 * this.size) {
        b.pop();
      }
    }

    for (let i in objects.fuzzBombs) {
      let b = objects.fuzzBombs[i];

      if (vec3.sqrDist(this.pos, b.pos) <= 3.5 * this.size) {
        b.pop();
      }
    }

    for (let i in objects.tokens) {
      let b = objects.tokens[i];

      if (
        b.from !== "Balloon" &&
        vec3.sqrDist(this.pos, b.pos) <= 3.5 * this.size &&
        !(objects.tokens[i] instanceof DupedToken)
      ) {
        b.collect();
      }
    }

    if (this.size >= 3.25) {
      for (let i in objects.balloons) {
        let b = objects.balloons[i];

        if (
          Math.random() < 0.3333 &&
          b.state === "float" &&
          this.balloonsHit.indexOf(b.id) < 0 &&
          Math.abs(this.pos[0] - b.pos[0]) + Math.abs(this.pos[2] - b.pos[2]) <=
            this.size * 0.8
        ) {
          this.balloonsHit.push(b.id);
          objects.explosions.push(
            new Explosion({
              col: [0.1, 0.5, 1],
              pos: [this.pos[0], this.y + 4, this.pos[2]],
              life: 0.5,
              size: b.displaySize * 1.5,
              speed: 0.4,
              aftershock: 0.01,
            }),
          );

          let am = Math.round(Math.min(b.pollen, b.cap * 0.01));
          b.pollen -= am;

          let hpt = Math.round((am * (b.golden ? 1.05 : 1)) / 3),
            off = Math.random() * MATH.TWO_PI;

          if (hpt) {
            for (let i = off; i < MATH.TWO_PI + off; i += MATH.TWO_PI / 3) {
              objects.tokens.push(
                new LootToken(
                  30,
                  [
                    this.pos[0] + Math.cos(i) * 1.5,
                    fieldInfo[b.field].y + 1,
                    this.pos[2] + Math.sin(i) * 1.5,
                  ],
                  "honey",
                  hpt,
                  true,
                  "Balloon",
                ),
              );
            }
          }

          player.addEffect(
            "tideBlessing",
            ((b.golden ? 45 : 30) / (4 * 60 * 60)) * 2,
          );

          if (b.pollen <= 0) {
            b.die(i, true);
          }
        }
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, meshes.wave.vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes.wave.indexBuffer);
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
    gl.uniform2f(glCache.mob_instanceInfo2, this.size, 0.6);
    gl.drawElements(
      gl.TRIANGLES,
      meshes.wave.indexAmount,
      gl.UNSIGNED_SHORT,
      0,
    );

    this.collectTimer -= dt;

    if (this.collectTimer <= 0 && player.fieldIn) {
      this.collectTimer = 0.35;

      let x = Math.round(this.pos[0] - fieldInfo[player.fieldIn].x),
        z = Math.round(this.pos[2] - fieldInfo[player.fieldIn].z);

      collectPollen({
        x: x,
        z: z,
        pattern: [
          [0, 0],
          [-1, 0],
          [1, 0],
          [0, 1],
          [0, -1],
          [-1, -1],
          [1, 1],
          [-1, 1],
          [1, -1],
        ],
        amount: {
          r: this.size * this.life * 0.5,
          w: 2 * this.size * this.life,
          b: 3 * this.size * this.life,
        },
        yOffset: 2.2,
        stackHeight: 0.5 + Math.random() * 0.85,
      });
    }

    return this.life <= 0;
  }
}
