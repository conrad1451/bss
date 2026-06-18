class Beam {
  constructor(params, delay) {
    this.bee = params.bee;
    this.delay = delay;
    this.life = 0.5;
    this.center = [params.x, params.z];
    this.field = params.field;

    while (1) {
      let x = Math.round(MATH.random(-7, 7)) + this.center[0],
        z = Math.round(MATH.random(-7, 7)) + this.center[1];

      if (
        x >= 0 &&
        x < fieldInfo[this.field].width &&
        z >= 0 &&
        z < fieldInfo[this.field].length &&
        player.beamStormRayData.indexOf(x.toString() + "," + z.toString()) < 15
      ) {
        player.beamStormRayData.push(x.toString() + "," + z.toString());
        this.x = x;
        this.z = z;
        break;
      }
    }

    this.pos = [
      fieldInfo[this.field].x + this.x,
      fieldInfo[this.field].y,
      fieldInfo[this.field].z + this.z,
    ];
  }

  die(index) {
    objects.mobs.splice(index, 1);
  }

  update() {
    if (this.delay > 0) {
      this.delay -= dt;

      if (this.delay <= 0) {
        collectPollen({
          x: this.x,
          z: this.z,
          pattern: [[0, 0]],
          amount: 100000,
          field: this.field,
          instantConversion: this.bee.gifted ? 1 : 0,
          depleteAll: true,
        });
      }
    } else {
      this.life -= dt;

      meshes.cylinder_explosions.instanceData.push(
        this.pos[0],
        this.pos[1],
        this.pos[2],
        1,
        1,
        this.bee.gifted ? 1 : 0,
        1,
        0.1,
        10000,
      );

      return this.life <= 0;
    }
  }
}
