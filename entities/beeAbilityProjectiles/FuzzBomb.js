// entities/FuzzBomb.js
import { MATH } from "../utils/math.js";
import { vec3 } from "gl-matrix";

export class FuzzBomb {
  constructor(field, beeLevel, gameState) {
    const { objects, fieldInfo } = gameState;

    this.gameState = gameState;
    this.beeLevel = beeLevel;
    this.life = 5 + (beeLevel - 1) * 0.25;
    this.field = field;
    this.x = (fieldInfo[field].width * Math.random()) | 0;
    this.z = (fieldInfo[field].length * Math.random()) | 0;
    this.pos = [
      fieldInfo[this.field].x + this.x,
      fieldInfo[this.field].y + 0.5,
      fieldInfo[this.field].z + this.z,
    ];
    this.moveTimer = 0;
    this.movePos = [...this.pos]; // safe initial value so update() never reads undefined
    this.moveTo = [
      ((Math.random() * fieldInfo[this.field].width) | 0) +
        fieldInfo[this.field].x,
      fieldInfo[this.field].y + 0.5,
      ((Math.random() * fieldInfo[this.field].length) | 0) +
        fieldInfo[this.field].z,
    ];

    objects.explosions.push(
      new Explosion({
        col: [0.5, 0.2, 0],
        pos: this.pos.slice(),
        life: 0.4,
        size: 4,
        speed: 0.5,
        aftershock: 0.05,
      }),
    );
  }

  die(index, gameState) {
    gameState.objects.fuzzBombs.splice(index, 1);
  }

  pop(gameState) {
    const { player, objects, fieldInfo } = gameState;

    if (player.fieldIn !== this.field) {
      this.life = 0;
      return;
    }

    this.x = Math.round(this.pos[0] - fieldInfo[this.field].x);
    this.z = Math.round(this.pos[2] - fieldInfo[this.field].z);

    objects.explosions.push(
      new Explosion({
        col: [0.5, 0.2, 0],
        pos: this.pos.slice(),
        life: 0.4,
        size: 4,
        speed: 0.5,
        aftershock: 0.05,
      }),
    );

    const p = [
      [0, 0],
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [1, -1],
      [1, 0],
      [1, 1],
      [0, 1],
      [0, -1],
      [0, 2],
      [2, 0],
      [-2, 0],
      [0, -2],
      [-1, 2],
      [1, 2],
      [2, -1],
      [2, 1],
      [-1, -2],
      [1, -2],
      [-2, 1],
      [-2, -1],
      [3, 0],
      [-3, 0],
      [0, -3],
      [0, 3],
    ];

    for (let i in p) {
      const x = p[i][0] + this.x;
      const z = p[i][1] + this.z;

      if (
        x >= 0 &&
        x < fieldInfo[this.field].width &&
        z >= 0 &&
        z < fieldInfo[this.field].length
      ) {
        updateFlower(
          this.field,
          x,
          z,
          function (f) {
            if (f.level < 5) {
              f.level++;
              f.pollinationTimer = 1;
            } else {
              f.height = 1;
            }
          },
          true,
          false,
          true,
        );
      }
    }

    collectPollen({
      x: this.x,
      z: this.z,
      pattern: p,
      amount: { r: 10, w: 15, b: 10 },
      stackOffset: 0.35 + Math.random() * 0.7,
      multiplier: player.whiteBombPollen + this.beeLevel * 0.075,
      field: this.field,
    });

    player.addEffect("bombCombo");

    for (let j = 0; j < 40; j++) {
      ParticleRenderer.add({
        x: this.pos[0] + MATH.random(-2, 2),
        y: this.pos[1],
        z: this.pos[2] + MATH.random(-2, 2),
        vx: MATH.random(-1, 1),
        vy: Math.random() * 2,
        vz: MATH.random(-1, 1),
        grav: -3,
        size: 100,
        col: [1, 1, MATH.random(0.6, 1)],
        life: 1,
        rotVel: MATH.random(-3, 3),
        alpha: 2,
      });
    }

    this.life = 0;
  }

  update(dt, gameState) {
    const { player, meshes, fieldInfo } = gameState;

    this.life -= dt;
    this.moveTimer -= dt;

    if (this.moveTimer <= 0) {
      this.moveTimer = 1;
      const md = [
        [0, 0, 1],
        [1, 0, 0],
      ][(Math.random() * 2) | 0];

      if (md[2] === 0) {
        const px = Math.round(this.pos[0] - fieldInfo[this.field].x);
        const am = MATH.random(-px, fieldInfo[this.field].width - px) | 0;
        this.movePos = vec3.scale([], md, am);
        vec3.add(this.movePos, this.movePos, this.pos);
      }

      if (md[0] === 0) {
        const pz = Math.round(this.pos[2] - fieldInfo[this.field].z);
        const am = MATH.random(-pz, fieldInfo[this.field].length - pz) | 0;
        this.movePos = vec3.scale([], md, am);
        vec3.add(this.movePos, this.movePos, this.pos);
      }
    }

    this.pos[0] += (this.movePos[0] - this.pos[0]) * dt * 5;
    this.pos[2] += (this.movePos[2] - this.pos[2]) * dt * 5;

    if (
      vec3.sqrDist(this.pos, [
        player.body.position.x,
        player.body.position.y,
        player.body.position.z,
      ]) <= 4
    ) {
      this.pop(gameState);
    }

    meshes.explosions.instanceData.push(
      this.pos[0],
      this.pos[1],
      this.pos[2],
      0.5,
      0.2,
      0,
      Math.min(this.life, 0.85),
      1.25,
      1,
    );

    return this.life <= 0;
  }
}
