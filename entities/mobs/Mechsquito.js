// entities/mobs/Mechsquito.js
import { MATH } from "../../utils/math.js";
import { vec2, vec3 } from "gl-matrix";
import { Mob } from "./MobTemplate.js";
// TODO: CHQ: Claude AI (Sonnet): TrailRenderer doesn't exist yet in this codebase. Bullet trails
// are disabled below until that module is built — bullets still fire,
// track, and damage, they just don't render a trail behind them.
// import { TrailRenderer } from "../engine/trailRenderer.js"; // CHQ: adjust path — not present in provided files

import { ParticleRenderer } from "../../engine/particles.js"; // CHQ: adjust path — not present in provided files

// CHQ: Claude AI (Sonnet): Converted from standalone Mechsquito to an extension of Mob.
// Preserves the wander/aim/fire attack loop and bullet simulation, but
// routes everything through gameState instead of module-level globals
// and drops the raw gl.* draw call (rendering is owned by renderer.js
// in this codebase, not entity update()).

export class Mechsquito extends Mob {
  /**
   * @param {Object} gameState - The live game state object.
   * @param {string} field - Field id this mob belongs to (used for bounds/spawn).
   * @param {number} level - Mob level, drives HP scaling.
   * @param {boolean} isMega - Whether this is the "megaMechsquito" variant.
   */
  constructor(gameState, field, level, isMega) {
    const fieldInfo = gameState.fieldInfo;
    const pos = [
      fieldInfo[field].x + Math.random() * fieldInfo[field].width,
      fieldInfo[field].y + 4,
      fieldInfo[field].z + Math.random() * fieldInfo[field].length,
    ];

    let health = ((level - 1) * (level - 1) * 50 + 50) * 0.25;
    if (isMega) health = health * 1.5;

    // Mob's constructor signature is (id, type, pos, hp, lvl, gameState)
    super(
      gameState.globalId++,
      isMega ? "megaMechsquito" : "mechsquito",
      pos,
      health,
      level,
      gameState,
    );

    this.mega = isMega ? "megaMechsquito" : "mechsquito";
    this.isMega = isMega;
    this.field = field;
    this.state = "attack";
    this.starSawHitTimer = 0;
    this.health = this.hp;
    this.maxHealth = this.health;
    this.checkTimer = gameState.TIME || 0;
    this.flameTimer = 0;
    this.waitTimer = 0;
    this.target = [this.pos[0], this.pos[2]];
    this.damageTimer = 0;
    this.bodySize = 1.5;
    this.runningAmount = 0;
    this.mindHacked = 0;

    // CHQ: preserved as-is from the original — `timeLimit` is read/decremented
    // in update() but was never initialized in the original constructor either.
    // Leaving uninitialized rather than guessing a value and silently changing behavior.
    this.timeLimit = undefined;

    this.bullets = [];
    // CHQ: Claude AI (Sonnet): this.bulletTrail1 / bulletTrail2 — re-add once TrailRenderer exists
    // this.bulletTrail1 = new TrailRenderer.ConstantTrail({
    //   length: 2,
    //   size: 0.1,
    //   color: [0, 1, 0],
    // });
    // this.bulletTrail2 = new TrailRenderer.ConstantTrail({
    //   length: 2,
    //   size: 0.1,
    //   color: [0, 1, 0],
    //   vertical: true,
    // });

    // CHQ: stashed so the setTimeout-driven aim/fire sequence below (which
    // fires well after any single update() call returns) has a gameState
    // to close over. Refreshed every update() call.
    this.gameState = gameState;
  }

  /**
   * Applies damage with crit/super-crit rolls and mind-hack amplification.
   *
   * @param {number} am - Base damage amount.
   * @param {Object} gameState - The live game state object.
   * @returns {void}
   */
  damage(am, gameState) {
    const player = gameState.player;
    const crit = Math.random() < player.criticalChance;
    const superCrit = Math.random() < (player.superCritChance || 0);
    let d =
      am *
      (crit
        ? superCrit
          ? player.superCritPower * player.criticalPower
          : player.criticalPower
        : 1);

    if (this.mindHacked > 0) d *= 1.25;

    this.health -= d | 0;
    this.hp = this.health; // keep base-class hp in sync

    const sizeScale = [0, 1.25, 1.275, 1.3, 1.65, 1.75];
    gameState.textRenderer.add(
      (d | 0) + "",
      [this.pos[0], this.pos[1] + Math.random() * 2.75 + 1.5, this.pos[2]],
      [255, 0, 0],
      crit ? (superCrit ? 2 : 1) : 0,
      "",
      sizeScale[Math.min(d.toString().length, 5)],
    );
  }

