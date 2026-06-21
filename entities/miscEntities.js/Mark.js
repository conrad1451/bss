class Mark {
  constructor(field, x, z, type, beeLevel) {
    this.gummyBallHitTimer = 0;
    this.beeLevel = beeLevel;
    this.life =
      ((type === "precise" ? 15 : 7) + (beeLevel - 1) * 0.2) *
      player.markDuration;
    this.field = field;
    this.x = x;
    this.z = z;
    this.pos = [
      fieldInfo[this.field].x + this.x,
      fieldInfo[this.field].y + 0.5,
      fieldInfo[this.field].z + this.z,
    ];
    this.surgeLimit = 5;
    this.rot = Math.random() * 6.12;

    this.diameter = type === "precise" ? 14 : 10;
    this.sqSize = this.diameter * 0.5 * (this.diameter * 0.5);

    this.type = type;
    this.typeCol = {
      pollenMark: [0, 1, 0],
      honeyMark: COLORS.honey_normalized,
      preciseMark: [1, 0, 1],
    }[this.type];

    this.flowers = [];

    let rad = (this.diameter * 0.5) | 0;

    for (let x = -rad; x <= rad; x++) {
      for (let z = -rad; z <= rad; z++) {
        if (x * x + z * z <= rad * rad) {
          this.flowers.push([x, z]);
        }
      }
    }

    this.honeyMarkConvert = 0;
  }

  surge(time = 0) {
    if (this.surgeLimit > 0) this.surgeAfter = time;
  }

  die(index) {
    objects.marks.splice(index, 1);
  }

  update() {
    this.life -= dt;
    this.rot += dt * 2;

    if (
      vec3.sqrDist(this.pos, [
        player.body.position.x,
        player.body.position.y,
        player.body.position.z,
      ]) <= this.sqSize
    ) {
      if (STATS_TICK) player.addEffect(this.type);

      meshes.explosions.instanceData.push(
        this.pos[0],
        this.pos[1] + 3.6,
        this.pos[2],
        0,
        1,
        0,
        1,
        0.45,
        1,
      );

      if (this.type === "honeyMark") {
        this.honeyMarkConvert -= dt;

        if (this.honeyMarkConvert <= 0) {
          this.honeyMarkConvert = 1;

          let a = Math.min(
            Math.round((player.convertTotal * 3) / (objects.bees.length || 1)),
            player.pollen,
          );
          player.pollen -= a;
          player.honey += Math.ceil(a * player.honeyPerPollen);

          if (player.extraInfo.enablePollenText)
            textRenderer.add(
              a,
              [
                player.body.position.x,
                player.body.position.y + 2,
                player.body.position.z,
              ],
              COLORS.honey,
              0,
              "+",
            );
        }
      }
    } else {
      meshes.explosions.instanceData.push(
        this.pos[0],
        this.pos[1] + 3.6,
        this.pos[2],
        0.8,
        0.4,
        0,
        0.85,
        0.45,
        1,
      );
    }

    meshes.explosions.instanceData.push(
      this.pos[0],
      this.pos[1],
      this.pos[2],
      player.isNight,
      player.isNight,
      player.isNight,
      0.05,
      this.diameter - 0.1,
      0.01,
    );

    meshes.cylinder_explosions.instanceData.push(
      this.pos[0],
      this.pos[1] + 1.5,
      this.pos[2],
      0.9 * player.isNight,
      0.8 * player.isNight,
      0.4 * player.isNight,
      1,
      0.125,
      27,
    );
    meshes.cylinder_explosions.instanceData.push(
      this.pos[0],
      this.pos[1] + 3.3,
      this.pos[2],
      0.9,
      0.8,
      0.4,
      1,
      0.4,
      0.5,
    );
    meshes.tokens.instanceData.push(
      this.pos[0],
      this.pos[1] + 2.25,
      this.pos[2],
      this.rot,
      effects[this.type + "Token"].u,
      effects[this.type + "Token"].v,
      1,
      1.35,
    );

    this.surgeAfter -= dt;

    if (this.surgeAfter <= 0) {
      this.surgeAfter = Infinity;
      this.surgeLimit--;
      this.life += 1 + this.beeLevel * 0.1;

      let f = this;

      objects.explosions.push(
        new ReverseExplosion({
          col: [1, 1, 0],
          pos: f.pos,
          life: 0.3,
          size: this.diameter * 0.8,
          alpha: 0.75,
        }),
      );

      if (f.type === "honeyMark") {
        collectPollen({
          x: f.x,
          z: f.z,
          pattern: f.flowers,
          amount: 7,
          yOffset: 2.25 + Math.random() * 0.5,
          stackOffset: 0.4 + Math.random() * 0.6,
          field: this.field,
          instantConversion: 1,
          multiplier: this.beeLevel * 0.1 + 1,
        });
      } else if (f.type === "pollenMark") {
        collectPollen({
          x: f.x,
          z: f.z,
          pattern: f.flowers,
          amount: 7,
          yOffset: 2.25 + Math.random() * 0.5,
          stackOffset: 0.4 + Math.random() * 0.6,
          field: this.field,
          multiplier: this.beeLevel * 0.1 + 1,
        });
      } else if (f.type === "preciseMark") {
        collectPollen({
          x: f.x,
          z: f.z,
          pattern: f.flowers,
          amount: 12,
          yOffset: 2.25 + Math.random() * 0.5,
          stackOffset: 0.4 + Math.random() * 0.6,
          field: this.field,
          alwaysCrit: true,
          multiplier: this.beeLevel * 0.1 + 1,
        });
      }
    }

    return this.life <= 0;
  }
}
