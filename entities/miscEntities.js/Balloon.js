// entities/balloons.js
import { vec3, vec2 } from "gl-matrix";

// CHQ: Claude AI (Sonnet) ported this file to the gameState-passing pattern
//      used by Mob (entities/mobs.js) and Bee (entities/bees.js).
import { COLORS } from "../../data/colors";

// let PLAYER_PHYSICS_GROUP=2,STATIC_PHYSICS_GROUP=4,DYNAMIC_PHYSICS_GROUP=8,BEE_COLLECT=0,BEE_FLY=0,then=0,dt,frameCount=0,TIME=0,player,NIGHT_DARKNESS=0.6,NPCs,STATS_TICK=false,leavesTimer=45,testRealm=DATA.name===window.atob('YnVveWFudCBiZWUgcmFjY29vbg==')

export class Balloon {
  /**
   * @param {string} field - Field id this balloon belongs to.
   * @param {number} x - Local field-space X coordinate.
   * @param {number} z - Local field-space Z coordinate.
   * @param {boolean} golden - Whether this is a golden (rare) balloon.
   * @param {number} [beeLevel=0] - Aggregate bee level bonus affecting capacity/life.
   * @param {Object} gameState - The live game state object produced by {@link createInitialState}.
   */
  constructor(field, x, z, golden, beeLevel = 0, gameState) {
    const { player, fieldInfo } = gameState;
    const TIME = gameState.TIME;

    // CHQ: Claude AI (Sonnet) — id now allocated from gameState.globalId
    //      (matches how spawnMobAtCamera does `gameState.globalId++`)
    //      instead of a module-level globalBalloonID counter.
    this.id = gameState.globalId++;

    this.golden = golden;
    this.col = this.golden
      ? [0.875 * 0.85, 0.7 * 0.85, 0.1 * 0.85, 0.8]
      : [0, 0, 0.6, 0.7];
    this.checkBubble = TIME;
    this.life = 20 + beeLevel;
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
    this.pos = [
      fieldInfo[this.field].x + this.x,
      fieldInfo[this.field].y + 0.55 + 4,
      fieldInfo[this.field].z + this.z,
    ];
    this.y = fieldInfo[this.field].y + 0.55 + 4;
    this.pollen = 0;
    this.cap = Math.round(
      player.capacity *
        0.35 *
        (this.golden ? 1.35 : 1) *
        (beeLevel * 0.0375 + 1),
    );
    this.invCap = 1 / this.cap;
    this.displaySize = 0;
    this.state = "float";
    this.inflateCounter =
      4 +
      ((beeLevel * (4 / 20)) | 0) +
      (fieldInfo[this.field].generalColorComp.b >= 0.5
        ? 4
        : fieldInfo[this.field].generalColorComp.w >= 0.5
          ? 2
          : 0);

    this.prevFlowers = [];
    this.flowers = [];

    let rad = 4,
      sqRad = 3.7 * 3.7;

    for (let x = -rad; x <= rad; x++) {
      for (let z = -rad; z <= rad; z++) {
        if (x * x + z * z <= sqRad) {
          this.flowers.push([x, z]);
        }
      }
    }
  }

  /**
   * Pops/retires the balloon: returns its carried pollen to the hive balloon
   * pool (unless it was popped/deflated) and removes it from the live array.
   *
   * @param {number} index - Index of this balloon inside gameState.objects.balloons.
   * @param {Object} gameState - The live game state object.
   * @param {boolean} [deflated=false] - True if the balloon was deflated/popped
   *   rather than reaching the hive normally (skips the pollen payout).
   * @returns {void}
   */
  die(index, gameState, deflated = false) {
    const { player, objects } = gameState;

    if (deflated === false) {
      player.hiveBalloon.pollen += this.pollen;
      player.hiveBalloon.maxPollen += this.pollen;
    }

    objects.balloons.splice(index, 1);
  }

