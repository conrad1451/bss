// entities/RogueViciousBee.js
import { BossMob, handleMobDeath } from "./MobTemplate.js";
import { MATH } from "../utils/math.js";

export class RogueViciousBee extends BossMob {
  constructor(field, level, gameState) {
    const pos = [
      fieldInfo[field].x +
        ((MATH.random(0.2, 0.8) * fieldInfo[field].width) | 0),
      fieldInfo[field].y + 3,
      fieldInfo[field].z +
        ((MATH.random(0.2, 0.8) * fieldInfo[field].length) | 0),
    ];

    const hp = 1000 + (level - 1) * 2000;
    super(gameState.globalId++, "rogueViciousBee", pos, hp, level, gameState);

    this.speed = 6;
    this.bodySize = 1.5;
    this.field = field;
    this.spikes = [];
    this.timeLimit = 5 * 60;
    this.maxTimeLimit = this.timeLimit;
    this.flameTimer = 0;
    this.mindHacked = 0;
    this.starSawHitTimer = 0;
    this.addSpikeAttackTimer = 0;
    this.nextAttackTimer = 0;
    this.attackAlternate = 0;
    this.target = [pos[0], pos[2]];
    this.state = "hiding";
  }

  takeDamage(amount, gameState) {
    // BossMob.takeDamage handles mindHacked multiplier — we add crit on top
    const player = gameState.player;
    const crit = Math.random() < player.criticalChance;
    const superCrit = Math.random() < player.superCritChance;
    const critMult = crit
      ? superCrit
        ? player.superCritPower * player.criticalPower
        : player.criticalPower
      : 1;

    super.takeDamage(amount * critMult, gameState);

    textRenderer.add(
      ((amount * critMult) | 0) + "",
      [this.pos[0], this.pos[1] + Math.random() * 2.75 + 1.5, this.pos[2]],
      [255, 0, 0],
      crit ? (superCrit ? 2 : 1) : 0,
      "",
      [0, 1.25, 1.275, 1.3, 1.65, 1.75][
        Math.min((amount * critMult).toString().length, 5)
      ],
    );
  }

  onBossDeath(gameState) {
    const player = gameState.player;

    const am = Math.floor(this.lvl * this.lvl * this.lvl * 1000 + 2500);
    const sm = ((this.lvl * 0.5) | 0) + 3;

    player.honey += am;
    items.stinger.amount += sm;

    textRenderer.add(
      am + "",
      [
        player.body.position.x,
        player.body.position.y + 2,
        player.body.position.z,
      ],
      COLORS.honey,
      0,
      "+",
    );
    player.addMessage(
      "+" + MATH.addCommas(am + "") + " Honey (from Rogue Vicious Bee)",
    );
    player.addMessage(
      "+" + MATH.addCommas(sm + "") + " Stingers (from Rogue Vicious Bee)",
    );
    player.updateInventory();

    handleMobDeath(this, gameState);
  }

