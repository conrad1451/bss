class Planter {
  constructor(
    type,
    field = player.fieldIn,
    x = player.flowerIn.x,
    z = player.flowerIn.z,
    growth = 0,
    glis,
  ) {
    this.growth = growth;
    this.maxGrowth = {
      paper: 10 * 60,
      plastic: 17 * 60,
      candy: 25 * 60,
      redClay: 32 * 60,
      blueClay: 32 * 60,
      tacky: 39 * 60,
      pesticide: 45 * 60,
      petal: 51 * 60,
      plenty: 60 * 60,
    }[type];
    this.invGrowth = 1 / this.maxGrowth;
    this.height = {
      paper: 1.5,
      plastic: 1.175,
      candy: 1.175,
      redClay: 1.175,
      blueClay: 1.175,
      tacky: 1.175,
      pesticide: 1.5,
      petal: 1.175,
      plenty: 2.4,
    }[type];
    this.type = type;
    this.field = field;
    this.x = x;
    this.z = z;
    this.pos = [
      fieldInfo[this.field].x + this.x,
      fieldInfo[this.field].y + 0.5,
      fieldInfo[this.field].z + this.z,
      0,
    ];
    this.hasGrown = false;
    this.glisterTimer = 0;
    this.glistering = glis;

    this.flowers = [];

    let rad = 5,
      sqRad = 5.5 * 5.5;

    for (let x = -rad; x <= rad; x++) {
      for (let z = -rad; z <= rad; z++) {
        if (
          x * x + z * z <= sqRad &&
          x + this.x >= 0 &&
          x + this.x < fieldInfo[this.field].width &&
          z + this.z >= 0 &&
          z + this.z < fieldInfo[this.field].length
        ) {
          this.flowers.push([x, z]);
        }
      }
    }

    let DIS = this;

    triggers["harvest_" + this.type + "_planter"] = {
      minX: this.pos[0] - 2,
      maxX: this.pos[0] + 2,
      minY: this.pos[1] - 1,
      maxY: this.pos[1] + 4,
      minZ: this.pos[2] - 2,
      maxZ: this.pos[2] + 2,
      isMachine: true,
      message:
        "Harvest " +
        MATH.doGrammar(this.type + "Planter") +
        "<br>(not fully grown)",
      func: function (player) {
        DIS.harvested = true;
      },
    };

    this.growthRate = glis ? 1.25 : 1;

    switch (this.type) {
      case "candy":
        if (
          this.field === "StrawberryField" ||
          this.field === "CoconutField" ||
          this.field === "PineapplePatch"
        ) {
          this.growthRate *= 1.25;
        }

        break;

      case "redClay":
        if (fieldInfo[this.field].generalColorComp.r > 0.5) {
          this.growthRate *= 1.25;
        }

        break;

      case "blueClay":
        if (fieldInfo[this.field].generalColorComp.b > 0.5) {
          this.growthRate *= 1.25;
        }

        break;

      case "tacky":
        if (
          this.field === "CoconutField" ||
          this.field === "DandelionField" ||
          this.field === "MushroomField" ||
          this.field === "SunflowerField" ||
          this.field === "BlueFlowerField"
        ) {
          this.growthRate *= 1.25;
        }

        break;

      case "pesticide":
        if (
          this.field === "StrawberryField" ||
          this.field === "SpiderField" ||
          this.field === "BambooField"
        ) {
          this.growthRate *= 1.35;
        }

        break;

      case "petal":
        if (fieldInfo[this.field].generalColorComp.w > 0.5) {
          this.growthRate *= 1.5;
        }

        break;

      case "plenty":
        if (
          this.field === "PepperPatch" ||
          this.field === "StumpField" ||
          this.field === "CoconutField" ||
          this.field === "MountainTopField"
        ) {
          this.growthRate *= 1.5;
        }

        break;
    }

    fieldInfo[this.field].planter = this;
  }

  beeSipped(bee) {
    this.growth +=
      bee.planterSipTime *
      0.5 *
      (bee.type === "shy" ? (bee.gifted ? 2.5 : 2) : 1);
    player.addEffect(
      fieldInfo[this.field].nectarType,
      (bee.planterSipTime *
        player.nectarMultiplier *
        (bee.type === "shy" ? (bee.gifted ? 2.5 : 2) : 1)) /
        (6 * 60 * 60),
    );
  }

  die(index) {
    fieldInfo[this.field].degration = Math.min(
      fieldInfo[this.field].degration +
        (this.maxGrowth / this.growthRate + 10 * 60) * 0.00027777777 * 2,
      1,
    );
    fieldInfo[this.field].planter = undefined;

    triggers["harvest_" + this.type + "_planter"].minY = 100000;
    triggers["harvest_" + this.type + "_planter"].maxY = 100000;

    if (this.type !== "paper") {
      items[this.type + "Planter"].amount++;
      player.updateInventory();
    }

    let perc = this.growth / this.maxGrowth,
      nectarBonus;

    if (Math.random() < perc * perc * perc * perc) {
      objects.mobs.push(
        new Puffshroom(
          this.field,
          this.x,
          this.z,
          5 * 60,
          Math.max(
            ({
              paper: 1,
              plastic: 2,
              candy: 3,
              redClay: 4,
              blueClay: 4,
              tacky: 5,
              pesticide: 6,
              petal: 7,
              plenty: 8,
            }[this.type] *
              perc +
              Math.round(MATH.random(-1, 1))) |
              0,
            1,
          ),
          "puffshroom",
        ),
      );
    }

    switch (this.type) {
      case "paper":
        nectarBonus = {
          comforting: 0.75,
          invigorating: 0.75,
          satisfying: 0.75,
          motivating: 0.75,
          refreshing: 0.75,
        };

        break;

      case "plastic":
        nectarBonus = {
          comforting: 1,
          invigorating: 1,
          satisfying: 1,
          motivating: 1,
          refreshing: 1,
        };

        break;

      case "candy":
        nectarBonus = {
          comforting: 1,
          invigorating: 1,
          satisfying: 1,
          motivating: 1.25,
          refreshing: 1,
        };

        break;

      case "redClay":
        nectarBonus = {
          comforting: 1,
          invigorating: 1.25,
          satisfying: 1.25,
          motivating: 1,
          refreshing: 1,
        };

        break;

      case "blueClay":
        nectarBonus = {
          comforting: 1.25,
          invigorating: 1,
          satisfying: 1,
          motivating: 1,
          refreshing: 1.25,
        };

        break;

      case "tacky":
        nectarBonus = {
          comforting: 1.3,
          invigorating: 1,
          satisfying: 1.3,
          motivating: 1,
          refreshing: 1,
        };

        break;

      case "pesticide":
        nectarBonus = {
          comforting: 1,
          invigorating: 1,
          satisfying: 1.35,
          motivating: 1.35,
          refreshing: 1,
        };

        break;

      case "petal":
        nectarBonus = {
          comforting: 1.5,
          invigorating: 1,
          satisfying: 1.5,
          motivating: 1,
          refreshing: 1,
        };

        break;

      case "plenty":
        nectarBonus = {
          comforting: 1.5,
          invigorating: 1.5,
          satisfying: 1.5,
          motivating: 1.5,
          refreshing: 1.5,
        };

        break;
    }

    let seconds =
      this.maxGrowth *
      perc *
      perc *
      2.5 *
      nectarBonus[fieldInfo[this.field].nectarType.replace("Nectar", "")] *
      player.nectarMultiplier;

    player.addEffect(fieldInfo[this.field].nectarType, seconds / (6 * 60 * 60));

    player.stats.hoursOfNectar += seconds / (60 * 60);
    player.stats.minutesOfNectar += seconds / 60;
    player.stats[
      "hoursOf" +
        MATH.doGrammar(fieldInfo[this.field].nectarType).replace(" ", "")
    ] += seconds / (60 * 60);
    player.stats[
      "minutesOf" +
        MATH.doGrammar(fieldInfo[this.field].nectarType).replace(" ", "")
    ] += seconds / 60;

    let amountOfTokens = Math.ceil(
        {
          paper: 9,
          plastic: 13,
          candy: 16,
          redClay: 19,
          blueClay: 19,
          tacky: 22,
          pesticide: 25,
          petal: 27,
          plenty: 30,
        }[this.type] *
          perc *
          perc *
          (1 - fieldInfo[this.field].degration * 0.666),
      ),
      dropTable = [],
      dropRates = {};

    for (let i in items) {
      if (
        i.toLowerCase().indexOf("egg") > -1 ||
        i.toLowerCase().indexOf("pass") > -1 ||
        i.toLowerCase().indexOf("drive") > -1 ||
        i.toLowerCase().indexOf("vial") > -1
      )
        continue;

      dropTable.push(i);
      dropRates[i] = 1 / items[i].value;
    }

    dropTable.splice(dropTable.indexOf("smoothDice"), 1);
    dropTable.splice(dropTable.indexOf("loadedDice"), 1);
    dropTable.splice(dropTable.indexOf("moonCharm"), 1);
    dropTable.splice(dropTable.indexOf("turpentine"), 1);

    if (this.field !== "CoconutField") {
      dropTable.splice(dropTable.indexOf("coconut"), 1);
      dropTable.splice(dropTable.indexOf("tropicalDrink"), 1);
    }

    if (this.field === "PineTreeForest") {
      dropRates.whirligig *= 45;
    } else {
      dropRates.whirligig *= 0.25;
    }

    if (
      this.field === "BlueFlowerField" ||
      this.field === "RoseField" ||
      this.field === "SunflowerField"
    ) {
      dropRates.honeysuckle *= 10;
    }

    if (this.field === "SpiderField" || this.field === "CactusField") {
      dropRates.stinger *= 2.5;
    } else {
      dropTable.splice(dropTable.indexOf("stinger"), 1);
    }

    if (this.field === "StumpField") {
      dropTable.splice(dropTable.indexOf("strawberry"), 1);
      dropTable.splice(dropTable.indexOf("redExtract"), 1);
    }

    if (this.type !== "pesticide") {
      dropTable.splice(dropTable.indexOf("bitterberry"), 1);
      dropTable.splice(dropTable.indexOf("neonberry"), 1);
    } else {
      dropRates.bitterberry *= 28;
      dropRates.neonberry *= 25;
      dropRates.royalJelly *= 1.5;
      dropRates.stinger *= 2;
      dropRates.causticWax *= 4;
    }

    if (this.type === "redClay") {
      dropRates.blueberry *= 0.25;
      dropRates.blueExtract = 0;
      dropRates.redExtract *= 2.25;
      dropRates.strawberry *= 2;
      dropRates.pineapple *= 0.5;
      dropRates.sunflowerSeed *= 0.5;
      dropRates.treat *= 0.5;
      dropRates.softWax *= 2.75;
      dropRates.hardWax *= 2.15;
      dropRates.swirledWax *= 1.75;
      dropRates.causticWax *= 1.75;
    }

    if (this.type === "blueClay") {
      dropRates.strawberry *= 0.25;
      dropRates.redExtract = 0;
      dropRates.blueExtract *= 2.25;
      dropRates.blueberry *= 2;
      dropRates.pineapple *= 0.5;
      dropRates.sunflowerSeed *= 0.5;
      dropRates.treat *= 0.5;
      dropRates.microConverter *= 7;
      dropRates.honeysuckle *= 7;
      dropTable.splice(dropTable.indexOf("softWax"), 1);
    }

    if (this.type === "candy") {
      dropRates.gumdrops *= 40;
      dropRates.glue *= 30;
      dropRates.treat = 0;
      dropTable.splice(dropTable.indexOf("purplePotion"), 1);
      dropTable.splice(dropTable.indexOf("superSmoothie"), 1);
    }

    if (this.type === "paper") {
      dropTable.splice(dropTable.indexOf("glitter"), 1);
      dropTable.splice(dropTable.indexOf("royalJelly"), 1);
      dropTable.splice(dropTable.indexOf("starJelly"), 1);
      dropTable.splice(dropTable.indexOf("purplePotion"), 1);
      dropTable.splice(dropTable.indexOf("superSmoothie"), 1);
      dropTable.splice(dropTable.indexOf("gumdrops"), 1);
      dropTable.splice(dropTable.indexOf("glue"), 1);
    } else {
      dropRates.blueExtract *= 1.5;
      dropRates.redExtract *= 1.5;
      dropRates.glitter *= 1.5;
      dropRates.royalJelly *= 2;
      dropRates.starJelly *= 0.75;
    }

    if (this.type === "tacky") {
      dropRates.sunflowerSeed *= 2;
      dropRates.oil *= 1.5;
      dropRates.fieldDice *= 2;
      dropRates.smoothDice *= 1.5;
      dropRates.loadedDice *= 1.25;
      dropTable.push("smoothDice");
      dropTable.push("loadedDice");
    }

    if (this.type === "petal") {
      dropRates.glitter *= 4.5;
      dropRates.royalJelly *= 4;
      dropRates.starJelly *= 4;
      dropRates.gumdrops *= 2.5;
      dropRates.glue *= 3;
      dropRates.tropicalDrink *= 2;
      dropRates.coconut *= 1.5;
      dropRates.bitterberry *= 3;
      dropRates.fieldDice *= 2;
      dropRates.smoothDice *= 1.75;
      dropRates.loadedDice *= 1.5;
      dropRates.whirligig *= 3;
      dropTable.push("bitterberry");
      dropTable.splice(dropTable.indexOf("strawberry"), 1);
      dropTable.splice(dropTable.indexOf("blueberry"), 1);
      dropTable.splice(dropTable.indexOf("redExtract"), 1);
      dropTable.splice(dropTable.indexOf("blueExtract"), 1);
      dropTable.push("smoothDice");
      dropTable.push("loadedDice");
      dropTable.push("turpentine");
    }

    if (this.type === "plenty") {
      dropRates.gumdrops *= 3;
      dropRates.glitter *= 3;
      dropRates.neonberry *= 4;
      dropRates.bitterberry *= 4;
      dropRates.enzymes *= 4;
      dropRates.oil *= 4;
      dropRates.redExtract *= 4;
      dropRates.blueExtract *= 4;
      dropRates.glue *= 3.5;
      dropRates.tropicalDrink *= 3;
      dropRates.royalJelly *= 4;
      dropRates.starJelly *= 6;
      dropRates.superSmoothie *= 3;
      dropRates.purplePotion *= 3;
      dropRates.coconut *= 1.5;
      dropRates.softWax *= 1.75;
      dropRates.hardWax *= 1.8;
      dropRates.swirledWax *= 1.85;
      dropRates.causticWax *= 1.95;
      dropRates.whirligig *= 2;
      dropTable.push("bitterberry");
      dropTable.push("neonberry");
      dropTable.push("turpentine");
      dropTable.splice(dropTable.indexOf("treat"), 1);
      dropTable.splice(dropTable.indexOf("strawberry"), 1);
      dropTable.splice(dropTable.indexOf("blueberry"), 1);
      dropTable.splice(dropTable.indexOf("sunflowerSeed"), 1);
      dropTable.splice(dropTable.indexOf("pineapple"), 1);
    }

    dropRates.strawberry *= fieldInfo[this.field].generalColorComp.r * 3.5;
    dropRates.redExtract *= fieldInfo[this.field].generalColorComp.r * 2;
    dropRates.pineapple *= fieldInfo[this.field].generalColorComp.w + 0.2;
    dropRates.enzymes *= fieldInfo[this.field].generalColorComp.b * 0.5 + 0.5;
    dropRates.sunflowerSeed *= fieldInfo[this.field].generalColorComp.w + 0.2;
    dropRates.oil *= fieldInfo[this.field].generalColorComp.r * 0.5 + 0.5;
    dropRates.treat *=
      fieldInfo[this.field].generalColorComp.w < 0.5 ? 0.3 : 2.5;
    dropRates.blueberry *= fieldInfo[this.field].generalColorComp.b * 3.5;
    dropRates.blueExtract *= fieldInfo[this.field].generalColorComp.b * 2;

    if (this.field === "PineapplePatch") {
      dropRates.pineapple *= 10;
      dropRates.enzymes *= 17;
      dropRates.treats *= 0.15;
    }

    if (this.field === "PepperPatch") {
      dropRates.sunflowerSeed *= 10;
    }

    if (this.field === "SunflowerField") {
      dropRates.sunflowerSeed *= 10;
      dropRates.oil *= 17;
      dropRates.treats *= 0.15;
    }

    if (this.field === "CoconutField") {
      dropRates.coconut *= 20;
      dropRates.tropicalDrink *= 20;
      dropRates.treats *= 2;
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

      let f = this.flowers[(Math.random() * this.flowers.length) | 0],
        DIS = this;

      window.setTimeout(function () {
        objects.tokens.push(
          new LootToken(
            45,
            [DIS.pos[0] + f[0], DIS.pos[1] + 0.5, DIS.pos[2] + f[1]],
            it,
            MATH.random(
              1,
              ({
                paper: 5,
                plastic: 6,
                candy: 7,
                redClay: 8,
                blueClay: 8,
                tacky: 9,
                pesticide: 9.5,
                petal: 13,
                plenty: 15,
              }[DIS.type] *
                (perc * 0.5 + 0.5)) /
                items[it].value +
                1,
            ) | 0,
            true,
            "Planter",
            ["tokensFromPlanters"],
          ),
        );
      }, 225 * i);
    }

    objects.planters.splice(index, 1);
  }

  update() {
    this.growth +=
      dt * this.growthRate * (1 - fieldInfo[this.field].degration * 0.9);

    if (this.growth > this.maxGrowth) {
      if (!this.hasGrown) {
        this.hasGrown = true;

        let DIS = this;

        triggers["harvest_" + this.type + "_planter"] = {
          minX: this.pos[0] - 2,
          maxX: this.pos[0] + 2,
          minY: this.pos[1] - 1,
          maxY: this.pos[1] + 4,
          minZ: this.pos[2] - 2,
          maxZ: this.pos[2] + 2,
          isMachine: true,
          message: "Harvest " + MATH.doGrammar(this.type + "Planter"),
          func: function (player) {
            DIS.harvested = true;
          },
        };
      }

      this.growth = this.maxGrowth;
    }

    textRenderer.addSingle(
      MATH.doGrammar(this.type + "Planter") +
        " (" +
        (this.growth * this.invGrowth * 100).toFixed(1) +
        " %)",
      [
        this.pos[0],
        this.pos[1] + this.height + this.displaySize + 0.5,
        this.pos[2],
      ],
      COLORS.whiteArr,
      -0.6,
      false,
    );

    textRenderer.addDecalRaw(
      this.pos[0],
      this.pos[1] + this.height + this.displaySize + 0.5,
      this.pos[2],
      0,
      0,
      ...textRenderer.decalUV["rect"],
      0,
      0.4,
      0,
      2.25,
      0.35,
      0,
    );

    textRenderer.addDecalRaw(
      this.pos[0],
      this.pos[1] + this.height + this.displaySize + 0.5,
      this.pos[2],
      (-0.5 + this.growth * this.invGrowth * 0.5) /
        (this.growth * this.invGrowth),
      0,
      ...textRenderer.decalUV["rect"],
      0.1,
      0.85,
      0.1,
      this.growth * this.invGrowth * 2.25,
      0.35,
      0,
    );

    this.displaySize =
      {
        paper: 1,
        plastic: 1.25,
        candy: 1.3,
        redClay: 1.35,
        blueClay: 1.35,
        tacky: 1.4,
        pesticide: 1.5,
        petal: 1.75,
        plenty: 2,
      }[this.type] *
        this.growth *
        this.invGrowth +
      0.3;

    meshes.explosions.instanceData.push(
      this.pos[0],
      this.pos[1] + this.height + this.displaySize * 0.5,
      this.pos[2],
      0.54 * fieldInfo[this.field].degration * player.isNight,
      MATH.lerp(0.8, 0.46, fieldInfo[this.field].degration) * player.isNight,
      0,
      1,
      this.displaySize,
      1.03,
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, meshes[this.type + "Planter"].vertBuffer);
    gl.bindBuffer(
      gl.ELEMENT_ARRAY_BUFFER,
      meshes[this.type + "Planter"].indexBuffer,
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
    gl.uniform2f(glCache.mob_instanceInfo2, 1, 1);
    gl.drawElements(
      gl.TRIANGLES,
      meshes[this.type + "Planter"].indexAmount,
      gl.UNSIGNED_SHORT,
      0,
    );

    if (this.glistering) {
      this.glisterTimer -= dt;

      if (this.glisterTimer < 0) {
        this.glisterTimer = 0.5;

        ParticleRenderer.add({
          x: this.pos[0] + MATH.random(-this.displaySize, this.displaySize),
          y:
            this.pos[1] +
            this.height +
            this.displaySize * 0.5 +
            MATH.random(-this.displaySize, this.displaySize),
          z: this.pos[2] + MATH.random(-this.displaySize, this.displaySize),
          vx: 0,
          vy: Math.random() * 0.2 + 0.1,
          vz: 0,
          grav: 0,
          size: MATH.random(30, 70),
          col: [1, 1, 1],
          life: 2,
          rotVel: 0,
          rot: MATH.HALF_PI,
          alpha: 0.75,
        });
      }
    }

    return this.harvested;
  }
}
