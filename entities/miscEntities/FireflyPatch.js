// entities/fireflyPatch.js

import { MATH } from "../utils/math.js";
import { vec3 } from "gl-matrix";
import { Token } from "./tokens.js";
import { Explosion } from "./explosions.js"; // adjust path to wherever Explosion lives

// CHQ: Claude AI (Sonnet) ported this file to the gameState-passing pattern
//      used by Mob (entities/mobs.js), Bee (entities/bees.js), Balloon, and others

export class FireflyPatch {
  constructor(gameState) {
    window.setTimeout(
      () => {
        this.flyBack = true;
        window.setTimeout(() => (this.splice = true), 20 * 1000);
      },
      1.75 * 60 * 1000,
    );

    this.fireflies = [];
    this.cycle = 3;
    this.isDead = false;

    const fieldInfo = gameState.fieldInfo;

    this.field = [
      "SpiderField",
      "StrawberryField",
      "RoseField",
      "CactusField",
      "BambooField",
      "PineapplePatch",
    ][(Math.random() * 6) | 0];

    this.x = MATH.random(0.4, 0.6) * fieldInfo[this.field].width;
    this.z = MATH.random(0.4, 0.6) * fieldInfo[this.field].length;

    const x = fieldInfo[this.field].x + this.x;
    const z = fieldInfo[this.field].z + this.z;
    const r = MATH.random(3, 5);

    for (let i = 0; i < 8; i++) {
      const t = Math.random() * MATH.TWO_PI;

      this.fireflies.push({
        pos: [-60, 20, -30],
        toPos: [
          (Math.sin(t) * r + x) | 0,
          fieldInfo[this.field].y + 0.75,
          (Math.cos(t) * r + z) | 0,
        ],
        vel: [0, 0, 0],
        state: "moveToFlower",
      });
    }
  }

  /**
   * Cleanup on death. Loot is already dropped inside update(); updateEngine owns
   * the splice so nothing extra is needed here beyond flagging isDead.
   *
   * @param {number} index - Index of this patch in gameState.objects.mobs (unused — kept for interface parity).
   * @param {Object} gameState - The live game state object.
   */
  die(index, gameState) {
    this.isDead = true;
  }

