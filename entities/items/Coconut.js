class Coconut {
  constructor(
    x = player.flowerIn.x,
    z = player.flowerIn.z,
    delay = 0,
    isBigFatBully,
  ) {
    this.isBigFatBully = isBigFatBully;
    this.delay = delay;
    this.field = player.fieldIn;
    this.x = x;
    this.z = z;
    this.pos = [
      fieldInfo[this.field].x + this.x,
      fieldInfo[this.field].y + 0.51,
      fieldInfo[this.field].z + this.z,
    ];
    this.y = this.pos[1] + 25;
    this.glow = 0;
    this.vel = 0;
    this.displaySize = isBigFatBully ? 6 : 4.5;
  }

  die(index) {
    if (this.isBigFatBully) {
      if (
        vec3.sqrDist(this.pos, [
          player.body.position.x,
          player.body.position.y,
          player.body.position.z,
        ]) <= this.displaySize
      )
        player.damage(100);
    } else {
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
        amount: 50,
        yOffset: 2.25,
        stackHeight: 0.75 + Math.random() * 0.25,
        field: this.field,
        multiplier: player.pollenFromCoconuts,
      });

      let hpt = Math.ceil(
        Math.min(player.convertTotal, player.pollenInBag) / 5,
      );

      if (
        vec3.sqrDist(this.pos, [
          player.body.position.x,
          player.body.position.y,
          player.body.position.z,
        ]) <= this.displaySize
      ) {
        player.stats.fallingCoconuts++;

        if (hpt) {
          player.pollenInBag -= Math.ceil(
            Math.min(player.convertTotal, player.pollenInBag),
          );

          for (let i = 0; i < MATH.TWO_PI; i += MATH.TWO_PI / 5) {
            objects.tokens.push(
              new LootToken(
                30,
                [
                  this.pos[0] + Math.cos(i) * this.displaySize * 0.6,
                  fieldInfo[this.field].y + 1,
                  this.pos[2] + Math.sin(i) * this.displaySize * 0.6,
                ],
                "honey",
                Math.ceil(hpt),
                true,
                "Coconut",
              ),
            );
          }
        }
      }

      let d = this.displaySize + 1;

      d *= d;

      for (let i in objects.mobs) {
        if (
          objects.mobs[i].state === "attack" &&
          vec3.sqrDist(this.pos, objects.mobs[i].pos) < d
        ) {
          objects.mobs[i].damage(2500);
        }
      }
    }

    objects.mobs.splice(index, 1);
  }

  update() {
    if (this.delay > 0) {
      this.delay -= dt;
    } else {
      this.vel -= dt * 20;
      this.glow += dt;
      this.y += this.vel * dt;

      meshes.cylinder_explosions.instanceData.push(
        this.pos[0],
        this.pos[1],
        this.pos[2],
        this.isBigFatBully ? 1 : 0,
        this.isBigFatBully ? 0 : 1,
        0,
        this.glow * 0.75,
        this.displaySize,
        0.001,
      );
      meshes.explosions.instanceData.push(
        this.pos[0],
        this.y,
        this.pos[2],
        1,
        1,
        1,
        0.15,
        -this.displaySize - 1,
        1,
      );
      meshes.explosions.instanceData.push(
        this.pos[0],
        this.y,
        this.pos[2],
        0.3 * player.isNight,
        0.1 * player.isNight,
        0,
        1,
        this.displaySize,
        1,
      );

      return this.y + this.displaySize < this.pos[1];
    }
  }
}
