// entities/mobs/Flame.js

// CHQ: Claude AI (Sonnet) refactored

import { MATH } from "../../utils/math.js";
import { ReverseExplosion } from "../miscEntities/ReverseExplosion.js";
import { collectPollen } from "../../engine/collectPollen.js";

// CHQ: Claude AI (Sonnet) added - previously called via a bare
//      `gameState.ParticleRenderer`, but ParticleRenderer isn't
//      (and was never) attached to gameState anywhere in the
//      project. Importing it directly matches the convention
//      already used in bees.js and Bubble.js.
import { ParticleRenderer } from "../../engine/particles.js";

// TODO: gameState.COLORS doesn't exist yet either (not set in gameState.js
// or index.js). Reads below use optional chaining so they degrade to
// `undefined` instead of throwing, matching the fallback style already used
// for COLORS in BugMob.js (`gameState.COLORS?.whiteArr || [255,255,255]`)
// but there's no established fallback color for "honey" yet, so none is
// guessed here. Passing `undefined` through to textRenderer.add() should be
// treated as a marker that this still needs real wiring, not a silent success.

export class Flame {
  constructor(field, x, z, isStatic, gameState) {
    this.gameState = gameState;

    const { player, fieldInfo } = gameState;

    player.stats.flames++;

    this.life = 3 * (player.flameFuel ? 1.5 : 1) * player.flameLife;
    this.isStatic = isStatic;

    if (isStatic) {
      this.pos = [field, x, z];
    } else {
      this.field = field;
      this.x = x;
      this.z = z;
      this.pos = [
        this.x + fieldInfo[this.field].x,
        fieldInfo[this.field].y + 0.5,
        this.z + fieldInfo[this.field].z,
      ];
    }

    this.collectTimer = gameState.TIME + MATH.random(0.5, 1);
    this.particleTimer = gameState.TIME;

    if (player.flameFuel) {
      this._initOilTrail(gameState);
    }
  }

  // CHQ: Claude AI (Sonnet) refactored - extracted oil trail init shared by constructor and turnDark
  _initOilTrail(gameState) {
    const { player } = gameState;

    this.getRidOfOilTrailTimer = 2;
    this.oilT = 0;
    this.oilPos = [player.pos[0], player.pos[1] + 0.3, player.pos[2]];

    // FIXME: create TrailRenderer and import it here
    this.oilTrail = new TrailRenderer.Trail({
      length: 10,
      size: 0.75,
      triangle: true,
      color: [0.1, 0, 0, 1],
    });

    const convertCost = Math.min(
      Math.ceil(player.convertTotal * 0.02),
      player.pollen,
    );
    player.pollen -= convertCost;
    const honeyGained = Math.ceil(convertCost * player.honeyPerPollen);
    player.honey += honeyGained;

    if (player.extraInfo.enablePollenText) {
      gameState.textRenderer.add(
        honeyGained,
        [player.pos[0], player.pos[1] + Math.random() * 2 + 0.5, player.pos[2]],
        gameState.COLORS?.honey, // CHQ: Claude AI (Sonnet): was bare `COLORS.honey`; see TODO at top of file
        0,
        "+",
      );
    }
  }

  die(index) {
    const { objects } = this.gameState;

    if (this.oilTrail) this.oilTrail.splice = true;
    objects.flames.splice(index, 1);
  }