  /**
   * Per-frame balloon update. Handles both the "float" state (drifting over
   * the field, claiming nearby flowers, accumulating pollen) and the
   * "moveToHive" state (flying straight to the player's hive once full or
   * out of life). Pushes render instance data for the balloon body, glow,
   * and floating label text every frame it's alive.
   *
   * @param {number} dt - Delta time in seconds since the last frame.
   * @param {Object} gameState - The live game state object.
   * @returns {boolean|undefined} `true` once the balloon has arrived at the
   *   hive while in "moveToHive" state (signals the caller to collect it via
   *   {@link die}); otherwise `undefined`.
   */
  update(dt, gameState) {
    const { player, objects, meshes, textRenderer, fieldInfo, flowers } =
      gameState;
    const TIME = gameState.TIME;

    if (this.state === "float") {
      this.life -= dt;

      this.pos[0] += this.moveDir[0] * dt;
      this.pos[2] += this.moveDir[1] * dt;

      this.x = Math.round(this.pos[0] - fieldInfo[this.field].x);
      this.z = Math.round(this.pos[2] - fieldInfo[this.field].z);
      if (this.x !== this._x || this.z !== this._z) {
        for (let j in this.prevFlowers) {
          if (
            flowers[this.field][this.prevFlowers[j][1]][this.prevFlowers[j][0]]
              .balloon === this
          ) {
            flowers[this.field][this.prevFlowers[j][1]][
              this.prevFlowers[j][0]
            ].balloon = false;
          }
        }

        this.prevFlowers = [];

        for (let j in this.flowers) {
          let f = this.flowers[j];

          let nx = f[0] + this.x,
            nz = f[1] + this.z;

          if (
            nx >= 0 &&
            nx < fieldInfo[this.field].width &&
            nz >= 0 &&
            nz < fieldInfo[this.field].length
          ) {
            if (
              !flowers[this.field][nz][nx].balloon ||
              flowers[this.field][nz][nx].balloon.pollen > this.pollen
            ) {
              flowers[this.field][nz][nx].balloon = this;
            }

            this.prevFlowers.push([nx, nz]);
          }
        }
      }

      this._x = this.x;
      this._z = this.z;

      this.pollen = Math.min(Math.round(this.pollen), this.cap);

      let t = this.pollen * this.invCap - 1;

      t *= t;
      t *= t;

      this.size = (1 - t) * (1.4 + this.pollen.toString().length * 0.075) + 0.8;

      this.displaySize += (this.size - this.displaySize) * 0.025;
      this.pos[1] = this.y + this.displaySize * 0.5 - 1;

      meshes.cylinder_explosions.instanceData.push(
        this.pos[0],
        this.pos[1] - this.displaySize * 0.5 - 1,
        this.pos[2],
        player.isNight,
        player.isNight,
        player.isNight,
        0.5,
        0.03,
        67,
      );
      meshes.explosions.instanceData.push(
        this.pos[0],
        this.pos[1],
        this.pos[2],
        this.col[0] * player.isNight,
        this.col[1] * player.isNight,
        this.col[2] * player.isNight,
        this.col[3],
        this.displaySize,
        1.03,
      );

      meshes.explosions.instanceData.push(
        this.pos[0],
        this.y - 4,
        this.pos[2],
        0,
        0,
        0,
        0.35,
        7,
        0.01,
      );

      if (this.golden) {
        textRenderer.addDecalRaw(
          ...this.pos,
          0,
          0,
          ...textRenderer.decalUV["lightrays"],
          1,
          1,
          0.85,
          2,
          2,
          TIME,
        );
      }

      textRenderer.addSingle(
        this.pollen + "/" + this.cap,
        this.pos,
        COLORS.whiteArr,
        -0.465,
        true,
        true,
        0.175,
      );

      textRenderer.addDecalRaw(
        ...this.pos,
        0,
        0.4,
        ...textRenderer.decalUV["rect"],
        0,
        0.4,
        0,
        1,
        0.25,
        0,
      );

      textRenderer.addDecalRaw(
        ...this.pos,
        (-0.5 + this.pollen * this.invCap * 0.5) / (this.pollen * this.invCap),
        0,
        ...textRenderer.decalUV["rect"],
        0.1,
        0.85,
        0.1,
        this.pollen * this.invCap,
        0.25,
        0,
      );
      textRenderer.addDecalRaw(
        ...this.pos,
        0.6,
        -0.1,
        ...textRenderer.decalUV["flower"],
        1,
        1,
        1,
        -0.44,
        -0.44,
        0,
      );

      if (
        gameState.statsTick &&
        vec3.sqrDist(this.pos, [
          player.body.position.x,
          player.body.position.y + 4,
          player.body.position.z,
        ]) <= 6.25
      )
        player.addEffect("balloonAura");

      if (
        Math.abs(this.pos[0] - this.moveTo[0]) +
          Math.abs(this.pos[2] - this.moveTo[1]) <
        1
      ) {
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
        vec2.scale(this.moveDir, this.moveDir, 0.35);
      }

      if (this.golden && TIME - this.checkBubble > 0.5) {
        this.checkBubble = TIME;

        for (let j in objects.bubbles) {
          let b = objects.bubbles[j];

          if (
            Math.abs(this.pos[0] - b.pos[0]) +
              Math.abs(this.pos[2] - b.pos[2]) <
            3.5
          ) {
            b.turnGolden();
          }
        }
      }

      if (this.life <= 0 || this.pollen >= this.cap) {
        this.state = "moveToHive";

        this.moveDir = vec3.sub(
          [],
          [player.hivePos[0] + 1.5, player.hivePos[1], player.hivePos[2]],
          this.pos,
        );
        vec3.normalize(this.moveDir, this.moveDir);

        for (let i in this.flowers) {
          let x = this.flowers[i][0] + this.x,
            z = this.flowers[i][1] + this.z;

          if (
            x >= 0 &&
            x < fieldInfo[this.field].width &&
            z >= 0 &&
            z < fieldInfo[this.field].length
          ) {
            flowers[this.field][z][x].balloon = false;
          }
        }
      }
    } else {
      this.pollen = Math.min(Math.round(this.pollen), this.cap);

      let t = this.pollen * this.invCap - 1;

      t *= t;
      t *= t;

      this.size = (1 - t) * (1.4 + this.pollen.toString().length * 0.075) + 0.8;

      this.displaySize += (this.size - this.displaySize) * 0.025;

      vec3.scaleAndAdd(this.pos, this.pos, this.moveDir, dt);

      meshes.cylinder_explosions.instanceData.push(
        this.pos[0],
        this.pos[1] - this.displaySize * 0.5 - 1,
        this.pos[2],
        player.isNight,
        player.isNight,
        player.isNight,
        0.5,
        0.03,
        67,
      );

      meshes.explosions.instanceData.push(
        this.pos[0],
        this.pos[1],
        this.pos[2],
        this.col[0] * player.isNight,
        this.col[1] * player.isNight,
        this.col[2] * player.isNight,
        this.col[3],
        this.displaySize,
        1.05,
      );

      if (this.golden) {
        textRenderer.addDecalRaw(
          ...this.pos,
          0,
          0,
          ...textRenderer.decalUV["lightrays"],
          1,
          1,
          0.85,
          2,
          2,
          TIME,
        );
      }

      textRenderer.addSingle(
        this.pollen + "/" + this.cap,
        this.pos,
        COLORS.whiteArr,
        -0.465,
        true,
        true,
        0.175,
      );

      textRenderer.addDecalRaw(
        ...this.pos,
        1.1,
        -0.1,
        ...textRenderer.decalUV["flower"],
        1,
        1,
        1,
        -0.44,
        -0.44,
        0,
      );

      if (vec3.sqrDist(this.pos, player.hivePos) < 9) {
        return true;
      }
    }
  }
}
