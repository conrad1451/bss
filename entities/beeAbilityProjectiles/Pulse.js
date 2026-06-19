class Pulse {
  constructor(color) {
    this.color = color;
    this.trail1 = new TrailRenderer.Trail({
      length: 15,
      size: 0.55,
      triangle: true,
      color: [1, 1, 1, 1],
    });
    this.trail2 = new TrailRenderer.Trail({
      length: 15,
      size: 0.2,
      triangle: true,
      color: color === "red" ? [1, 0, 0, 1] : [0, 0, 1, 1],
    });
    this.path = [];

    for (let i in objects.bees) {
      if (
        ["moveToSleep", "sleep"].indexOf(objects.bees[i].state) < 0 &&
        vec3.sqrDist(objects.bees[i].pos, [
          player.body.position.x,
          player.body.position.y,
          player.body.position.z,
        ]) <
          30 * 30 &&
        beeInfo[objects.bees[i].type].color === color
      ) {
        this.path.push(objects.bees[i].pos);
      }
    }

    this.t = 0;
    this.spliceTimer = 3;
    this.lastPoint = 0;
  }

  die(index) {
    this.trail1.splice = true;
    this.trail2.splice = true;

    objects.mobs.splice(index, 1);
  }

  update() {
    this.t += dt * 5;

    if (this.spliceTimer <= 0) {
      return true;
    }

    if (Math.ceil(this.t) >= this.path.length) {
      this.spliceTimer -= dt;
      this.trail1.addPos([]);
      this.trail2.addPos([]);

      return;
    }

    let a = this.path[this.t | 0],
      b = this.path[Math.ceil(this.t)],
      t = this.t - (this.t | 0),
      p = [
        MATH.lerp(a[0], b[0], t),
        MATH.lerp(a[1], b[1], t),
        MATH.lerp(a[2], b[2], t),
      ];

    this.trail1.addPos(p);
    this.trail2.addPos(p);

    if ((this.t | 0) !== this.lastPoint && player.fieldIn) {
      this.lastPoint = this.t | 0;

      let am = this.lastPoint * 0.5 + 4,
        x = Math.round(p[0] - fieldInfo[player.fieldIn].x),
        z = Math.round(p[2] - fieldInfo[player.fieldIn].z);

      collectPollen({
        x: x,
        z: z,
        pattern: [
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
          [2, 1],
          [2, -1],
          [-2, 1],
          [-2, -1],
          [1, -2],
          [1, 2],
          [-1, 2],
          [-1, -2],
          [-3, 0],
          [3, 0],
          [0, -3],
          [0, 3],
        ],
        amount: am,
        stackOffset: 0.4 + Math.random() * (0.3 + (am * 0.05 - 2)),
      });
    }
  }
}