  turnDark() {
    if (this.dark) return;

    const { player, objects } = this.gameState;

    objects.explosions.push(
      new ReverseExplosion({
        col: [1, 0, 1],
        pos: this.pos,
        life: 0.5,
        size: 2,
        alpha: 1,
        height: 3,
      }),
    );

    this.dark = true;

    if (player.flameFuel) {
      this.life *= 1.5;

      const convertCost = Math.min(
        Math.ceil(player.convertTotal * 0.02),
        player.pollen,
      );
      player.pollen -= convertCost;
      const honeyGained = Math.ceil(convertCost * player.honeyPerPollen);
      player.honey += honeyGained;

      if (player.extraInfo.enablePollenText) {
        this.gameState.textRenderer.add(
          honeyGained,
          [
            player.pos[0],
            player.pos[1] + Math.random() * 2 + 0.5,
            player.pos[2],
          ],
          this.gameState.COLORS?.honey, // CHQ: Claude AI (Sonnet): was bare `COLORS.honey`; see TODO at top of file
          0,
          "+",
        );
      }

      this.getRidOfOilTrailTimer = 2;
      this.oilT = 0;
      this.oilPos = [player.pos[0], player.pos[1] + 0.3, player.pos[2]];

      if (!this.oilTrail) {
        this.oilTrail = new TrailRenderer.Trail({
          length: 15,
          size: 0.75,
          triangle: true,
          color: [0.1, 0, 0, 1],
        });
      } else {
        this.oilTrail.addPos([]);
      }
    }
  }

  // CHQ: Claude AI (Sonnet) refactored - dt and index are now explicit parameters
  //      instead of implicit globals. All globals (player, TIME, objects, fieldInfo,
  //      textRenderer, collectPollen) are read from this.gameState, except
  //      ParticleRenderer which is now a real module import (see top of file).
  update(dt, index) {
    const { player, objects, fieldInfo } = this.gameState;

    this.life -= dt;

    if (this.oilTrail) {
      this.oilPos[0] = MATH.lerp(this.oilPos[0], this.pos[0], this.oilT);
      this.oilPos[2] = MATH.lerp(this.oilPos[2], this.pos[2], this.oilT);
      this.oilT = Math.min(this.oilT + dt * 0.5, 1);
      this.oilTrail.addPos([...this.oilPos]);

      this.getRidOfOilTrailTimer -= dt;

      if (this.getRidOfOilTrailTimer <= 0) {
        this.oilTrail.splice = true;
        this.oilTrail = undefined;
      }
    }

    if (this.gameState.TIME - this.collectTimer > 1) {
      this.collectTimer = this.gameState.TIME;

      if (!this.isStatic && player.fieldIn === this.field) {
        collectPollen(
          {
            x: this.x,
            z: this.z,
            pattern: this.dark
              ? [
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
                ]
              : [
                  [0, 0],
                  [1, 1],
                  [1, -1],
                  [-1, 1],
                  [-1, -1],
                  [1, 0],
                  [-1, 0],
                  [0, 1],
                  [0, -1],
                ],
            amount: { r: 10, w: 4, b: 1 },
            stackHeight: 0.7,
            multiplier: player.flamePollen * player.flameBonus,
            instantConversion: player.instantFlameConversion,
            field: this.field,
          },
          this.gameState,
        );
      }
    }

    if (this.dark) {
      player.addEffect("darkHeat");
    }

    if (this.gameState.TIME - this.particleTimer > 0.5) {
      this.particleTimer = this.gameState.TIME;

      ParticleRenderer.add({
        x: this.pos[0],
        y: this.pos[1],
        z: this.pos[2],
        vx: MATH.random(-0.1, 0.1),
        vy: MATH.random(0, 0.3),
        vz: MATH.random(-0.1, 0.1),
        grav: 1,
        size: MATH.random(110, 180),
        col: this.dark ? [1, 0, Math.random()] : [1, MATH.random(0.3, 1), 0],
        life: 1.5,
        rotVel: MATH.random(-3, 3),
        alpha: 4.5,
      });
    }

    if (
      Math.abs(player.pos[0] - this.pos[0]) +
        Math.abs(player.pos[1] - this.pos[1]) +
        Math.abs(player.pos[2] - this.pos[2]) <
      2
    ) {
      player.stats.scorchingStar += dt * (this.dark ? 120 : 90);
      player.addEffect("flameHeat", this.dark ? 0.00025 : 0.0001);
    }

    if (this.life <= 0) {
      this.die(index);
      return true;
    }
    return false;
  }
}