  /**
   * Per-frame update: wander/aim/fire attack state, flame damage, bullet
   * simulation, and mind-hack idle behavior. Overrides Mob.update entirely
   * — the base Mob's aggro/return logic doesn't apply to this fly/shoot AI.
   *
   * @param {number} dt - Delta time in seconds.
   * @param {Object} gameState - The live game state object.
   * @returns {boolean} true once health drops to 0 (mirrors the death-signal
   *   contract used by updateEngine.js), false otherwise.
   */
  update(dt, gameState) {
    this.gameState = gameState; // refresh closure target for deferred timeouts

    const player = gameState.player;
    const fieldInfo = gameState.fieldInfo;
    const objects = gameState.objects;
    const textRenderer = gameState.textRenderer;
    const TIME = gameState.TIME || 0;

    switch (this.state) {
      case "attack": {
        if (this.health <= 0) {
          if (!player.stats.mechsquito) player.stats.mechsquito = 0;
          player.stats.mechsquito++;

          return true;
        }

        this.mindHacked -= dt;
        this.timeLimit -= dt;
        this.starSawHitTimer -= dt;
        this.flameTimer -= dt;

        if (this.flameTimer <= 0) {
          this.flameTimer = 1;

          for (const f in objects.flames) {
            if (
              Math.abs(this.pos[0] - objects.flames[f].pos[0]) +
                Math.abs(this.pos[2] - objects.flames[f].pos[2]) <
              this.bodySize
            ) {
              this.damage(objects.flames[f].dark ? 25 : 15, gameState);
            }
          }
        }

        if (player.fieldIn === this.field) {
          player.attacked.push(this);
        }

        if (this.mindHacked <= 0) {
          let d = [this.target[0] - this.pos[0], this.target[1] - this.pos[2]];

          if (Math.abs(d[0]) + Math.abs(d[1]) < 0.75) {
            this.target = [
              fieldInfo[this.field].x +
                Math.random() * fieldInfo[this.field].width,
              fieldInfo[this.field].z +
                Math.random() * fieldInfo[this.field].length,
            ];
            d = [this.target[0] - this.pos[0], this.target[1] - this.pos[2]];

            this.runningAmount--;

            if (this.runningAmount <= 0) {
              this.waitTimer = 1;
              this.runningAmount = 3;

              const DIS = this;
              let t;

              window.setTimeout(function () {
                t = [
                  player.body.position.x - DIS.pos[0],
                  player.body.position.y - DIS.pos[1],
                  player.body.position.z - DIS.pos[2],
                ];
              }, 450);

              window.setTimeout(function () {
                const gs = DIS.gameState;
                const p = gs.player;

                if (p.fieldIn !== DIS.field) return;

                vec3.normalize(t, t);
                vec3.scale(t, t, 38);

                if (DIS.isMega) {
                  for (let i = 0; i < 6; i++) {
                    const _t = [
                      t[0] + MATH.random(-5, 5),
                      t[1] + MATH.random(-5, 5),
                      t[2] + MATH.random(-5, 5),
                    ];

                    DIS.bullets.push({
                      pos: DIS.pos.slice(),
                      vel: _t,
                      life: 0.5,
                    });

                    const _c = MATH.random(0.05, 0.2);

                    ParticleRenderer.add({
                      x: DIS.pos[0],
                      y: DIS.pos[1],
                      z: DIS.pos[2],
                      vx: _t[0],
                      vy: _t[1],
                      vz: _t[2],
                      grav: 0,
                      size: 100,
                      col: [1, _c, _c],
                      life: 0.5,
                      rotVel: MATH.random(-15, 15),
                      alpha: 1000,
                    });
                  }
                } else {
                  DIS.bullets.push({ pos: DIS.pos.slice(), vel: t, life: 0.5 });

                  const _c = MATH.random(0.05, 0.2);

                  ParticleRenderer.add({
                    x: DIS.pos[0],
                    y: DIS.pos[1],
                    z: DIS.pos[2],
                    vx: t[0],
                    vy: t[1],
                    vz: t[2],
                    grav: 0,
                    size: 200,
                    col: [1, _c, _c],
                    life: 0.5,
                    rotVel: MATH.random(-15, 15),
                    alpha: 1000,
                  });
                }
              }, 600);
            }
          }

          vec2.normalize(d, d);

          this.running = false;
          this.waitTimer -= dt;

          if (this.waitTimer <= 0) {
            this.pos[0] += d[0] * dt * 6;
            this.pos[2] += d[1] * dt * 6;
            this.running = true;
          }

          this.damageTimer -= dt;

          if (
            Math.abs(player.body.position.x - this.pos[0]) +
              Math.abs(player.body.position.y - this.pos[1] - 2.5) +
              Math.abs(player.body.position.z - this.pos[2]) <
              this.bodySize &&
            this.damageTimer <= 0
          ) {
            player.damage(20);
            this.damageTimer = 1;
          }

          this.pos[3] =
            Math.atan2(d[1], d[0]) +
            MATH.HALF_PI +
            Math.sin(TIME * 40) * 0.1 +
            (!this.running ? TIME * 10 : 0);

          // CHQ: preserved as-is — `for...in` over an array plus a splice
          // mid-iteration is the same pattern as the original (buggy with
          // stale indices after a splice), kept unchanged rather than
          // silently fixed.
          for (const i in this.bullets) {
            this.bullets[i].life -= dt;

            vec3.scaleAndAdd(
              this.bullets[i].pos,
              this.bullets[i].pos,
              this.bullets[i].vel,
              dt,
            );

            if (
              Math.abs(this.bullets[i].pos[0] - player.body.position.x) +
                Math.abs(this.bullets[i].pos[1] - player.body.position.y) +
                Math.abs(this.bullets[i].pos[2] - player.body.position.z) <
              2
            ) {
              player.damage(7);
              this.bullets[i].damaged = true;
            }

            if (this.bullets[i].life <= 0 || this.bullets[i].damaged)
              this.bullets.splice(i, 1);
          }
        } else {
          this.pos[3] = Math.random() * 6.2;
          textRenderer.addDecalRaw(
            this.pos[0],
            this.pos[1],
            this.pos[2],
            0,
            0,
            ...textRenderer.decalUV.smiley,
            0.75,
            0,
            0,
            -2,
            -2,
            0,
          );
        }

        // NOTE: the raw gl.* draw call from the original Mechsquito.update
        // was intentionally dropped here — instance/mesh drawing belongs to
        // renderer.js in this codebase (see drawMobs), not entity update().

        this.pos[1] += 1;
        textRenderer.addCTX(
          MATH.doGrammar(this.mega) + " (Level " + this.level + ")",
          [this.pos[0], this.pos[1] + 0.4, this.pos[2]],
          gameState.COLORS?.whiteArr || [255, 255, 255],
          100,
        );

        textRenderer.addDecalRaw(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          0,
          0,
          ...textRenderer.decalUV["rect"],
          0.6,
          0,
          0,
          2.5,
          0.4,
          0,
        );
        textRenderer.addDecalRaw(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          (-0.5 + (this.health / this.maxHealth) * 0.5) /
            (this.health / this.maxHealth),
          0,
          ...textRenderer.decalUV["rect"],
          0.2,
          0.85,
          0.2,
          (this.health * 2.5) / this.maxHealth,
          0.4,
          0,
        );

        textRenderer.addSingle(
          "HP: " + MATH.addCommas((this.health | 0) + ""),
          this.pos,
          gameState.COLORS?.whiteArr || [255, 255, 255],
          -1,
          false,
          false,
        );

        this.pos[1] -= 1;

        break;
      }
    }

    return false;
  }

  /**
   * Overrides Mob.die. Mechsquito drops no loot in the original — this is
   * a no-op, consistent with the engine-owns-splicing contract used
   * elsewhere (see updateEngine.js): the engine splices this instance out
   * of gameState.objects.mobs after update() returns true.
   *
   * @param {number} index - Unused; kept for signature parity with Mob.die.
   * @param {Object} gameState - The live game state object.
   * @returns {void}
   */
  die(index, gameState) {
    // No loot table for Mechsquito in the original implementation.
  }
}
