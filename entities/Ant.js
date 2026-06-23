class Ant {
  constructor(round, x, z, type) {
    this.type = type;
    this.displayName = MATH.doGrammar(type);
    this.mesh = type;
    this.meshScale = 0.75;
    this.level = ((round * MATH.random(0.4, 0.6) * 0.5) | 0) + 1;
    this.health =
      ((this.level * this.level * this.level * 0.4 * MATH.random(2, 6)) | 0) +
      5;
    this.movespeed = 2;
    this.attack = 10;
    this.bodySize = 0.75;

    switch (type) {
      case "ant":
        break;
      case "fireAnt":
        break;
      case "armyAnt":
        this.health = (this.health * 1.5) | 0;
        this.attack *= 2;
        break;
      case "flyingAnt":
        this.health = (this.health * 0.65) | 0;
        this.movespeed *= 1.5;
        this.attack *= 1.25;
        break;
      case "giantAnt":
        this.health = (this.health * 2) | 0;
        this.movespeed *= 0.75;
        this.attack *= 2;
        this.meshScale = 1.5;
        this.mesh = "ant";
        this.bodySize = 1;
        break;
    }

    this.state = "spawning";
    this.field = "AntField";
    this.starSawHitTimer = 0;
    this.maxHealth = this.health;
    this.spawnPos = [-21, 7, -61];
    this.pos = [
      fieldInfo[this.field].x + ((x * fieldInfo[this.field].width) | 0),
      fieldInfo[this.field].y + this.meshScale,
      fieldInfo[this.field].z + ((z * fieldInfo[this.field].length) | 0),
    ];
    this.flameTimer = 0;
    this.waitTimer = 0;
    this.damageTimer = 0;

    this.mindHacked = 0;

    this.dir = [x - 0.5, z - 0.5];

    this.dir[1] =
      this.dir[1] === 0 && this.dir[0] === 0
        ? Math.random() < 0.5
          ? -1
          : 1
        : this.dir[1];

    vec2.normalize(this.dir, this.dir);

    this.bounds = {
      minX: fieldInfo[this.field].x + 1,
      maxX: fieldInfo[this.field].x + fieldInfo[this.field].width - 1,
      minZ: fieldInfo[this.field].z + 1,
      maxZ: fieldInfo[this.field].z + fieldInfo[this.field].length - 1,
    };

    this.fireTrailTimer = 0;
  }

  die(index) {
    if (player.antChallenge) player.antChallenge.score++;

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
      case "spawning":
        this.spawnPos[0] += (this.pos[0] - this.spawnPos[0]) * dt * 5;
        this.spawnPos[1] += (this.pos[1] - this.spawnPos[1]) * dt * 5;
        this.spawnPos[2] += (this.pos[2] - this.spawnPos[2]) * dt * 5;

        if (Math.abs(this.pos[1] - this.spawnPos[1]) < 0.1) {
          this.state = "attack";
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, meshes[this.mesh].vertBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes[this.mesh].indexBuffer);
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
        gl.uniform2f(glCache.mob_instanceInfo2, this.meshScale, 1);
        gl.uniform4fv(glCache.mob_instanceInfo1, [
          this.spawnPos[0],
          this.spawnPos[1],
          this.spawnPos[2],
          0,
        ]);
        gl.drawElements(
          gl.TRIANGLES,
          meshes[this.mesh].indexAmount,
          gl.UNSIGNED_SHORT,
          0,
        );

        break;

      case "attack":
        if (this.health <= 0) {
          player.stats.ant++;

          if (this.type !== "ant") player.stats[this.type]++;

          return true;
        }

        this.mindHacked -= dt;
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

        player.attacked.push(this);

        if (this.mindHacked <= 0) {
          if (this.type === "fireAnt") {
            this.fireTrailTimer -= dt;

            if (this.fireTrailTimer <= 0) {
              objects.mobs.push(new FireTrail(this.pos.slice()));
              this.fireTrailTimer = 0.75;
            }
          }

          if (
            this.type === "armyAnt" ||
            this.type === "flyingAnt" ||
            this.type === "giantAnt"
          ) {
            this.dir = [
              player.body.position.x - this.pos[0],
              player.body.position.z - this.pos[2],
            ];

            vec2.normalize(this.dir, this.dir);
          }

          this.pos[0] += this.dir[0] * dt * this.movespeed;
          this.pos[2] += this.dir[1] * dt * this.movespeed;

          this.pos[3] = Math.atan2(this.dir[1], this.dir[0]) + MATH.HALF_PI;

          if (this.pos[0] <= this.bounds.minX) {
            this.pos[0] = this.bounds.minX;
            this.dir[0] = -this.dir[0];
          }

          if (this.pos[0] >= this.bounds.maxX) {
            this.pos[0] = this.bounds.maxX;
            this.dir[0] = -this.dir[0];
          }

          if (this.pos[2] <= this.bounds.minZ) {
            this.pos[2] = this.bounds.minZ;
            this.dir[1] = -this.dir[1];
          }

          if (this.pos[2] >= this.bounds.maxZ) {
            this.pos[2] = this.bounds.maxZ;
            this.dir[1] = -this.dir[1];
          }

          this.damageTimer -= dt;

          if (
            Math.abs(player.body.position.x - this.pos[0]) +
              Math.abs(player.body.position.y - this.pos[1]) +
              Math.abs(player.body.position.z - this.pos[2]) <
              this.bodySize * 1.5 &&
            this.damageTimer <= 0
          ) {
            player.damage(this.attack);
            this.damageTimer = 0.75;
          }
        } else {
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
          this.displayName + " (Level " + this.level + ")",
          [this.pos[0], this.pos[1] + 0.5, this.pos[2]],
          COLORS.whiteArr,
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
          COLORS.whiteArr,
          -1,
          false,
          false,
        );

        this.pos[1] -= 1.25;

        gl.bindBuffer(gl.ARRAY_BUFFER, meshes[this.mesh].vertBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes[this.mesh].indexBuffer);
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
        gl.uniform4fv(glCache.mob_instanceInfo1, this.pos);
        gl.uniform2f(glCache.mob_instanceInfo2, this.meshScale, 1);
        gl.drawElements(
          gl.TRIANGLES,
          meshes[this.mesh].indexAmount,
          gl.UNSIGNED_SHORT,
          0,
        );

        break;
    }

    return !player.antChallenge;
  }
}