  /**
   * Per-frame update. Advances every firefly through its state machine, queues
   * render data via gameState.objects.tempBees, and drops tokens/explosions when
   * all eight fireflies reach "waitAir" simultaneously.
   *
   * @param {number} dt - Delta time in seconds since the last frame.
   * @param {Object} gameState - The live game state object.
   * @returns {boolean} True when the patch should be removed from the mobs array.
   */
  update(dt, gameState) {
    if (this.isDead || this.splice) return true;

    const fieldInfo = gameState.fieldInfo;
    const player = gameState.player;

    // Counts down from fireflies.length; reaches 0 only when all are in "waitAir"
    let isAllWaitingAir = this.fireflies.length;

    for (let i = 0; i < this.fireflies.length; i++) {
      const f = this.fireflies[i];

      if (this.flyBack) {
        vec3.sub(f.vel, [-60, 20, -30], f.pos);
        vec3.normalize(f.vel, f.vel);
        vec3.scaleAndAdd(f.pos, f.pos, f.vel, dt * 4);
      } else {
        switch (f.state) {
          case "moveToFlower":
            vec3.sub(f.vel, f.toPos, f.pos);
            vec3.normalize(f.vel, f.vel);
            vec3.scaleAndAdd(f.pos, f.pos, f.vel, dt * 4);

            if (
              Math.abs(f.toPos[0] - f.pos[0]) +
                Math.abs(f.toPos[1] - f.pos[1]) +
                Math.abs(f.toPos[2] - f.pos[2]) <
              0.5
            ) {
              f.state = "waitSquish";
              f.pos = f.toPos.slice();
              vec3.sub(
                f.vel,
                [
                  fieldInfo[this.field].x + this.x,
                  fieldInfo[this.field].y + 0.75,
                  fieldInfo[this.field].z + this.z,
                ],
                f.pos,
              );
            }
            break;

          case "waitSquish":
            if (
              Math.abs(player.pos[0] - f.pos[0]) +
                Math.abs(player.pos[1] - f.pos[1]) +
                Math.abs(player.pos[2] - f.pos[2]) <
              4
            ) {
              f.state = "flyUp";
              f.toPos[1] += 5;

              let tt = "treat";

              if (Math.random() < 0.35)
                tt = Math.random() < 0.5 ? "pineapple" : "sunflowerSeed";

              if (
                fieldInfo[this.field].generalColorComp?.r > 0.5 &&
                Math.random() < 0.4
              )
                tt = "strawberry";

              if (
                fieldInfo[this.field].generalColorComp?.b > 0.5 &&
                Math.random() < 0.4
              )
                tt = "blueberry";

              if (Math.random() < 0.06)
                tt = Math.random() < 0.5 ? "gumdrops" : "royalJelly";

              // LootToken(30, pos, type, amount, isBoss, source) → Token(type, amount, pos, isBoss)
              gameState.objects.tokens.push(
                new Token(
                  tt,
                  1,
                  [f.pos[0], fieldInfo[this.field].y + 1, f.pos[2]],
                  false,
                ),
              );
            }
            break;

          case "flyUp":
            vec3.sub(f.vel, f.toPos, f.pos);
            vec3.normalize(f.vel, f.vel);
            vec3.scaleAndAdd(f.pos, f.pos, f.vel, dt * 4);

            if (
              Math.abs(f.toPos[0] - f.pos[0]) +
                Math.abs(f.toPos[1] - f.pos[1]) +
                Math.abs(f.toPos[2] - f.pos[2]) <
              0.5
            ) {
              f.state = "waitAir";
              f.pos = f.toPos.slice();
              vec3.sub(
                f.vel,
                [
                  fieldInfo[this.field].x + this.x,
                  fieldInfo[this.field].y + 0.75,
                  fieldInfo[this.field].z + this.z,
                ],
                f.pos,
              );
            }
            break;

          case "waitAir":
            isAllWaitingAir--;
            break;
        }
      }

      // --- Rendering ---

      // Queue this firefly for instanced bee rendering.
      // drawBees() in renderer.js iterates both objects.bees and objects.tempBees;
      // tempBees is cleared at the top of drawBees each frame.
      // _uvOverride bypasses the beeInfo UV lookup to use the firefly sprite row.
      gameState.objects.tempBees.push({
        pos: [...f.pos],
        meshScale: 1,
        moveDir: [...f.vel],
        type: "basic", // CHQ: Claude AI (Sonnet): drives beeInfo UV lookup in drawBees
        _uvOverride: [0.875, 0.625], // CHQ: Claude AI (Sonnet): firefly uses a non-standard UV
      });

      // Decals go directly through textRenderer — this path is already gameState-clean.
      if (gameState.textRenderer?.addDecalRaw) {
        gameState.textRenderer.addDecalRaw(
          ...f.pos,
          0,
          0,
          ...gameState.textRenderer.decalUV.glow,
          1,
          1,
          0.2,
          2.5,
          2.5,
          0,
        );
        gameState.textRenderer.addDecalRaw(
          ...f.pos,
          0,
          0,
          ...gameState.textRenderer.decalUV.lightrays,
          1,
          1,
          0.2,
          3,
          3,
          gameState.TIME + i * 0.5,
        );
      }

      gameState.objects.tempExplosions.push({
        pos: [...f.pos],
        col: [1, 1, 0.2], // warm yellow firefly glow — matches the 1, 1, 0.2 in the original
        size: 0.2, // small per-firefly point glow, not the 6-unit burst on completion
        alpha: 0.95,
        life: 1, // full lifespan; this is a per-frame push so it resets every tick
      });
    }

    // All eight fireflies are hovering in air — drop the big reward and reassign targets
    if (!isAllWaitingAir) {
      let tt = "starTreat";

      if (Math.random() < 0.07)
        tt = Math.random() < 0.1 ? "starJelly" : "glitter";

      gameState.objects.tokens.push(
        new Token(
          tt,
          1,
          [
            fieldInfo[this.field].x + this.x,
            fieldInfo[this.field].y + 1,
            fieldInfo[this.field].z + this.z,
          ],
          false,
        ),
      );

      gameState.objects.explosions.push(
        new Explosion({
          col: [0, 1, 1],
          pos: [
            fieldInfo[this.field].x + this.x,
            fieldInfo[this.field].y + 1,
            fieldInfo[this.field].z + this.z,
          ],
          life: 0.75,
          size: 6,
          speed: 0.2,
          aftershock: 0.05,
        }),
      );

      this.cycle--;

      if (this.cycle <= 0) {
        const _f = [
          "SpiderField",
          "StrawberryField",
          "RoseField",
          "CactusField",
          "BambooField",
          "PineapplePatch",
        ];

        _f.splice(_f.indexOf(this.field), 1);
        this.field = _f[(Math.random() * 5) | 0];
        this.cycle = 3;
      }

      this.x = MATH.random(0.4, 0.6) * fieldInfo[this.field].width;
      this.z = MATH.random(0.4, 0.6) * fieldInfo[this.field].length;

      const x = fieldInfo[this.field].x + this.x;
      const z = fieldInfo[this.field].z + this.z;
      const r = MATH.random(3, 5);

      for (let i = 0; i < this.fireflies.length; i++) {
        const f = this.fireflies[i];
        const t = Math.random() * MATH.TWO_PI;

        f.toPos = [
          (Math.sin(t) * r + x) | 0,
          fieldInfo[this.field].y + 0.75,
          (Math.cos(t) * r + z) | 0,
        ];
        f.state = "moveToFlower";
      }
    }

    return !!this.splice;
  }
}
