// CHQ: need to wait until 8pm - or maybe not

class RogueViciousBee {
  constructor(field, level) {
    this.spikes = [];

    this.field = field;
    this.state = "hiding";
    this.starSawHitTimer = 0;
    this.level = level;
    this.health = 1000 + (level - 1) * 2000;
    this.maxHealth = this.health;
    this.pos = [
      fieldInfo[this.field].x +
        ((MATH.random(0.2, 0.8) * fieldInfo[this.field].width) | 0),
      fieldInfo[this.field].y + 3,
      fieldInfo[this.field].z +
        ((MATH.random(0.2, 0.8) * fieldInfo[this.field].length) | 0),
    ];
    this.flameTimer = 0;
    this.waitTimer = 0;
    this.target = [this.pos[0], this.pos[2]];
    this.bodySize = 1.5;
    this.timeLimit = 5 * 60;
    this.maxTimeLimit = this.timeLimit;

    this.addSpikeAttackTimer = 0;
    this.nextAttackTimer = 0;
    this.attackAlternate = 0;

    this.mindHacked = 0;
  }

  die(index) {
    objects.mobs.splice(index, 1);
  }

  damage(am) {
    let crit = Math.random() < player.criticalChance,
      superCrit = Math.random() < player.superCritChance,
      d =
        am *
        (crit
          ? superCrit
            ? player.superCritPower * player.criticalPower
            : player.criticalPower
          : 1);

    if (this.mindHacked > 0) d *= 1.25;

    this.health -= d | 0;
    textRenderer.add(
      (d | 0) + "",
      [this.pos[0], this.pos[1] + Math.random() * 2.75 + 1.5, this.pos[2]],
      [255, 0, 0],
      crit ? (superCrit ? 2 : 1) : 0,
      "",
      [0, 1.25, 1.275, 1.3, 1.65, 1.75][(Math.min(d.toString().length), 5)],
    );
  }

  update() {
    switch (this.state) {
      case "dead":
        return true;

        break;

      case "hiding":
        if (
          Math.abs(player.body.position.x - this.pos[0]) +
            Math.abs(player.body.position.z - this.pos[2]) +
            Math.abs(this.pos[1] - 2.5 - player.body.position.y) <
          2
        ) {
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

      case "attack":
        if (this.health <= 0 || this.timeLimit <= 0) {
          if (this.timeLimit <= 0) return true;

          player.stats.rogueViciousBee++;
          this.state = "dead";

          let am = Math.floor(
              this.level * this.level * this.level * 1000 + 2500,
            ),
            sm = ((this.level * 0.5) | 0) + 3;

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
            "+" +
              MATH.addCommas(sm + "") +
              " Stingers (from Rogue Vicious Bee)",
          );

          player.updateInventory();

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
              this.damage(objects.flames[f].dark ? 25 : 15);
            }
          }
        }

        if (player.fieldIn === this.field) {
          player.attacked.push(this);
        }

        if (this.mindHacked <= 0) {
          let d = [this.target[0] - this.pos[0], this.target[1] - this.pos[2]];

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

          for (let i = this.spikes.length; i--; ) {
            let s = this.spikes[i];

            this.spikes[i].life -= dt;
            this.spikes[i].glow += dt;

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
              player.damage(40);
            }

            gl.uniform4fv(glCache.mob_instanceInfo1, s.pos);
            gl.drawElements(
              gl.TRIANGLES,
              meshes.spike.indexAmount,
              gl.UNSIGNED_SHORT,
              0,
            );

            if (s.life <= 0) {
              this.spikes.splice(i, 1);
            }
          }
        } else {
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

        this.pos[1] += 1.25;
        textRenderer.addCTX(
          "Rogue Vicious Bee (Level " + this.level + ")",
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
          ...textRenderer.decalUV["rect"],
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
          ...textRenderer.decalUV["rect"],
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
