class Sprinkler {
  constructor() {
    this.power = gear.sprinkler[player.currentGear.sprinkler].power;
    this.rate = gear.sprinkler[player.currentGear.sprinkler].rate;
    this.diameter = gear.sprinkler[player.currentGear.sprinkler].diameter;

    this.timer = this.rate;

    let p = this.power;
    this.func = function (f) {
      f.height += p;
    };
  }

  set(f, x, z) {
    if (!fieldInfo[f]) return;

    this.field = f;
    this.x = x;
    this.z = z;
    this.timer = this.rate;

    this.flowers = [];

    let rad = (this.diameter * 0.5) | 0;

    for (let x = -rad; x <= rad; x++) {
      for (let z = -rad; z <= rad; z++) {
        let _x = x + this.x,
          _z = z + this.z;

        if (
          x * x + z * z <= rad * rad &&
          _x >= 0 &&
          _x < fieldInfo[this.field].width &&
          _z >= 0 &&
          _z < fieldInfo[this.field].length
        ) {
          this.flowers.push([_x, _z]);
        }
      }
    }
  }

  update() {
    this.timer -= dt;

    if (this.field && this.timer <= 0) {
      this.timer = this.rate;

      for (let i in this.flowers) {
        updateFlower(
          this.field,
          this.flowers[i][0],
          this.flowers[i][1],
          this.func,
          true,
          false,
          false,
        );
      }

      objects.explosions.push(
        new Explosion({
          col: [0.1, 0.4, 1],
          pos: [
            this.x + fieldInfo[this.field].x,
            fieldInfo[this.field].y + 0.5,
            this.z + fieldInfo[this.field].z,
          ],
          life: 1,
          size: this.diameter,
          speed: 0.15,
          aftershock: 0.01,
          height: 0.075,
        }),
      );
    }
  }
}
