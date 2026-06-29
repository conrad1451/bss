import { beeInfo } from "../../data/bees";

class Cloud {
  constructor(field, x, z, life, windyBee) {
    this.windyBee = windyBee;

    if (windyBee) {
      this.trails = [
        new TrailRenderer.ConstantTrail({
          length: 9,
          size: 0.4,
          color: [0.5, 0.5, 0.5, 0.6],
        }),
        new TrailRenderer.ConstantTrail({
          length: 9,
          size: 0.4,
          color: [0.5, 0.5, 0.5, 0.6],
          vertical: true,
        }),
      ];
    }

    this.life = life;
    this.field = field;
    this.x = x;
    this.z = z;
    this._x = x;
    this._z = z;
    this.moveTo = [
      fieldInfo[this.field].x + this.x,
      fieldInfo[this.field].z + this.z,
    ];
    this.moveDir = [0, 0];
    this.y = fieldInfo[this.field].y + 0.55 + 4;
    this.pos = [
      fieldInfo[this.field].x + this.x,
      this.y - 10,
      fieldInfo[this.field].z + this.z,
    ];

    this.flowers = [];
    this.timer = 0;

    let rad = 3,
      sqRad = 2 * 2;

    for (let x = -rad; x <= rad; x++) {
      for (let z = -rad; z <= rad; z++) {
        if (x * x + z * z <= sqRad) {
          this.flowers.push([x, z]);
        }
      }
    }
  }

  die(index) {
    if (this.windyBee) {
      this.trails[0].splice = true;
      this.trails[1].splice = true;
    }

    objects.mobs.splice(index, 1);
  }

  update() {
    if (this.pos[1] - 0.1 < this.y) {
      this.pos[1] += (this.y - this.pos[1]) * dt * 5;
    }

    this.life -= dt;

    this.pos[0] += this.moveDir[0] * dt;
    this.pos[2] += this.moveDir[1] * dt;

    this.x = Math.round(this.pos[0] - fieldInfo[this.field].x);
    this.z = Math.round(this.pos[2] - fieldInfo[this.field].z);

    this.timer -= dt;

    if (this.timer <= 0) {
      this.timer = 0.15;

      ParticleRenderer.add({
        x: this.pos[0] + MATH.random(-1.5, 1.5),
        y: this.pos[1] - 0.75,
        z: this.pos[2] + MATH.random(-1.5, 1.5),
        vx: 0,
        vy: -6,
        vz: 0,
        grav: -7,
        size: MATH.random(30, 60),
        col: [0.6, 0.6, 0.7],
        life: 0.75,
        rotVel: MATH.random(-6, 6),
        alpha: 25,
      });

      if (player.fieldIn === this.field) {
        for (let i in this.flowers) {
          let p = this.flowers[i];

          let _x = this.x + p[0],
            _z = this.z + p[1];

          if (
            _x >= 0 &&
            _x < fieldInfo[this.field].width &&
            _z >= 0 &&
            _z < fieldInfo[this.field].length
          ) {
            updateFlower(
              this.field,
              _x,
              _z,
              function (f) {
                f.height += 0.25;
              },
              true,
              false,
              false,
            );
          }
        }
      }

      if (
        vec3.sqrDist(this.pos, [
          player.body.position.x,
          player.body.position.y + 4,
          player.body.position.z,
        ]) <= 6.25
      ) {
        player.addEffect("cloudBoost", 0.1);

        if (this.windyBee) {
          objects.mobs.push(new WildWindyBee(this.field, this.pos.slice()));
          this.trails[0].splice = true;
          this.trails[1].splice = true;
          this.windyBee = false;
        }
      }
    }

    let c = 0.7 * player.isNight;

    meshes.explosions.instanceData.push(
      this.pos[0] - 0.45,
      this.pos[1],
      this.pos[2],
      c,
      c,
      c,
      0.8,
      2.1,
      0.9,
    );
    meshes.explosions.instanceData.push(
      this.pos[0] + 0.45,
      this.pos[1],
      this.pos[2] + 0.7,
      c,
      c,
      c,
      0.8,
      1.8,
      0.9,
    );
    meshes.explosions.instanceData.push(
      this.pos[0] - 0.5,
      this.pos[1],
      this.pos[2] - 0.8,
      c,
      c,
      c,
      0.8,
      1.9,
      0.9,
    );
    meshes.explosions.instanceData.push(
      this.pos[0] + 0.75,
      this.pos[1],
      this.pos[2] - 0.3,
      c,
      c,
      c,
      0.8,
      2.2,
      0.9,
    );

    if (
      Math.abs(this.pos[0] - this.moveTo[0]) +
        Math.abs(this.pos[2] - this.moveTo[1]) <
      1
    ) {
      this.flowerTo = this.moveTo.slice();

      this.flowerTo[0] -= fieldInfo[this.field].x;
      this.flowerTo[1] -= fieldInfo[this.field].z;

      this.moveTo = [
        fieldInfo[this.field].x +
          ((Math.random() * fieldInfo[this.field].width) | 0),
        fieldInfo[this.field].z +
          ((Math.random() * fieldInfo[this.field].length) | 0),
      ];

      this.moveDir = [
        this.moveTo[0] - this.pos[0],
        this.moveTo[1] - this.pos[2],
      ];

      vec2.normalize(this.moveDir, this.moveDir);

      if (this.windyBee) vec3.scale(this.moveDir, this.moveDir, 1.25);
    }

    if (this.windyBee) {
      meshes.bees.instanceData.push(
        this.pos[0],
        this.pos[1],
        this.pos[2],
        1.5,
        this.moveDir[0],
        0,
        this.moveDir[1],
        BEE_FLY,
        beeInfo.windy.u,
        beeInfo.windy.v,
        beeInfo.windy.meshPartId,
      );

      if (!(frameCount % 12)) {
        this.trails[0].addPos(this.pos.slice());
        this.trails[1].addPos(this.pos.slice());
      }
    }

    return this.life <= 0;
  }
}
