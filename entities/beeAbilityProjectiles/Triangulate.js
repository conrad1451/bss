// entities/beeAbilityProjectiles/Triangulate.js

// CHQ: Claude AI (Sonnet) refactored

import { MATH } from "../../utils/math.js";
import { Mesh } from "../Mesh.js";

export class Triangulate {
  constructor(bee, tokenPos, gameState) {
    this.gameState = gameState;
    this.bee = bee;
    this.tokenPos = tokenPos;
    this.life = MATH.random(2.9, 3.1);
    this.field = gameState.player.fieldIn;
    this.mesh = new Mesh(true);
    this.offset = (Math.random() - 0.5) * 0.075;
  }

  // CHQ: Claude AI (Sonnet) refactored - reads player pos via gameState.player.pos
  //      to match the body shim pattern used everywhere else,
  //      and reads fieldInfo from gameState.fieldInfo.
  die(index) {
    const { player, objects, fieldInfo } = this.gameState;

    // Use the body shim's underlying pos array directly
    const px = Math.round(player.pos[0] - fieldInfo[this.field].x);
    const pz = Math.round(player.pos[2] - fieldInfo[this.field].z);
    const tx = Math.round(this.tokenPos[0] - fieldInfo[this.field].x);
    const tz = Math.round(this.tokenPos[2] - fieldInfo[this.field].z);
    const bx = Math.round(this.bee.pos[0] - fieldInfo[this.field].x);
    const bz = Math.round(this.bee.pos[2] - fieldInfo[this.field].z);

    const minX = MATH.constrain(
      Math.min(bx, px, tx),
      0,
      fieldInfo[this.field].width,
    );
    const maxX = MATH.constrain(
      Math.max(bx, px, tx),
      0,
      fieldInfo[this.field].width,
    );
    const minZ = MATH.constrain(
      Math.min(bz, pz, tz),
      0,
      fieldInfo[this.field].length,
    );
    const maxZ = MATH.constrain(
      Math.max(bz, pz, tz),
      0,
      fieldInfo[this.field].length,
    );

    const f = [];
    for (let x = minX; x < maxX; x++) {
      for (let z = minZ; z < maxZ; z++) {
        if (MATH.pointInTriangle(x, z, px, pz, tx, tz, bx, bz)) {
          f.push([x, z]);
        }
      }
    }

    for (let i = objects.tokens.length - 1; i >= 0; i--) {
      const tok = objects.tokens[i];
      if (
        !(tok instanceof DupedToken) &&
        MATH.pointInTriangle(
          Math.round(tok.pos[0] - fieldInfo[this.field].x),
          Math.round(tok.pos[2] - fieldInfo[this.field].z),
          px,
          pz,
          tx,
          tz,
          bx,
          bz,
        )
      ) {
        tok.collect();
      }
    }

    let containsPollenMark = 1;
    let containsHoneyMark = false;
    let containsPreciseMark = false;
    let extraPollenFromMarks = 1;

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
        if (objects.marks[i].type === "pollenMark") containsPollenMark = 2;
        else if (objects.marks[i].type === "honeyMark")
          containsHoneyMark = true;
        else containsPreciseMark = true;
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
        player.pos[1] + 0.5,
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

    const explosionParams = (pos) => ({
      col: [1, 1, 1],
      pos,
      life: 0.25,
      size: 2,
      alpha: 1,
      height: 1,
    });

    objects.explosions.push(
      new ReverseExplosion(explosionParams(this.bee.pos.slice())),
    );
    objects.explosions.push(
      new ReverseExplosion(explosionParams(this.tokenPos)),
    );
    objects.explosions.push(
      new ReverseExplosion(explosionParams([...player.pos])),
    );

    objects.triangulates.splice(index, 1);
  }

  // CHQ: Claude AI (Sonnet) refactored - dt is now a parameter instead of an implicit global.
  //      Also calls die() itself when expired, consistent with mob cleanup pattern.
  update(dt, index) {
    this.life -= dt;

    const c = Math.max(1 - this.life * 0.25, 0.2);
    const { player } = this.gameState;

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
        player.pos[0],
        this.tokenPos[1] + this.offset,
        player.pos[2],
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

    if (this.life <= 0) {
      this.die(index);
      return true;
    }
    return false;
  }
}
