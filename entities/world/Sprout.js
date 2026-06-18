class Sprout {
  constructor(field, type) {
    this.amount = {
      basic: 50000,
      rare: 150000,
      epic: 500000,
      legendary: 1500000,
      supreme: 3000000,
      gummy: 750000,
      moon: 100000,
    }[type];

    this.invAmount = 1 / this.amount;
    this.growth = 1;

    this.pollenBefore = player.stats["pollenFrom" + field] + this.amount;
    this.type = type;
    this.field = field;
    this.pos = [
      fieldInfo[this.field].x + fieldInfo[this.field].width * 0.5,
      fieldInfo[this.field].y + 0.5,
      fieldInfo[this.field].z + fieldInfo[this.field].length * 0.5,
      0,
    ];
  }

  die(index) {
    let amountOfTokens = {
        basic: 60,
        rare: 75,
        epic: 95,
        legendary: 120,
        supreme: 150,
        gummy: 90,
        moon: 70,
      }[this.type],
      dropTable = [],
      dropRates = {};

    for (let i in items) {
      if (
        i.toLowerCase().indexOf("egg") > -1 ||
        i.toLowerCase().indexOf("pass") > -1 ||
        i.toLowerCase().indexOf("drive") > -1 ||
        i.toLowerCase().indexOf("dice") > -1 ||
        i.toLowerCase().indexOf("wax") > -1 ||
        i.toLowerCase().indexOf("vial") > -1
      )
        continue;

      dropTable.push(i);
      dropRates[i] = 1 / items[i].value;
    }

    if (this.field !== "CoconutField") {
      dropTable.splice(dropTable.indexOf("coconut"), 1);
      dropTable.splice(dropTable.indexOf("tropicalDrink"), 1);
    }

    dropTable.splice(dropTable.indexOf("stinger"), 1);

    if (this.field === "StumpField") {
      dropTable.splice(dropTable.indexOf("strawberry"), 1);
      dropTable.splice(dropTable.indexOf("redExtract"), 1);
    }

    dropTable.splice(dropTable.indexOf("bitterberry"), 1);
    dropTable.splice(dropTable.indexOf("neonberry"), 1);
    dropTable.splice(dropTable.indexOf("whirligig"), 1);
    dropTable.splice(dropTable.indexOf("honeysuckle"), 1);
    dropTable.splice(dropTable.indexOf("microConverter"), 1);
    dropTable.splice(dropTable.indexOf("jellyBeans"), 1);
    dropTable.splice(dropTable.indexOf("purplePotion"), 1);
    dropTable.splice(dropTable.indexOf("superSmoothie"), 1);

    dropRates.strawberry *= fieldInfo[this.field].generalColorComp.r * 3.5;
    dropRates.redExtract *= fieldInfo[this.field].generalColorComp.r * 2;
    dropRates.pineapple *= fieldInfo[this.field].generalColorComp.w + 0.2;
    dropRates.enzymes *= fieldInfo[this.field].generalColorComp.b * 0.5 + 0.5;
    dropRates.sunflowerSeed *= fieldInfo[this.field].generalColorComp.w + 0.2;
    dropRates.oil *= fieldInfo[this.field].generalColorComp.r * 0.5 + 0.5;
    dropRates.treat *= fieldInfo[this.field].generalColorComp.w < 0.5 ? 0.3 : 1;
    dropRates.blueberry *= fieldInfo[this.field].generalColorComp.b * 3.5;
    dropRates.blueExtract *= fieldInfo[this.field].generalColorComp.b * 2;

    dropRates.royalJelly *= 4;
    dropRates.ticket *= 0.75;

    if (this.field === "PineapplePatch") {
      dropRates.pineapple *= 6;
      dropRates.enzymes *= 8;
      dropRates.treats *= 0.15;
    }

    if (this.field === "PepperPatch") {
      dropRates.sunflowerSeed *= 6;
    }

    if (this.field === "SunflowerField") {
      dropRates.sunflowerSeed *= 6;
      dropRates.oil *= 8;
      dropRates.treats *= 0.15;
    }

    if (this.field === "CoconutField") {
      dropRates.coconut *= 7;
      dropRates.tropicalDrink *= 7;
      dropRates.treats *= 1.5;
    }

    if (this.type === "basic") {
      dropTable.splice(dropTable.indexOf("redExtract"), 1);
      dropTable.splice(dropTable.indexOf("blueExtract"), 1);
      dropTable.splice(dropTable.indexOf("oil"), 1);
      dropTable.splice(dropTable.indexOf("enzymes"), 1);
      dropTable.splice(dropTable.indexOf("glitter"), 1);
      dropTable.splice(dropTable.indexOf("magicBean"), 1);
      dropTable.splice(dropTable.indexOf("tropicalDrink"), 1);
    }

    if (this.type === "rare") {
      dropRates.royalJelly *= 1.5;
      dropRates.redExtract *= 3;
      dropRates.blueExtract *= 3;
      dropRates.oil *= 2;
      dropRates.enzymes *= 2;
      dropRates.magicBean *= 1.5;
      dropRates.treats *= 0.65;

      dropRates.pineapple *= 0.85;
      dropRates.blueberry *= 0.85;
      dropRates.strawberry *= 0.85;
      dropRates.sunflowerSeed *= 0.85;
    }

    if (this.type === "epic") {
      dropRates.royalJelly *= 2;
      dropRates.redExtract *= 4.5;
      dropRates.blueExtract *= 4.5;
      dropRates.oil *= 3.5;
      dropRates.enzymes *= 3.5;
      dropRates.magicBean *= 2.5;
      dropRates.tropicalDrink *= 1.5;
      dropRates.glitter *= 1.5;
      dropRates.treats *= 0.35;

      dropRates.pineapple *= 0.65;
      dropRates.blueberry *= 0.65;
      dropRates.strawberry *= 0.65;
      dropRates.sunflowerSeed *= 0.65;
    }

    if (this.type === "legendary") {
      dropRates.royalJelly *= 2.5;
      dropRates.redExtract *= 6;
      dropRates.blueExtract *= 6;
      dropRates.oil *= 4;
      dropRates.enzymes *= 4;
      dropRates.magicBean *= 2.5;
      dropRates.tropicalDrink *= 2;
      dropRates.glitter *= 1.75;
      dropRates.treats *= 0.25;

      dropRates.pineapple *= 0.4;
      dropRates.blueberry *= 0.4;
      dropRates.strawberry *= 0.4;
      dropRates.sunflowerSeed *= 0.4;
    }

    if (this.type === "supreme") {
      dropRates.royalJelly *= 3;
      dropRates.redExtract *= 6;
      dropRates.blueExtract *= 6;
      dropRates.oil *= 5;
      dropRates.enzymes *= 5;
      dropRates.magicBean *= 3;
      dropRates.tropicalDrink *= 2.5;
      dropRates.glitter *= 2;
      dropRates.treats *= 0.15;

      dropRates.pineapple *= 0.25;
      dropRates.blueberry *= 0.25;
      dropRates.strawberry *= 0.25;
      dropRates.sunflowerSeed *= 0.25;
    }

    if (this.type === "gummy") {
      dropTable = ["gumdrops", "glue"];
      dropRates.glue = 8;
      dropRates.gumdrops = 1;
    } else {
      dropTable.splice(dropTable.indexOf("gumdrops"), 1);
      dropTable.splice(dropTable.indexOf("glue"), 1);
    }

    if (this.type === "moon") {
      dropTable = ["treat", "moonCharm"];
      dropRates.moonCharm = 4;
      dropRates.treat = 1;
    } else {
      dropTable.splice(dropTable.indexOf("moonCharm"), 1);
    }

    let totalChance = 0;

    for (let i in dropTable) {
      totalChance += dropRates[dropTable[i]];
    }

    for (let i in dropRates) {
      dropRates[i] /= totalChance;
    }

    for (let i = 0; i < amountOfTokens; i++) {
      let c = 0,
        it,
        r = Math.random();

      for (let j in dropTable) {
        if (r <= dropRates[dropTable[j]] + c) {
          it = dropTable[j];
          break;
        }

        c += dropRates[dropTable[j]];
      }

      let DIS = this;

      window.setTimeout(function () {
        objects.tokens.push(
          new LootToken(
            10,
            [
              fieldInfo[DIS.field].x +
                ((fieldInfo[DIS.field].width * Math.random()) | 0),
              fieldInfo[DIS.field].y + 1,
              fieldInfo[DIS.field].z +
                ((fieldInfo[DIS.field].length * Math.random()) | 0),
              0,
            ],
            it,
            1,
            false,
            "Sprout",
            ["tokensFromSprouts"],
          ),
        );
      }, 200 * i);
    }

    objects.explosions.push(
      new Explosion({
        col: [1, 1, 0.6],
        pos: this.pos,
        life: 1,
        size: 10,
        speed: 0.1,
        aftershock: 0.05,
        maxAlpha: 1,
        primitive: "cylinder_explosions",
        height: 500,
      }),
    );

    objects.mobs.splice(index, 1);
  }

  update() {
    let pollen = Math.max(
      this.pollenBefore - player.stats["pollenFrom" + this.field],
      0,
    );

    this.growth += (pollen * this.invAmount - this.growth) * dt * 15;

    textRenderer.addSingle(
      MATH.addCommas(pollen + ""),
      [this.pos[0], this.pos[1] + 4, this.pos[2]],
      COLORS.whiteArr,
      -3.5,
      false,
    );

    meshes.cylinder_explosions.instanceData.push(
      this.pos[0],
      this.pos[1],
      this.pos[2],
      1,
      1,
      0.6,
      0.15,
      5,
      500,
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, meshes[this.type + "Sprout"].vertBuffer);
    gl.bindBuffer(
      gl.ELEMENT_ARRAY_BUFFER,
      meshes[this.type + "Sprout"].indexBuffer,
    );
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
    gl.uniform2f(glCache.mob_instanceInfo2, 0.6 + (1 - this.growth) * 1.6, 1);
    gl.drawElements(
      gl.TRIANGLES,
      meshes[this.type + "Sprout"].indexAmount,
      gl.UNSIGNED_SHORT,
      0,
    );

    return pollen <= 0;
  }
}
