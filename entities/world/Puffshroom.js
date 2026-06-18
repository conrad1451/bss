class Puffshroom {
  constructor(field, x, z, life, level, type, prevFields) {
    this.prevFields = prevFields || [];
    this.prevFields.push(field);

    this.type = type;
    this.life = life;
    this.field = field;
    this.x = x;
    this.z = z;
    this.pos = [
      fieldInfo[this.field].x + this.x,
      fieldInfo[this.field].y,
      fieldInfo[this.field].z + this.z,
      Math.random() * MATH.TWO_PI,
    ];
    this.level = level;
    this.pollen = 0;
    this.cap =
      ((55 * (this.level * this.level * this.level * this.level - 1) + 1000) *
        ([
          "puffshroom",
          "rarePuffshroom",
          "epicPuffshroom",
          "legendaryPuffshroom",
          0,
          "mythicPuffshroom",
        ].indexOf(type) *
          0.25 +
          1)) |
      0;

    this.invCap = 1 / this.cap;
    this.displayScale = (this.level - 1) * 0.125 + 1;

    this.flowers = [
      [-4, -1],
      [-4, 0],
      [-4, 1],
      [-3, -3],
      [-3, -2],
      [-3, -1],
      [-3, 0],
      [-3, 1],
      [-3, 2],
      [-3, 3],
      [-2, -3],
      [-2, -2],
      [-2, -1],
      [-2, 0],
      [-2, 1],
      [-2, 2],
      [-2, 3],
      [-1, -4],
      [-1, -3],
      [-1, -2],
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [-1, 2],
      [-1, 3],
      [-1, 4],
      [0, -4],
      [0, -3],
      [0, -2],
      [0, -1],
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [1, -4],
      [1, -3],
      [1, -2],
      [1, -1],
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 4],
      [2, -3],
      [2, -2],
      [2, -1],
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
      [3, -3],
      [3, -2],
      [3, -1],
      [3, 0],
      [3, 1],
      [3, 2],
      [3, 3],
      [4, -1],
      [4, 0],
      [4, 1],
    ];

    for (let i = this.flowers.length; i--; ) {
      this.flowers[i][0] += this.x;
      this.flowers[i][1] += this.z;

      if (
        this.flowers[i][0] >= 0 &&
        this.flowers[i][0] < fieldInfo[this.field].width &&
        this.flowers[i][1] >= 0 &&
        this.flowers[i][1] < fieldInfo[this.field].length
      ) {
        flowers[this.field][this.flowers[i][1]][
          this.flowers[i][0]
        ].puffshrooms.push(this);
      } else {
        this.flowers.splice(i, 1);
      }
    }
  }

  die(index) {
    objects.explosions.push(
      new Explosion({
        col: [0.6, 0.5, 0.1],
        pos: [
          this.pos[0],
          this.pos[1] + (this.displayScale * 1.75 + 0.25) * 0.5,
          this.pos[2],
        ],
        life: 1,
        size: this.displayScale * 2,
        speed: 0.2,
        aftershock: 0.05,
      }),
    );

    if (this.life <= 0) {
      objects.mobs.splice(index, 1);
      return;
    }

    let tokenChances = {
        honey: 7,
        treat: 5,
        sunflowerSeed: fieldInfo[this.field].generalColorComp.w * 0.9,
        pineapple: fieldInfo[this.field].generalColorComp.w * 0.9,
        strawberry: fieldInfo[this.field].generalColorComp.r * 2.2,
        blueberry: fieldInfo[this.field].generalColorComp.b * 2.2,
      },
      DIS = this,
      rarity = {
        puffshroom: 0.3,
        rarePuffshroom: 0.65,
        epicPuffshroom: 0.75,
        legendaryPuffshroom: 0.85,
        mythicPuffshroom: 1,
      }[this.type];

    if (this.field === "SunflowerField") tokenChances.sunflowerSeed += 1.25;
    if (this.field === "PineapplePatch") tokenChances.pineapple += 1.25;
    if (this.field === "PepperPatch") tokenChances.sunflowerSeed += 0.7;
    if (this.field === "CoconutField") tokenChances.coconut += 2;

    if (this.level >= 3) {
      tokenChances.softWax = (this.level * 0.05 + 0.05) * rarity * 0.25;
      tokenChances.gumdrops = (this.level * 0.06 + 0.1) * rarity;
      tokenChances.neonberry = (this.level * 0.02 + 0.1) * rarity * 0.8;
      tokenChances.bitterberry = (this.level * 0.035 + 0.1) * rarity * 0.9;
    }

    if (this.level >= 5) {
      tokenChances.fieldDice = (this.level * 0.05 + 0.08) * rarity * 0.175;
      tokenChances.royalJelly = (this.level * 0.04 + 0.09) * rarity;
    }

    if (this.level >= 6)
      tokenChances.hardWax = (this.level * 0.05 + 0.02) * rarity * 0.1;

    if (this.level >= 7) {
      tokenChances.smoothDice = (this.level * 0.05 + 0.05) * rarity * 0.08;
    }

    if (this.level >= 11) {
      tokenChances.glitter = (this.level * 0.07 + 0.06) * rarity * 0.1;
      tokenChances.glue = (this.level * 0.07 + 0.06) * rarity * 0.1;
    }

    if (this.level >= 13) {
      tokenChances.loadedDice = this.level * 0.05 * rarity * 0.03;
      tokenChances.swirledWax = (this.level * 0.075 + 0.04) * rarity * 0.06;
    }

    if (this.level >= 14) {
      tokenChances.causticWax = this.level * 0.075 * rarity * 0.06;
      tokenChances.starJelly = this.level * 0.03 * rarity * 0.1;
    }

    if (this.type === "mythicPuffshroom") {
      objects.tokens.push(
        new LootToken(
          30,
          [DIS.pos[0], DIS.pos[1] + 1, DIS.pos[2]],
          "turpentine",
          1,
          true,
          "Puffshroom",
        ),
      );
    }

    let totalChance = 0;

    for (let i in tokenChances) {
      totalChance += tokenChances[i];
    }

    for (let i in tokenChances) {
      tokenChances[i] /= totalChance;
    }

    for (
      let i = 0,
        c =
          MATH.random(2, 6) +
          this.level * 0.5 +
          [
            "puffshroom",
            "rarePuffshroom",
            "epicPuffshroom",
            "legendaryPuffshroom",
            "mythicPuffshroom",
          ].indexOf(this.type) *
            2;
      i < c;
      i++
    ) {
      window.setTimeout(function () {
        let c = 0,
          it = "honey",
          r = Math.random(),
          rad = Math.random() * (DIS.level * 0.15 + 4),
          the = Math.random() * MATH.TWO_PI;

        for (let j in tokenChances) {
          if (r <= tokenChances[j] + c) {
            it = j;
            break;
          }

          c += tokenChances[j];
        }

        let am = 1;

        switch (it) {
          case "honey":
            am = (DIS.cap * 0.15 * MATH.random(0.75, 1.33333)) | 0;
            break;
          case "treat":
            am = MATH.random(1, DIS.level * 0.35 + 1) | 0;
            break;
          case "gumdrops":
            am = MATH.random(1, 3) | 0;
            break;
        }

        objects.tokens.push(
          new LootToken(
            30,
            [
              DIS.pos[0] + Math.cos(the) * rad,
              DIS.pos[1] + 1,
              DIS.pos[2] + Math.sin(the) * rad,
            ],
            it,
            am,
            true,
            "Puffshroom",
          ),
        );
      }, 150 * i);
    }

    for (let i = this.flowers.length; i--; ) {
      for (let j in flowers[this.field][this.flowers[i][1]][this.flowers[i][0]]
        .puffshrooms) {
        if (
          flowers[this.field][this.flowers[i][1]][this.flowers[i][0]]
            .puffshrooms[j] === this
        ) {
          flowers[this.field][this.flowers[i][1]][
            this.flowers[i][0]
          ].puffshrooms.splice(j, 1);
          break;
        }
      }
    }

    player.stats.puffshrooms++;

    if (this.type !== "puffshroom") player.stats[this.type + "s"]++;

    if (this.life > 0) {
      for (
        let i = 0,
          c =
            Math.random() * Math.random() * 4 +
            (this.level < 3 ? 1 : this.level < 5 ? 0.5 : 0);
        i < c;
        i++
      ) {
        let _f = [];

        for (let j in fieldInfo) {
          if (j !== "AntField") {
            let x = (MATH.random(0.25, 0.75) * fieldInfo[j].width) | 0,
              z = (MATH.random(0.25, 0.75) * fieldInfo[j].length) | 0;

            _f.push([
              j,
              vec2.sqrDist(
                [this.pos[0], this.pos[2]],
                [fieldInfo[j].x + x, fieldInfo[j].z + z],
              ),
              x,
              z,
            ]);
          }
        }

        _f = _f[(Math.random() * _f.length) | 0];

        let lvl = this.level,
          rep = this.prevFields
            .slice(this.prevFields.length - 6)
            .indexOf(_f[0]),
          type = 10,
          types = (
            "puffshroom,".repeat(6) +
            "rarePuffshroom,".repeat(8) +
            "epicPuffshroom,".repeat(7) +
            "legendaryPuffshroom,".repeat(6) +
            "mythicPuffshroom,".repeat(5)
          ).split(",");

        types.pop();

        if (rep < 0) {
          lvl += MATH.random(0.75, 3) | 0;
          type -= MATH.random(2, 6);
        } else {
          lvl -= (rep * MATH.random(0, 2)) | 0;
          type += 3;
        }

        type -= lvl * 0.7;
        type =
          types[
            (Math.pow(Math.random(), Math.max(type, 2)) * types.length) | 0
          ];

        if (
          (type[0] === "r" && lvl < 5) ||
          (type[0] === "e" && lvl < 9) ||
          (type[0] === "l" && lvl < 11) ||
          (type[0] === "m" && lvl < 14)
        ) {
          type = "puffshroom";
        }

        objects.mobs.push(
          new Spore(
            this.pos,
            _f[0],
            _f[2],
            _f[3],
            lvl,
            this.life,
            this.prevFields,
            type,
          ),
        );
      }
    }

    objects.mobs.splice(index, 1);
  }

  update() {
    this.life -= dt;

    this.pollen = Math.round(this.pollen);

    this.pos[1] += this.displayScale * 1.75 + 0.25;

    textRenderer.addSingle(
      MATH.doGrammar(this.type) + " (Level " + this.level + ")",
      this.pos,
      COLORS.whiteArr,
      -2,
      false,
      false,
      0,
      0.7,
    );

    textRenderer.addSingle(
      "Time: " + MATH.doTime(this.life),
      this.pos,
      COLORS.whiteArr,
      -1.25,
      false,
      false,
      0,
      0.6,
    );
    textRenderer.addDecalRaw(
      this.pos[0],
      this.pos[1],
      this.pos[2],
      0,
      1.25,
      ...textRenderer.decalUV["rect"],
      0.61 * 0.5,
      0.42 * 0.5,
      0.27 * 0.5,
      3,
      0.6,
      0,
    );
    textRenderer.addDecalRaw(
      this.pos[0],
      this.pos[1],
      this.pos[2],
      (-0.5 + this.life * 0.0033333333 * 0.5) / (this.life * 0.0033333333),
      1.25,
      ...textRenderer.decalUV["rect"],
      0.61,
      0.42,
      0.27,
      this.life * 0.0033333333 * 3,
      0.6,
      0,
    );

    textRenderer.addSingle(
      this.pollen + "/" + this.cap,
      this.pos,
      COLORS.whiteArr,
      -1.25,
      true,
      true,
      0.175,
    );
    textRenderer.addDecalRaw(
      this.pos[0],
      this.pos[1],
      this.pos[2],
      0,
      0,
      ...textRenderer.decalUV["rect"],
      0,
      0.4,
      0,
      3,
      0.6,
      0,
    );
    textRenderer.addDecalRaw(
      this.pos[0],
      this.pos[1],
      this.pos[2],
      (-0.5 + this.pollen * this.invCap * 0.5) / (this.pollen * this.invCap),
      0,
      ...textRenderer.decalUV["rect"],
      0.1,
      0.85,
      0.1,
      Math.min(this.pollen * this.invCap, 1) * 3,
      0.6,
      0,
    );
    textRenderer.addDecalRaw(
      this.pos[0],
      this.pos[1],
      this.pos[2],
      0.6,
      -0.1,
      ...textRenderer.decalUV["flower"],
      1,
      1,
      1,
      -1.25,
      -1.25,
      0,
    );

    this.pos[1] -= this.displayScale * 1.75 + 0.25;

    gl.bindBuffer(gl.ARRAY_BUFFER, meshes[this.type].vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes[this.type].indexBuffer);
    gl.vertexAttribPointer(glCache.mob_vertPos, 3, gl.FLOAT, gl.FLASE, 24, 0);
    gl.vertexAttribPointer(
      glCache.mob_vertColor,
      3,
      gl.FLOAT,
      gl.FLASE,
      24,
      12,
    );

    gl.uniform4fv(glCache.mob_instanceInfo1, this.pos);
    gl.uniform2f(glCache.mob_instanceInfo2, this.displayScale, 1);
    gl.drawElements(
      gl.TRIANGLES,
      meshes[this.type].indexAmount,
      gl.UNSIGNED_SHORT,
      0,
    );

    return this.pollen >= this.cap || this.life <= 0;
  }
}
