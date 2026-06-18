class GlitchEffect {
  constructor(field, life) {
    this.life = life;
    this.field = field;
    this.blocks = [];

    for (let i = 0; i < 4; i++) {
      this.blocks.push({
        pos: [
          fieldInfo[this.field].x +
            ((MATH.random(0.1, 0.9) * fieldInfo[this.field].width) | 0),
          fieldInfo[this.field].y + MATH.random(1, 4),
          fieldInfo[this.field].z +
            ((MATH.random(0.1, 0.9) * fieldInfo[this.field].length) | 0),
        ],
        col: [
          Math.round(Math.random()),
          Math.round(Math.random()),
          Math.round(Math.random()),
        ],
        timer: 0,
      });
    }
  }

  die(index) {
    objects.mobs.splice(index, 1);
  }

  update() {
    this.life -= dt;

    for (let i in this.blocks) {
      let b = this.blocks[i];

      b.timer -= dt;

      if (b.timer <= 0) {
        b.timer = MATH.random(0, 1);
        b.timer *= b.timer;
        b._pos = [
          b.pos[0] + MATH.random(-2, 2),
          b.pos[1] + MATH.random(-1, 1),
          b.pos[2] + MATH.random(-2, 2),
        ];
        b.alpha = MATH.random(0.2, 0.5);
        b.rad = MATH.random(0.5, 5);
        b.hei = MATH.random(0.1, 1.25) / b.rad;
      }

      meshes.cylinder_explosions.instanceData.push(
        ...b._pos,
        ...b.col,
        b.alpha,
        b.rad,
        b.hei,
      );
    }

    return this.life <= 0;
  }
}
