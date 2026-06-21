class Flame {
  constructor(field, x, z, isStatic) {
    player.stats.flames++;

    this.life = 3 * (player.flameFuel ? 1.5 : 1) * player.flameLife;
    this.isStatic = isStatic;

    if (isStatic) {
      this.pos = [field, x, z];
    } else {
      this.field = field;
      this.x = x;
      this.z = z;
      this.pos = [
        this.x + fieldInfo[this.field].x,
        fieldInfo[this.field].y + 0.5,
        this.z + fieldInfo[this.field].z,
      ];
    }

    this.collectTimer = TIME + MATH.random(0.5, 1);
    this.particleTimer = TIME;

    if (player.flameFuel) {
      this.getRidOfOilTrailTimer = 2;
      this.oilT = 0;
      this.oilPos = [
        player.body.position.x,
        player.body.position.y + 0.3,
        player.body.position.z,
      ];
      this.oilTrail = new TrailRenderer.Trail({
        length: 10,
        size: 0.75,
        triangle: true,
        color: [0.1, 0, 0, 1],
      });

      player.pollen -= Math.min(
        Math.ceil(player.convertTotal * 0.02),
        player.pollen,
      );
      player.honey += Math.ceil(
        Math.min(Math.ceil(player.convertTotal * 0.02), player.pollen) *
          player.honeyPerPollen,
      );
      if (player.extraInfo.enablePollenText)
        textRenderer.add(
          Math.ceil(
            Math.min(Math.ceil(player.convertTotal * 0.02), player.pollen) *
              player.honeyPerPollen,
          ),
          [
            player.body.position.x,
            player.body.position.y + Math.random() * 2 + 0.5,
            player.body.position.z,
          ],
          COLORS.honey,
          0,
          "+",
        );
    }
  }

  die(index) {
    if (this.oilTrail) this.oilTrail.splice = true;

    objects.flames.splice(index, 1);
  }

  turnDark() {
    if (!this.dark) {
      objects.explosions.push(
        new ReverseExplosion({
          col: [1, 0, 1],
          pos: this.pos,
          life: 0.5,
          size: 2,
          alpha: 1,
          height: 3,
        }),
      );

      this.dark = true;

      if (player.flameFuel) {
        this.life *= 1.5;
        player.pollen -= Math.min(
          Math.ceil(player.convertTotal * 0.02),
          player.pollen,
        );
        player.honey += Math.ceil(
          Math.min(Math.ceil(player.convertTotal * 0.02), player.pollen) *
            player.honeyPerPollen,
        );
        if (player.extraInfo.enablePollenText)
          textRenderer.add(
            Math.ceil(
              Math.min(Math.ceil(player.convertTotal * 0.02), player.pollen) *
                player.honeyPerPollen,
            ),
            [
              player.body.position.x,
              player.body.position.y + Math.random() * 2 + 0.5,
              player.body.position.z,
            ],
            COLORS.honey,
            0,
            "+",
          );
        this.getRidOfOilTrailTimer = 2;
        this.oilT = 0;
        this.oilPos = [
          player.body.position.x,
          player.body.position.y + 0.3,
          player.body.position.z,
        ];

        if (!this.oilTrail) {
          this.oilTrail = new TrailRenderer.Trail({
            length: 15,
            size: 0.75,
            triangle: true,
            color: [0.1, 0, 0, 1],
          });
        } else {
          this.oilTrail.addPos([]);
        }
      }
    }
  }

  update() {
    this.life -= dt;

    if (this.oilTrail) {
      this.oilPos[0] = MATH.lerp(this.oilPos[0], this.pos[0], this.oilT);
      this.oilPos[2] = MATH.lerp(this.oilPos[2], this.pos[2], this.oilT);
      this.oilT = Math.min(this.oilT + dt * 0.5, 1);
      this.oilTrail.addPos([...this.oilPos]);

      this.getRidOfOilTrailTimer -= dt;

      if (this.getRidOfOilTrailTimer <= 0) {
        this.oilTrail.splice = true;
        this.oilTrail = undefined;
      }
    }

    if (TIME - this.collectTimer > 1) {
      this.collectTimer = TIME;

      if (!this.isStatic && player.fieldIn === this.field) {
        collectPollen({
          x: this.x,
          z: this.z,
          pattern: this.dark
            ? [
                [0, 0],
                [1, 1],
                [1, -1],
                [-1, 1],
                [-1, -1],
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
                [2, 0],
                [-2, 0],
                [0, -2],
                [0, 2],
              ]
            : [
                [0, 0],
                [1, 1],
                [1, -1],
                [-1, 1],
                [-1, -1],
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
              ],
          amount: { r: 10, w: 4, b: 1 },
          stackHeight: 0.7,
          multiplier: player.flamePollen * player.flameBonus,
          instantConversion: player.instantFlameConversion,
          field: this.field,
        });
      }
    }

    if (this.dark) {
      player.addEffect("darkHeat");
    }

    if (TIME - this.particleTimer > 0.5) {
      this.particleTimer = TIME;

      if (this.dark) {
        ParticleRenderer.add({
          x: this.pos[0],
          y: this.pos[1],
          z: this.pos[2],
          vx: MATH.random(-0.1, 0.1),
          vy: MATH.random(0, 0.3),
          vz: MATH.random(-0.1, 0.1),
          grav: 1,
          size: MATH.random(110, 180),
          col: [1, 0, Math.random()],
          life: 1.5,
          rotVel: MATH.random(-3, 3),
          alpha: 4.5,
        });
      } else {
        ParticleRenderer.add({
          x: this.pos[0],
          y: this.pos[1],
          z: this.pos[2],
          vx: MATH.random(-0.1, 0.1),
          vy: MATH.random(0, 0.3),
          vz: MATH.random(-0.1, 0.1),
          grav: 1,
          size: MATH.random(110, 180),
          col: [1, MATH.random(0.3, 1), 0],
          life: 1.5,
          rotVel: MATH.random(-3, 3),
          alpha: 4.5,
        });
      }
    }

    if (
      Math.abs(player.body.position.x - this.pos[0]) +
        Math.abs(player.body.position.y - this.pos[1]) +
        Math.abs(player.body.position.z - this.pos[2]) <
      2
    ) {
      player.stats.scorchingStar += dt * (this.dark ? 120 : 90);
      player.addEffect("flameHeat", this.dark ? 0.00025 : 0.0001);
    }

    return this.life <= 0;
  }
}