  update(dt, gameState) {
    const player = gameState.player;

    switch (this.state) {
      case "dead":
        return true;

      case "hiding": {
        const dx = Math.abs(player.body.position.x - this.pos[0]);
        const dz = Math.abs(player.body.position.z - this.pos[2]);
        const dy = Math.abs(this.pos[1] - 2.5 - player.body.position.y);

        if (dx + dz + dy < 2) {
          objects.explosions.push(
            new Explosion({
              col: [1, 0, 0],
              pos: [this.pos[0], this.pos[1] + 0.5, this.pos[2]],
              life: 1,
              size: 5,
              speed: 0.25,
              aftershock: 0.005,
            }),
          );
          player.addMessage("⚠️You've found a Rogue Vicious Bee!⚠️", [0, 0, 0]);
          this.state = "attack";
          player.damage(20);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, meshes.spike.vertBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes.spike.indexBuffer);
        gl.vertexAttribPointer(
          glCache.mob_vertPos,
          3,
          gl.FLOAT,
          gl.FLASE,
          24,
          0,
        );
        gl.vertexAttribPointer(
          glCache.mob_vertColor,
          3,
          gl.FLOAT,
          gl.FLASE,
          24,
          12,
        );
        gl.uniform2f(glCache.mob_instanceInfo2, 0.55, 1);
        gl.uniform4fv(glCache.mob_instanceInfo1, [
          this.pos[0],
          this.pos[1] - 4,
          this.pos[2],
          0,
        ]);
        gl.drawElements(
          gl.TRIANGLES,
          meshes.spike.indexAmount,
          gl.UNSIGNED_SHORT,
          0,
        );
        break;
      }

      case "attack": {
        if (this.hp <= 0 || this.timeLimit <= 0) {
          if (this.timeLimit <= 0) return true;
          this.state = "dead";
          this.die(null, gameState);
          return;
        }

        this.mindHacked -= dt;
        this.timeLimit -= dt;
        this.starSawHitTimer -= dt;
        this.flameTimer -= dt;

        if (this.flameTimer <= 0) {
          this.flameTimer = 1;
          for (let f in objects.flames) {
            if (
              Math.abs(this.pos[0] - objects.flames[f].pos[0]) +
                Math.abs(this.pos[2] - objects.flames[f].pos[2]) <
              this.bodySize
            ) {
              this.takeDamage(objects.flames[f].dark ? 25 : 15, gameState);
            }
          }
        }

        if (player.fieldIn === this.field) player.attacked.push(this);

        if (this.mindHacked <= 0) {
          const d = [
            this.target[0] - this.pos[0],
            this.target[1] - this.pos[2],
          ];

          if (
            Math.abs(d[0]) + Math.abs(d[1]) < 0.75 &&
            this.attackState === undefined
          ) {
            this.attackState = this.attackAlternate++ % 2;
            this.nextAttackTimer = 7.5;
          } else if (this.attackState === undefined) {
            vec2.normalize(d, d);
            this.pos[0] += d[0] * dt * 6;
            this.pos[2] += d[1] * dt * 6;
            meshes.bees.instanceData.push(
              this.pos[0],
              this.pos[1],
              this.pos[2],
              1.5,
              d[0],
              0,
              d[1],
              BEE_FLY,
              beeInfo.vicious.u,
              beeInfo.vicious.v,
              beeInfo.vicious.meshPartId,
            );
          }

          if (this.nextAttackTimer <= 0) {
            this.target = [
              fieldInfo[this.field].x +
                ((Math.random() * fieldInfo[this.field].width) | 0),
              fieldInfo[this.field].z +
                ((Math.random() * fieldInfo[this.field].length) | 0),
            ];
            this.attackState = undefined;
            this.nextAttackTimer = Infinity;
          }

          if (this.attackState === 0) {
            this.nextAttackTimer -= dt;
            this.addSpikeAttackTimer -= dt;
            meshes.bees.instanceData.push(
              this.pos[0],
              this.pos[1],
              this.pos[2],
              1.5,
              Math.sin(TIME * 8),
              0,
              Math.cos(TIME * 8),
              BEE_FLY,
              beeInfo.vicious.u,
              beeInfo.vicious.v,
              beeInfo.vicious.meshPartId,
            );
            if (this.addSpikeAttackTimer <= 0) {
              this.spikes.push({
                pos: [
                  fieldInfo[this.field].x +
                    ((Math.random() * fieldInfo[this.field].width) | 0),
                  fieldInfo[this.field].y + 0.51 - 10,
                  fieldInfo[this.field].z +
                    ((Math.random() * fieldInfo[this.field].length) | 0),
                  0,
                ],
                life: 2.5,
                glow: 0,
                y: fieldInfo[this.field].y + 0.51,
              });
              this.addSpikeAttackTimer = 0.15;
            }
          } else if (this.attackState === 1) {
            this.nextAttackTimer -= dt;
            this.addSpikeAttackTimer -= dt;
            meshes.bees.instanceData.push(
              this.pos[0],
              this.pos[1],
              this.pos[2],
              1.5,
              player.body.position.x - this.pos[0],
              player.body.position.y - this.pos[1],
              player.body.position.z - this.pos[2],
              BEE_FLY,
              beeInfo.vicious.u,
              beeInfo.vicious.v,
              beeInfo.vicious.meshPartId,
            );
            if (this.addSpikeAttackTimer <= 0) {
              this.spikes.push({
                pos: [
                  fieldInfo[this.field].x + player.flowerIn.x,
                  fieldInfo[this.field].y + 0.51 - 10,
                  fieldInfo[this.field].z + player.flowerIn.z,
                  0,
                ],
                life: 2.5,
                glow: 0,
                y: fieldInfo[this.field].y + 0.51,
              });
              this.addSpikeAttackTimer = 0.5;
            }
          }

          // Spike rendering + player damage
          gl.bindBuffer(gl.ARRAY_BUFFER, meshes.spike.vertBuffer);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes.spike.indexBuffer);
          gl.vertexAttribPointer(
            glCache.mob_vertPos,
            3,
            gl.FLOAT,
            gl.FLASE,
            24,
            0,
          );
          gl.vertexAttribPointer(
            glCache.mob_vertColor,
            3,
            gl.FLOAT,
            gl.FLASE,
            24,
            12,
          );
          gl.uniform2f(glCache.mob_instanceInfo2, 0.5, 1);

          for (let i = this.spikes.length - 1; i >= 0; i--) {
            const s = this.spikes[i];
            s.life -= dt;
            s.glow += dt;

            if (s.life < 1 && s.life > 0.5) {
              s.pos[1] += (s.y + 2 - s.pos[1]) * dt * 22;
              meshes.cylinder_explosions.instanceData.push(
                s.pos[0],
                s.y,
                s.pos[2],
                1,
                0,
                0,
                s.glow,
                1.5,
                0.001,
              );
            } else if (s.life < 0.5) {
              s.pos[1] += (s.y - 10 - s.pos[1]) * dt * 10;
            } else {
              meshes.cylinder_explosions.instanceData.push(
                s.pos[0],
                s.y,
                s.pos[2],
                1,
                0,
                0,
                s.glow,
                1.5,
                0.001,
              );
            }

            if (
              Math.abs(player.body.position.x - s.pos[0]) +
                Math.abs(player.body.position.z - s.pos[2]) +
                Math.abs(s.pos[1] - player.body.position.y) <
                1.5 &&
              !s.damaged
            ) {
              s.damaged = true;
              player.damage(40); // hurts the player, not the boss
            }

            gl.uniform4fv(glCache.mob_instanceInfo1, s.pos);
            gl.drawElements(
              gl.TRIANGLES,
              meshes.spike.indexAmount,
              gl.UNSIGNED_SHORT,
              0,
            );

            if (s.life <= 0) this.spikes.splice(i, 1);
          }
        } else {
          // Mind-hacked
          meshes.bees.instanceData.push(
            this.pos[0],
            this.pos[1],
            this.pos[2],
            1.5,
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5,
            BEE_FLY,
            beeInfo.vicious.u,
            beeInfo.vicious.v,
            beeInfo.vicious.meshPartId,
          );
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

        // HUD
        this.pos[1] += 1.25;
        textRenderer.addCTX(
          "Rogue Vicious Bee (Level " + this.lvl + ")",
          [this.pos[0], this.pos[1] + 0.9, this.pos[2]],
          COLORS.whiteArr,
          100,
        );
        textRenderer.addDecalRaw(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          0,
          1.5,
          ...textRenderer.decalUV.rect,
          0.61 * 0.5,
          0.42 * 0.5,
          0.27 * 0.5,
          2.5,
          0.4,
          0,
        );
        textRenderer.addDecalRaw(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          (-0.5 + (this.timeLimit / this.maxTimeLimit) * 0.5) /
            (this.timeLimit / this.maxTimeLimit),
          1.5,
          ...textRenderer.decalUV.rect,
          0.61,
          0.42,
          0.27,
          (this.timeLimit * 2.5) / this.maxTimeLimit,
          0.4,
          0,
        );
        textRenderer.addDecalRaw(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          0,
          0,
          ...textRenderer.decalUV.rect,
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
          (-0.5 + (this.hp / this.maxHp) * 0.5) / (this.hp / this.maxHp),
          0,
          ...textRenderer.decalUV.rect,
          0.2,
          0.85,
          0.2,
          (this.hp * 2.5) / this.maxHp,
          0.4,
          0,
        );
        textRenderer.addSingle(
          "HP: " + MATH.addCommas((this.hp | 0) + ""),
          this.pos,
          COLORS.whiteArr,
          -1,
          false,
          false,
        );
        textRenderer.addSingle(
          "Time: " + MATH.doTime((this.timeLimit | 0) + ""),
          this.pos,
          COLORS.whiteArr,
          -1,
          false,
          false,
          0,
          0.6,
        );
        this.pos[1] -= 1.25;
        break;
      }
    }
  }

  getLootTable() {
    const am = Math.floor(this.lvl * this.lvl * this.lvl * 1000 + 2500);
    const sm = ((this.lvl * 0.5) | 0) + 3;
    return [
      { type: "honey", amount: am },
      { type: "stinger", amount: sm },
    ];
  }
}
