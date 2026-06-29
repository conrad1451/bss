class Bubble {
  constructor(field, x, z, golden) {
    this.golden = golden;
    this.col = this.golden ? [1, 0.6, 0.1] : [0, 0.4, 0.9];
    this.life = 10;
    this.field = field;
    this.x = x;
    this.z = z;
    this.pos = [
      fieldInfo[this.field].x + this.x,
      fieldInfo[this.field].y + 0.5,
      fieldInfo[this.field].z + this.z,
    ];
    this.birth = TIME;
  }

  die(index) {
    objects.bubbles.splice(index, 1);
  }

  turnGolden() {
    if (this.golden) return;

    this.golden = true;
    this.col = [0.875 * 0.85, 0.85 * 0.85, 0.1 * 0.85];

    for (let i = 0; i < 10; i++) {
      ParticleRenderer.add({
        x: this.pos[0],
        y: this.pos[1],
        z: this.pos[2],
        vx: MATH.random(-2, 2),
        vy: MATH.random(0, 2),
        vz: MATH.random(-2, 2),
        grav: 0,
        size: MATH.random(30, 100),
        col: [1, 1, 0],
        life: 1.75,
        rotVel: MATH.random(-3, 3),
        alpha: 3,
      });
    }
  }

  pop() {
    player.stats.bubbles++;

    if (player.popStarActive) {
      player.popStarActive.popParticles.push(this.pos);
    }

    if (player.popStarActive) {
      player.stats.popStar += this.golden ? 2 : 1;
      player.addEffect("bubbleBloat", (this.golden ? 4 : 2) / (60 * 60));
    }

    if (player.currentGear.tool === "tidePopper") {
      player.addEffect("tidePower");

      if (this.golden) player.addEffect("tidePower");

      if (player.tidalSurge) {
        player.addEffect("tidalSurge", this.golden ? 0.00003 : 0.00001);
      }
    }

    objects.explosions.push(
      new Explosion({
        col: this.col,
        pos: this.pos.slice(),
        life: 0.2,
        size: 4,
        speed: 0.5,
        aftershock: 0.05,
      }),
    );
    let g = this.golden ? 1.5 * player.bubblePollen : player.bubblePollen;

    let p = collectPollen({
      x: this.x,
      z: this.z,
      pattern: [
        [0, 0],
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [1, -1],
        [1, 0],
        [1, 1],
        [0, 1],
        [0, -1],
        [-2, 0],
        [2, 0],
        [0, 2],
        [0, -2],
        [2, 1],
        [2, -1],
        [-2, 1],
        [-2, -1],
        [1, 2],
        [-1, 2],
        [1, -2],
        [-1, -2],
        [3, 0],
        [-3, 0],
        [0, -3],
        [0, 3],
        [3, 1],
        [3, -1],
        [1, 3],
        [-1, 3],
        [-1, -3],
        [1, -3],
        [-3, 1],
        [-3, -1],
      ],
      amount: { r: 2, w: 6, b: 10 },
      stackHeight: 0.45 + Math.random() * 0.5,
      replenish: 1,
      field: this.field,
      multiplier: g * player.bubbleBonus,
    });

    if (this.golden && p && Math.random() < 0.25) {
      objects.tokens.push(
        new LootToken(
          30,
          [this.pos[0], this.pos[1] + 0.7, this.pos[2]],
          "honey",
          Math.ceil(p * 0.5),
          true,
          "Gold Bubble",
        ),
      );
    }

    this.life = 0;
  }

  update() {
    this.life -= dt;

    if (
      vec3.sqrDist(this.pos, [
        player.body.position.x,
        player.body.position.y,
        player.body.position.z,
      ]) <= 4
    ) {
      this.pop();
    }

    meshes.explosions.instanceData.push(
      this.pos[0],
      this.pos[1] + 0.3,
      this.pos[2],
      this.col[0] * player.isNight,
      this.col[1] * player.isNight,
      this.col[2] * player.isNight,
      Math.min(this.life * 0.35, this.golden ? 0.8 : 0.7),
      Math.min((TIME - this.birth) * 15, 3),
      1,
    );

    return this.life <= 0;
  }
}
