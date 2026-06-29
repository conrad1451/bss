// entities/beeAbilityProjectiles/Triangulate.js

import { MATH } from "../../utils/math.js";
import { Mesh } from "../Mesh.js";
export class Triangulate {
  constructor(bee, tokenPos, gameState) {
    this.gameState = gameState; // Store references to player, objects, etc.
    this.bee = bee;
    this.tokenPos = tokenPos;
    this.life = MATH.random(2.9, 3.1);
    this.field = gameState.player.fieldIn;
    this.mesh = new Mesh(true);
    this.offset = (Math.random() - 0.5) * 0.075;
  }

  die(index) {
    // Access variables through this.gameState
    const { player, objects, fieldInfo } = this.gameState;

    let px = Math.round(player.body.position.x - fieldInfo[this.field].x),
      pz = Math.round(player.body.position.z - fieldInfo[this.field].z),
      tx = Math.round(this.tokenPos[0] - fieldInfo[this.field].x),
      tz = Math.round(this.tokenPos[2] - fieldInfo[this.field].z),
      bx = Math.round(this.bee.pos[0] - fieldInfo[this.field].x),
      bz = Math.round(this.bee.pos[2] - fieldInfo[this.field].z),
      minX = Math.min(Math.min(bx, px), tx),
      maxX = Math.max(Math.max(bx, px), tx),
      minZ = Math.min(Math.min(bz, pz), tz),
      maxZ = Math.max(Math.max(bz, pz), tz);

    minX = MATH.constrain(minX, 0, fieldInfo[this.field].width);
    maxX = MATH.constrain(maxX, 0, fieldInfo[this.field].width);
    minZ = MATH.constrain(minZ, 0, fieldInfo[this.field].length);
    maxZ = MATH.constrain(maxZ, 0, fieldInfo[this.field].length);

    let f = [];

    for (let x = minX; x < maxX; x++) {
      for (let z = minZ; z < maxZ; z++) {
        if (MATH.pointInTriangle(x, z, px, pz, tx, tz, bx, bz)) {
          f.push([x, z]);
        }
      }
    }

    for (let i in objects.tokens) {
      if (
        MATH.pointInTriangle(
          Math.round(objects.tokens[i].pos[0] - fieldInfo[this.field].x),
          Math.round(objects.tokens[i].pos[2] - fieldInfo[this.field].z),
          px,
          pz,
          tx,
          tz,
          bx,
          bz,
        ) &&
        !(objects.tokens[i] instanceof DupedToken)
      ) {
        objects.tokens[i].collect();
      }
    }

    let containsPollenMark = 1,
      containsHoneyMark,
      containsPreciseMark,
      extraPollenFromMarks = 1;

    for (let i in objects.marks) {
      if (
        MATH.pointInTriangle(
          objects.marks[i].x,
          objects.marks[i].z,
          px,
          pz,
          tx,
          tz,
          bx,
          bz,
        )
      ) {
        extraPollenFromMarks = 1.5;

        if (objects.marks[i].type === "pollenMark") {
          containsPollenMark = 2;
        } else if (objects.marks[i].type === "honeyMark") {
          containsHoneyMark = true;
        } else {
          containsPreciseMark = true;
        }
      }
    }

    collectPollen({
      x: 0,
      z: 0,
      pattern: f,
      amount: 10 + this.bee.level * 2,
      yOffset: 2.5,
      stackHeight: 0.8,
      field: this.field,
      otherPos: [
        (minX + maxX) * 0.5 + fieldInfo[this.field].x,
        player.body.position.y + 0.5,
        (minZ + maxZ) * 0.5 + fieldInfo[this.field].z,
      ],
      multiplier: {
        r: extraPollenFromMarks,
        b: extraPollenFromMarks,
        w: containsPollenMark * extraPollenFromMarks,
      },
      alwaysCrit: containsPreciseMark,
      instantConversion: containsHoneyMark ? 0.5 : 0,
    });

    objects.explosions.push(
      new ReverseExplosion({
        col: [1, 1, 1],
        pos: this.bee.pos.slice(),
        life: 0.25,
        size: 2,
        alpha: 1,
        height: 1,
      }),
    );
    objects.explosions.push(
      new ReverseExplosion({
        col: [1, 1, 1],
        pos: this.tokenPos,
        life: 0.25,
        size: 2,
        alpha: 1,
        height: 1,
      }),
    );
    objects.explosions.push(
      new ReverseExplosion({
        col: [1, 1, 1],
        pos: [
          player.body.position.x,
          player.body.position.y,
          player.body.position.z,
        ],
        life: 0.25,
        size: 2,
        alpha: 1,
        height: 1,
      }),
    );

    objects.triangulates.splice(index, 1);
  }

  update() {
    this.life -= dt;

    let c = Math.max(1 - this.life * 0.25, 0.2);

    this.mesh.setMesh(
      [
        this.tokenPos[0],
        this.tokenPos[1] + this.offset,
        this.tokenPos[2],
        c,
        c,
        c,
        1,
        0,
        0,
        0,
        this.bee.pos[0],
        this.tokenPos[1] + this.offset,
        this.bee.pos[2],
        c,
        c,
        c,
        1,
        0,
        0,
        0,
        player.body.position.x,
        this.tokenPos[1] + this.offset,
        player.body.position.z,
        c,
        c,
        c,
        1,
        0,
        0,
        0,
      ],
      [0, 1, 2, 2, 1, 0],
    );

    this.mesh.setBuffers();
    this.mesh.render();

    return this.life <= 0;
  }
}
