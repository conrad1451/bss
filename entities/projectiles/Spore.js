class Spore {
  constructor(pos, field, x, z, level, plife, prevFields, type) {
    this.type = type;
    this.plife = plife;
    this.prevFields = prevFields;
    this.field = field;
    this.x = x;
    this.z = z;
    this.pos = pos.slice();
    this.startPos = pos.slice();
    this.endPos = [
      fieldInfo[this.field].x + this.x,
      fieldInfo[this.field].y,
      fieldInfo[this.field].z + this.z,
    ];
    this.controlPos = [
      (this.startPos[0] + this.endPos[0]) * 0.5,
      Math.max(this.startPos[1], this.endPos[1]) + 15,
      (this.startPos[2] + this.endPos[2]) * 0.5,
    ];
    this.level = level;
    this.displayScale = (this.level - 1) * 0.1 + 1.15;

    this.t = 0;
  }

  die(index) {
    objects.mobs.push(
      new Puffshroom(
        this.field,
        this.x,
        this.z,
        this.plife,
        this.level,
        this.type,
      ),
    );

    objects.explosions.push(
      new Explosion({
        col: [0.6, 0.5, 0.1],
        pos: [
          this.endPos[0],
          this.endPos[1] + (((this.level - 1) * 0.125 + 1) * 1.75 + 0.25) * 0.5,
          this.endPos[2],
        ],
        life: 1,
        size: this.displayScale * 2,
        speed: 0.2,
        aftershock: 0.05,
      }),
    );

    objects.mobs.splice(index, 1);
  }

  update() {
    this.t += dt * 0.333;

    vec3.lerp(
      this.pos,
      vec3.lerp([], this.startPos, this.controlPos, this.t),
      vec3.lerp([], this.controlPos, this.endPos, this.t),
      this.t,
    );

    meshes.explosions.instanceData.push(
      this.pos[0],
      this.pos[1],
      this.pos[2],
      0.6,
      0.5,
      0.1,
      0.85,
      this.displayScale,
      1,
    );

    return this.t >= 1;
  }
}
