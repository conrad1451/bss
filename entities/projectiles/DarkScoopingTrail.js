class DarkScoopingTrail {
  constructor() {
    this.bodyPos = [
      player.body.position.x,
      player.body.position.y,
      player.body.position.z,
    ];

    let d = player.bodyDir.slice(),
      r = [-d[2], 0, d[0]];

    this.startPos = [d[0] * 2 + r[0] * 4, 0.05, d[2] * 2 + r[2] * 4];
    this.endPos = [d[0] * 2 - r[0] * 4, 0.05, d[2] * 2 - r[2] * 4];

    this.control2 = vec3.scale([], this.startPos, 2);
    this.control1 = vec3.scale([], this.endPos, 5.25);

    this.lifespan = 0.3;
    this.life = this.lifespan;
    this.trail = new TrailRenderer.Trail({
      length: 15,
      size: 0.5,
      triangle: true,
      color: [0.8, 0, 0.8, 0.6],
      fadeTo: [0.5, 0, 0, 0.6],
    });

    this.lastPos = [];
  }

  die(index) {
    this.trail.splice = true;
    objects.mobs.splice(index, 1);
  }

  update() {
    if (this.waitTimer > 0) {
      this.waitTimer -= dt;
      this.trail.addPos(vec3.add(this.lastPos, this.lastPos, this.lastVel));

      return this.waitTimer <= 0;
    }

    this.life -= dt;

    let p = MATH.generateBezierCurve(
      this.endPos,
      this.control1,
      this.control2,
      this.startPos,
      MATH.constrain(this.life * (1 / this.lifespan), 0, 1),
    );

    vec3.add(p, p, this.bodyPos);

    this.trail.addPos(p);

    this.lastVel = vec3.sub([], this.lastPos, p);

    this.lastPos = p;

    if (this.life <= 0) {
      this.waitTimer = 0.5;
      vec3.scale(this.lastVel, this.lastVel, -0.01);
    }
  }
}
