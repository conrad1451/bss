class WildWindyBee {
  constructor(field, pos) {
    this.field = field;
    this.starSawHitTimer = 0;
    this.level = 1;
    this.health = 250;
    this.maxHealth = this.health;
    this.pos = pos;
    this.pos[1] -= 2;
    this.flameTimer = 0;
    this.waitTimer = 0;
    this.target = [this.pos[0], this.pos[2]];
    this.bodySize = 1.5;
    this.timeLimit = 5 * 60;
    this.maxTimeLimit = this.timeLimit;
    this.state = "attack";

    this.mindHacked = 0;

    this.tornados = [];
    this.nextAttackTimer = 0;
    this.attackAlternate = 0;

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
    this.whipWarning = new TrailRenderer.ConstantTrail({
      length: 5,
      size: 0.05,
      color: [0.85, 0, 0, 1],
    });

    this.windWhipTrails = [
      {
        trail: new TrailRenderer.ConstantTrail({
          length: 10,
          triangle: true,
          size: 1.1,
          color: [0.5, 0.6, 0.6, 1],
        }),
      },
      {
        trail: new TrailRenderer.ConstantTrail({
          length: 10,
          triangle: true,
          size: 1.9,
          color: [0.8, 0.8, 0.8, 1],
        }),
      },
      {
        trail: new TrailRenderer.ConstantTrail({
          length: 10,
          triangle: true,
          size: 1.55,
          color: [0.4, 0.5, 0.7, 1],
        }),
      },
    ];
  }

  die(index) {
    this.trails[0].splice = true;
    this.trails[1].splice = true;
    this.whipWarning.splice = true;

    for (let i in this.windWhipTrails) {
      this.windWhipTrails[i].trail.splice = true;
    }

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
    if (!(frameCount % 6)) {
      this.trails[0].addPos(this.pos.slice());
      this.trails[1].addPos(this.pos.slice());
    }

    switch (this.state) {
      case "flee":
        this.mindHacked = 0;
        this.pos[0] += this.moveDir[0] * dt;
        this.pos[1] += this.moveDir[1] * dt;
        this.pos[2] += this.moveDir[2] * dt;

        meshes.bees.instanceData.push(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          1.5,
          this.moveDir[0],
          this.moveDir[1],
          this.moveDir[2],
          BEE_FLY,
          beeInfo.windy.u,
          beeInfo.windy.v,
          beeInfo.windy.meshPartId,
        );

        if (this.pos[1] > 55) {
          return true;
        }

        break;

      case "move":
        this.mindHacked = 0;
        this.pos[0] += this.moveDir[0] * dt;
        this.pos[1] += this.moveDir[1] * dt;
        this.pos[2] += this.moveDir[2] * dt;

        meshes.bees.instanceData.push(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          1.5,
          this.moveDir[0],
          this.moveDir[1],
          this.moveDir[2],
          BEE_FLY,
          beeInfo.windy.u,
          beeInfo.windy.v,
          beeInfo.windy.meshPartId,
        );

        if (TIME > this.timeAtArrival) {
          this.state = "attack";
          this.pos = this.moveTo;
          this.target = [
            fieldInfo[this.field].x +
              ((Math.random() * fieldInfo[this.field].width) | 0),
            fieldInfo[this.field].z +
              ((Math.random() * fieldInfo[this.field].length) | 0),
          ];
        }

        break;

      case "attack":
        if (this.health <= 0) {
          let f = [];

          for (let i in fieldInfo) {
            if (i !== "AntField" && i !== "StumpField" && i !== this.field)
              f.push(i);
          }

          f = f[(Math.random() * f.length) | 0];

          let center = [
              fieldInfo[this.field].x + fieldInfo[this.field].width * 0.5,
              this.pos[1] - 1.5,
              fieldInfo[this.field].z + fieldInfo[this.field].length * 0.5,
            ],
            _f = this.field;

          objects.mobs.push(
            new Cloud(
              this.field,
              (fieldInfo[this.field].width * 0.5) | 0,
              (fieldInfo[this.field].length * 0.5) | 0,
              3 * 60,
            ),
          );

          this.tornados = [];
          this.state = "move";
          this.field = f;
          this.moveTo = [
            fieldInfo[f].x + ((Math.random() * fieldInfo[f].width) | 0),
            fieldInfo[f].y + 0.55 + 2,
            fieldInfo[f].z + ((Math.random() * fieldInfo[f].length) | 0),
          ];
          this.moveDir = vec3.sub([], this.moveTo, this.pos);
          let dist = vec3.len(this.moveDir);
          this.timeAtArrival = TIME + dist / 7;
          vec3.scale(this.moveDir, this.moveDir, 7 / dist);
          this.level++;
          this.health = this.level * this.level * 250 + 250;
          this.maxHealth = this.health;

          let amountOfTokens = MATH.random(10, 14) | 0,
            dropTable = [
              "treat",
              "treat",
              "sunflowerSeed",
              "sunflowerSeed",
              "ticket",
              "royalJelly",
              "cloudVial",
              "fieldDice",
              "treat",
              "treat",
              "sunflowerSeed",
              "sunflowerSeed",
              "ticket",
              "royalJelly",
              "cloudVial",
              "fieldDice",
              "tropicalDrink",
              "oil",
              "glitter",
              "magicBean",
              "starJelly",
            ],
            radius = amountOfTokens * 0.2 + 1.5;

          if (_f === "CoconutField") dropTable.push("tropicalDrink");

          for (
            let i = 0, inc = MATH.TWO_PI / amountOfTokens;
            i < MATH.TWO_PI;
            i += inc
          ) {
            if (Math.random() < 0.5) {
              let ty = dropTable[(Math.random() * dropTable.length) | 0];

              objects.tokens.push(
                new LootToken(
                  45,
                  [
                    center[0] + Math.cos(i) * radius,
                    center[1],
                    center[2] + Math.sin(i) * radius,
                  ],
                  ty,
                  1,
                  true,
                  "Wild Windy Bee",
                  ["tokensFromWildWindyBee"],
                ),
              );
            } else {
              objects.tokens.push(
                new LootToken(
                  45,
                  [
                    center[0] + Math.cos(i) * radius,
                    center[1],
                    center[2] + Math.sin(i) * radius,
                  ],
                  "honey",
                  (this.level - 2) * 10000 + 1000,
                  true,
                  "Wild Windy Bee",
                  ["tokensFromWildWindyBee"],
                ),
              );
            }
          }

          this.whipWarning.addPos([]);
          this.whipWarning.addPos([]);
          this.whipWarning.addPos([]);
          this.whipWarning.addPos([]);
          this.whipWarning.addPos([]);

          for (let i in this.windWhipTrails) {
            let t = this.windWhipTrails[i];

            t.trail.addPos([]);
            t.trail.addPos([]);
            t.trail.addPos([]);
            t.trail.addPos([]);
            t.trail.addPos([]);
            t.trail.addPos([]);
            t.trail.addPos([]);
          }
        }

        if (this.timeLimit <= 0) {
          this.state = "flee";
          this.moveDir = [
            100 - this.pos[0],
            50 - this.pos[1],
            -30 - this.pos[2],
          ];
          vec3.normalize(this.moveDir, this.moveDir);
          vec3.scale(this.moveDir, this.moveDir, 7);

          player.addMessage(
            "☁️Wild Windy Bee is fleeing...☁️",
            [160, 160, 160],
          );

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
            let skip = Math.random() < 0.35;
            this.nextAttackTimer = skip ? 0 : 1.5;
            this.skipAttack = skip;

            if (!skip) {
              this.attackState =
                this.attackAlternate++ % 2 === 0 || this.tornados.length >= 3
                  ? 1
                  : 0;

              if (player.fieldIn === this.field && this.attackState) {
                this.windWhipTimer = 1;
                this.whipA = [this.pos[0], this.pos[1] - 1.9, this.pos[2]];
                this.whipB = [
                  player.body.position.x,
                  this.pos[1] - 1.9,
                  player.body.position.z,
                ];

                let dir = vec3.sub([], this.whipB, this.whipA);
                vec3.normalize(dir, dir);
                dir[0] *= 2;
                dir[2] *= 2;
                let c = [dir[2], dir[1], -dir[0]];

                this.whipWarning.addPos(vec3.add([], this.whipA, c));
                this.whipWarning.addPos(vec3.sub([], this.whipA, c));
                this.whipWarning.addPos(
                  vec3.add([], vec3.sub([], this.whipB, c), dir),
                );
                this.whipWarning.addPos(
                  vec3.add([], vec3.add([], this.whipB, c), dir),
                );
                this.whipWarning.addPos(vec3.add([], this.whipA, c));

                for (let i in this.windWhipTrails) {
                  let t = this.windWhipTrails[i];

                  let y = MATH.random(-0.01, 0.01) + 0.5,
                    s = MATH.random(-0.5, 0.5),
                    l = MATH.random(0.8, 1);

                  t.speed = MATH.random(10, 14);

                  t.pos = vec3.add([], this.whipA, [c[0] * s, y, c[2] * s]);
                  t.target = vec3.add(
                    [],
                    vec3.add([], this.whipB, [c[0] * s, y, c[2] * s]),
                    [dir[0] * l, 0, dir[2] * l],
                  );
                }
              }
            }
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
              beeInfo.windy.u,
              beeInfo.windy.v,
              beeInfo.windy.meshPartId,
            );
          }

          if (this.nextAttackTimer <= 0) {
            if (!this.skipAttack && !this.attackState)
              this.tornados.push({
                pos: [...this.pos, 0],
                timer: 0,
                timeAtArrival: -1,
              });

            this.skipAttack = false;

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

            meshes.bees.instanceData.push(
              this.pos[0],
              this.pos[1],
              this.pos[2],
              1.5,
              Math.sin(TIME * 8),
              0,
              Math.cos(TIME * 8),
              BEE_FLY,
              beeInfo.windy.u,
              beeInfo.windy.v,
              beeInfo.windy.meshPartId,
            );
          } else if (this.attackState === 1) {
            this.nextAttackTimer -= dt;

            meshes.bees.instanceData.push(
              this.pos[0],
              this.pos[1],
              this.pos[2],
              1.5,
              player.body.position.x - this.pos[0],
              player.body.position.y - this.pos[1],
              player.body.position.z - this.pos[2],
              BEE_FLY,
              beeInfo.windy.u,
              beeInfo.windy.v,
              beeInfo.windy.meshPartId,
            );
          }

          if (this.windWhipTimer > -0.25) {
            this.windWhipTimer -= dt;

            if (this.windWhipTimer <= 0.25) {
              for (let i in this.windWhipTrails) {
                let t = this.windWhipTrails[i];

                vec3.lerp(t.pos, t.pos, t.target, dt * t.speed);

                t.trail.addPos(t.pos.slice());
              }
            }

            if (this.windWhipTimer <= -0.25) {
              for (let i in this.windWhipTrails) {
                let t = this.windWhipTrails[i];

                t.trail.addPos([]);
                t.trail.addPos([]);
                t.trail.addPos([]);
                t.trail.addPos([]);
                t.trail.addPos([]);
                t.trail.addPos([]);
                t.trail.addPos([]);
              }

              let p = MATH.closestPointOnLine(this.whipA, this.whipB, [
                player.body.position.x,
                this.pos[1] - 1.9,
                player.body.position.z,
              ]);

              let d = vec3.sqrDist(p, [
                player.body.position.x,
                this.pos[1] - 1.9,
                player.body.position.z,
              ]);

              if (d < 4) {
                player.damage(15);
                let dir = vec3.sub([], this.whipB, this.whipA);
                vec3.normalize(dir, dir);
                player.body.position.y += 0.5;
                player.body.velocity.x = dir[0] * 50;
                player.body.velocity.y = (4 - d) * 5 + 5;
                player.body.velocity.z = dir[2] * 50;
                player.removeAirFrictionUntilGrounded = true;
                player.isGliding = false;
                player.grounded = false;
                player.updateGear();
              }

              this.whipWarning.addPos([]);
              this.whipWarning.addPos([]);
              this.whipWarning.addPos([]);
              this.whipWarning.addPos([]);
              this.whipWarning.addPos([]);
            }
          }

          let m = TIME * 2;
          m = m - (m | 0) < 0.5 ? "tornado_red" : "tornado";

          gl.bindBuffer(gl.ARRAY_BUFFER, meshes[m].vertBuffer);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes[m].indexBuffer);
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
          gl.uniform2f(glCache.mob_instanceInfo2, 0.6, 0.7);

          for (let i = this.tornados.length; i--; ) {
            let s = this.tornados[i];

            s.timer -= dt;
            s.pos[3] += dt * 15;

            if (!s.rised) {
              if (!s.init) {
                s.y = s.pos[1] - 1;
                s.pos[1] -= 15;
                s.init = true;
              }

              s.pos[1] += (s.y - s.pos[1]) * dt * 5;

              if (Math.abs(s.y - s.pos[1]) < 0.1) {
                s.rised = true;
                s.pos[1] = s.y;
              }
            }

            if (TIME > s.timeAtArrival) {
              s.target = [
                fieldInfo[this.field].x +
                  ((Math.random() * fieldInfo[this.field].width) | 0),
                fieldInfo[this.field].z +
                  ((Math.random() * fieldInfo[this.field].length) | 0),
              ];

              let d = [s.target[0] - s.pos[0], s.target[1] - s.pos[2]],
                m = vec2.len(d);
              d[0] *= 7 / m;
              d[1] *= 7 / m;
              s.moveDir = d;
              s.timeAtArrival = TIME + m / 7;
            }

            s.pos[0] += s.moveDir[0] * dt;
            s.pos[2] += s.moveDir[1] * dt;

            if (s.timer <= 0) {
              if (
                Math.abs(player.body.position.x - s.pos[0]) +
                  Math.abs(player.body.position.z - s.pos[2]) +
                  Math.abs(s.pos[1] - player.body.position.y - 1) <
                2.5
              ) {
                s.timer = 0.5;
                player.damage(this.level * 0.25 + 5);
              }

              collectPollen({
                x: Math.round(s.pos[0] - fieldInfo[this.field].x),
                z: Math.round(s.pos[2] - fieldInfo[this.field].z),
                field: this.field,
                pattern: [
                  [-4, 0],
                  [-3, -2],
                  [-3, -1],
                  [-3, 0],
                  [-3, 1],
                  [-3, 2],
                  [-2, -3],
                  [-2, -2],
                  [-2, -1],
                  [-2, 0],
                  [-2, 1],
                  [-2, 2],
                  [-2, 3],
                  [-1, -3],
                  [-1, -2],
                  [-1, -1],
                  [-1, 0],
                  [-1, 1],
                  [-1, 2],
                  [-1, 3],
                  [0, -4],
                  [0, -3],
                  [0, -2],
                  [0, -1],
                  [0, 0],
                  [0, 1],
                  [0, 2],
                  [0, 3],
                  [0, 4],
                  [1, -3],
                  [1, -2],
                  [1, -1],
                  [1, 0],
                  [1, 1],
                  [1, 2],
                  [1, 3],
                  [2, -3],
                  [2, -2],
                  [2, -1],
                  [2, 0],
                  [2, 1],
                  [2, 2],
                  [2, 3],
                  [3, -2],
                  [3, -1],
                  [3, 0],
                  [3, 1],
                  [3, 2],
                  [4, 0],
                ],
                amount: 0.35,
                multiplier: 0.00000000001,
              });
            }

            s.pos[1] -= 1;
            gl.uniform4fv(glCache.mob_instanceInfo1, s.pos);
            s.pos[1] += 1;
            gl.drawElements(
              gl.TRIANGLES,
              meshes[m].indexAmount,
              gl.UNSIGNED_SHORT,
              0,
            );
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
            beeInfo.windy.u,
            beeInfo.windy.v,
            beeInfo.windy.meshPartId,
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
          "Wild Windy Bee (Level " + this.level + ")",
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
