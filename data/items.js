export const items = {
  translator: {
    amount: 0,
    u: (128 * 0) / 2048,
    v: (128 * 0) / 2048,
    value: Infinity,
    use: function () {},
  },

  spiritPetal: {
    amount: 0,
    u: (128 * 0) / 2048,
    v: (128 * 0) / 2048,
    value: Infinity,
    use: function () {},
  },

  cog: {
    amount: 0,
    u: (128 * 0) / 2048,
    v: (128 * 0) / 2048,
    value: Infinity,
    use: function () {},
  },

  jellyBeans: {
    amount: 0,
    u: (128 * 3) / 2048,
    v: (128 * 11) / 2048,
    value: 20,
    cooldown: 25,
    autoUse: true,
    use: function () {
      if (!player.fieldIn) {
        player.addMessage(
          "You must be in a field to use Jelly Beans!",
          COLORS.redArr,
        );
        return;
      }

      items.jellyBeans.amount--;

      for (let i = 0; i < 15; i++) {
        window.setTimeout(function () {
          if (player.fieldIn) {
            let vel = player.bodyDir.slice();
            vel[1] = MATH.random(5, 9);
            vec3.rotateY(vel, vel, MATH.ORIGIN, MATH.random(-0.7, 0.7));
            vel[0] *= MATH.random(3, 9);
            vel[2] *= MATH.random(3, 9);

            let arr = [];

            arr.push("redJellyBean", "blueJellyBean", "whiteJellyBean");
            arr.push("redJellyBean", "blueJellyBean", "whiteJellyBean");
            arr.push("redJellyBean", "blueJellyBean", "whiteJellyBean");
            arr.push(
              "pinkJellyBean",
              "brownJellyBean",
              "blackJellyBean",
              "yellowJellyBean",
              "greenJellyBean",
            );

            objects.mobs.push(
              new JellyBean(
                player.fieldIn,
                vel,
                arr[(Math.random() * arr.length) | 0],
              ),
            );
          }
        }, 250 * i);
      }
    },
  },

  ticket: {
    amount: 0,
    u: (128 * 3) / 2048,
    v: (128 * 10) / 2048,
    value: 15,
    use: function () {},
  },

  antPass: {
    amount: 0,
    u: (128 * 4) / 2048,
    v: (128 * 10) / 2048,
    value: Infinity,
    use: function () {},
  },

  cloudVial: {
    amount: 0,
    u: (128 * 5) / 2048,
    v: (128 * 12) / 2048,
    value: 25,
    use: function () {
      if (!player.fieldIn) {
        player.addMessage(
          "You must be in a field to use Cloud Vials!",
          COLORS.redArr,
        );
        return;
      }

      if (player.fieldIn === "AntField") {
        player.addMessage(
          "You can' use this item in the Ant Field!",
          COLORS.redArr,
        );
        return;
      }

      let count = 0;

      for (let i in objects.mobs) {
        if (
          objects.mobs[i] instanceof Cloud &&
          objects.mobs[i].field === player.fieldIn
        ) {
          count++;
        }
      }

      if (count > 6) {
        player.addMessage(
          "There are too many clouds in this field!",
          COLORS.redArr,
        );
        return;
      }

      items.cloudVial.amount--;

      objects.mobs.push(
        new Cloud(player.fieldIn, player.flowerIn.x, player.flowerIn.z, 3 * 60),
      );
    },
  },

  magicBean: {
    amount: 0,
    u: (128 * 4) / 2048,
    v: (128 * 12) / 2048,
    value: 25,
    use: function () {
      if (!player.fieldIn) {
        player.addMessage(
          "You must be in a field to use Magic Beans!",
          COLORS.redArr,
        );
        return;
      }

      if (player.fieldIn === "AntField") {
        player.addMessage(
          "You can' use this item in the Ant Field!",
          COLORS.redArr,
        );
        return;
      }

      for (let i in objects.mobs) {
        if (
          objects.mobs[i] instanceof Sprout &&
          objects.mobs[i].field === player.fieldIn
        ) {
          player.addMessage(
            "There is already a sprout in this field!",
            COLORS.redArr,
          );
          return;
        }
      }

      items.magicBean.amount--;

      let type = ["basic", "rare", "epic", "gummy", "legendary", "supreme"];

      type =
        type[
          (Math.pow(Math.random(), 1.65) *
            Math.pow(Math.random(), 1.65) *
            type.length) |
            0
        ];

      if (Math.random() < 0.65 && player.isNight < 0.9) type = "moon";

      player.addMessage(
        "You planted a " + MATH.doGrammar(type) + " Sprout!",
        {
          rare: [130, 130, 130],
          epic: [210, 170, 0],
          legendary: [0, 190, 220],
          supreme: [30, 220, 90],
          gummy: [230, 70, 230],
          moon: [140, 200, 230],
        }[type],
      );

      objects.mobs.push(new Sprout(player.fieldIn, type));
    },
  },

  comfortingVial: {
    amount: 0,
    u: (128 * 0) / 2048,
    v: (128 * 0) / 2048,
    value: 35,
    use: function () {
      items.comfortingVial.amount--;
      player.addEffect("comfortingNectar", (60 * 60) / (60 * 60 * 6));
    },
  },

  invigoratingVial: {
    amount: 0,
    u: (128 * 0) / 2048,
    v: (128 * 0) / 2048,
    value: 35,
    use: function () {
      items.invigoratingVial.amount--;
      player.addEffect("invigoratingNectar", (60 * 60) / (60 * 60 * 6));
    },
  },

  motivatingVial: {
    amount: 0,
    u: (128 * 0) / 2048,
    v: (128 * 0) / 2048,
    value: 35,
    use: function () {
      items.motivatingVial.amount--;
      player.addEffect("motivatingNectar", (60 * 60) / (60 * 60 * 6));
    },
  },

  refreshingVial: {
    amount: 0,
    u: (128 * 0) / 2048,
    v: (128 * 0) / 2048,
    value: 35,
    use: function () {
      items.refreshingVial.amount--;
      player.addEffect("refreshingNectar", (60 * 60) / (60 * 60 * 6));
    },
  },

  satisfyingVial: {
    amount: 0,
    u: (128 * 0) / 2048,
    v: (128 * 0) / 2048,
    value: 35,
    use: function () {
      items.satisfyingVial.amount--;
      player.addEffect("satisfyingNectar", (60 * 60) / (60 * 60 * 6));
    },
  },

  redDrive: {
    amount: 0,
    u: (128 * 0) / 2048,
    v: (128 * 0) / 2048,
    value: 35,
    use: function () {
      if (!player.roboChallenge) {
        player.addMessage(
          "Drives can only be used in the Robo Challenge!",
          COLORS.redArr,
        );
        return;
      }

      items.redDrive.amount--;
      player.addEffect("redDriveBuff");
      player.extraInfo.drives.red = Math.min(
        player.extraInfo.drives.red + 1,
        50,
      );
    },
  },

  blueDrive: {
    amount: 0,
    u: (128 * 0) / 2048,
    v: (128 * 0) / 2048,
    value: 35,
    use: function () {
      if (!player.roboChallenge) {
        player.addMessage(
          "Drives can only be used in the Robo Challenge!",
          COLORS.redArr,
        );
        return;
      }

      items.blueDrive.amount--;
      player.addEffect("blueDriveBuff");
      player.extraInfo.drives.blue = Math.min(
        player.extraInfo.drives.blue + 1,
        50,
      );
    },
  },

  whiteDrive: {
    amount: 0,
    u: (128 * 0) / 2048,
    v: (128 * 0) / 2048,
    value: 35,
    use: function () {
      if (!player.roboChallenge) {
        player.addMessage(
          "Drives can only be used in the Robo Challenge!",
          COLORS.redArr,
        );
        return;
      }

      items.whiteDrive.amount--;
      player.addEffect("whiteDriveBuff");
      player.extraInfo.drives.white = Math.min(
        player.extraInfo.drives.white + 1,
        50,
      );
    },
  },

  glitchedDrive: {
    amount: 0,
    u: (128 * 0) / 2048,
    v: (128 * 0) / 2048,
    value: 35,
    use: function () {
      if (!player.roboChallenge) {
        player.addMessage(
          "Drives can only be used in the Robo Challenge!",
          COLORS.redArr,
        );
        return;
      }

      items.glitchedDrive.amount--;
      player.addEffect("glitchedDriveBuff");
      player.extraInfo.drives.glitched = Math.min(
        player.extraInfo.drives.glitched + 1,
        50,
      );
    },
  },

  roboPass: {
    amount: 0,
    u: (128 * 6) / 2048,
    v: (128 * 12) / 2048,
    value: 50,
    use: function () {},
  },

  fieldDice: {
    amount: 0,
    u: (128 * 5) / 2048,
    v: (128 * 10) / 2048,
    value: 12,
    use: function () {
      items.fieldDice.amount--;

      let f = [];

      for (let i in fieldInfo) {
        if (i !== "AntField") {
          f.push(i);
        }
      }

      for (let i = 0; i < 1; i++) {
        let r = (Math.random() * f.length) | 0;

        player.addEffect(
          f[r][0].toLowerCase() + f[r].substring(1, f[r].length) + "Boost",
          false,
          false,
          undefined,
          1,
        );

        player.addMessage(
          'Activated "' +
            MATH.doGrammar(
              f[r][0].toLowerCase() + f[r].substring(1, f[r].length),
            ) +
            ' Boost"',
        );
      }
    },
  },

  smoothDice: {
    amount: 0,
    u: (128 * 6) / 2048,
    v: (128 * 10) / 2048,
    value: 30,
    use: function () {
      items.smoothDice.amount--;

      let f = [];

      for (let i in fieldInfo) {
        if (i !== "AntField") {
          f.push(i);
        }
      }

      for (let i = 0; i < 2; i++) {
        let r = (Math.random() * f.length) | 0;

        player.addEffect(
          f[r][0].toLowerCase() + f[r].substring(1, f[r].length) + "Boost",
          false,
          false,
          undefined,
          2,
        );

        player.addMessage(
          'Activated x2 "' +
            MATH.doGrammar(
              f[r][0].toLowerCase() + f[r].substring(1, f[r].length),
            ) +
            ' Boost"',
        );

        f.splice(r, 1);
      }
    },
  },

  loadedDice: {
    amount: 0,
    u: (128 * 7) / 2048,
    v: (128 * 10) / 2048,
    value: 50,
    use: function () {
      items.loadedDice.amount--;

      let f = [];

      for (let i in fieldInfo) {
        if (i !== "AntField") {
          f.push(i);

          if (i === player.fieldIn) {
            f.push(i);
            f.push(i);
            f.push(i);
            f.push(i);
            f.push(i);
            f.push(i);
          }
        }
      }

      for (let i = 0; i < 3; i++) {
        let r = (Math.random() * f.length) | 0;

        player.addEffect(
          f[r][0].toLowerCase() + f[r].substring(1, f[r].length) + "Boost",
          false,
          false,
          undefined,
          3,
        );

        player.addMessage(
          'Activated x3 "' +
            MATH.doGrammar(
              f[r][0].toLowerCase() + f[r].substring(1, f[r].length),
            ) +
            ' Boost"',
        );

        for (let j in f) {
          if (f[j] === f[r]) {
            f.splice(j, 1);
          }
        }
      }
    },
  },

  microConverter: {
    amount: 0,
    u: (128 * 0) / 2048,
    v: (128 * 11) / 2048,
    value: 16,
    cooldown: 2,
    use: function () {
      if (player.pollen < 1) {
        player.addMessage(
          "You must have pollen to use a micro-converter!",
          COLORS.redArr,
        );
        return;
      }

      items.microConverter.amount--;

      textRenderer.add(
        (player.pollen * player.honeyPerPollen) | 0,
        [
          player.body.position.x,
          player.body.position.y + 2,
          player.body.position.z,
        ],
        COLORS.honey,
        1,
        "⇆",
      );
      player.honey += (player.pollen * player.honeyPerPollen) | 0;
      player.pollen = 0;
    },
  },

  honeysuckle: {
    amount: 0,
    u: (128 * 1) / 2048,
    v: (128 * 11) / 2048,
    value: 13,
    cooldown: 30,
    autoUse: true,
    use: function () {
      if (player.pollen < player.capacity * 0.9) {
        player.addMessage("Your container needs to be full!", COLORS.redArr);
        return;
      }

      let am = Math.min(player.convertTotal * 0.25, player.pollen);

      textRenderer.add(
        (am * player.honeyPerPollen) | 0,
        [
          player.body.position.x,
          player.body.position.y + 2,
          player.body.position.z,
        ],
        COLORS.honey,
        1,
        "⇆",
      );
      player.honey += (am * player.honeyPerPollen) | 0;
      player.pollen -= am;

      items.honeysuckle.amount--;
    },
  },

  whirligig: {
    amount: 0,
    u: (128 * 2) / 2048,
    v: (128 * 11) / 2048,
    value: 30,
    cooldown: 60,
    use: function () {
      if (player.antChallenge) {
        out.endAntChallenge();
        return;
      }

      items.whirligig.amount--;

      player.hivePos[0] += 1.5;
      player.hivePos[2] += 2;

      player.body.velocity.x = 0;
      player.body.velocity.y = 0;
      player.body.velocity.z = 0;

      player.body.position.x = player.hivePos[0];
      player.body.position.y = player.hivePos[1];
      player.body.position.z = player.hivePos[2];

      for (let i in objects.bees) {
        objects.bees[i].pos = player.hivePos.slice();
        objects.bees[i].state = "moveToPlayer";
      }

      player.hivePos[0] -= 1.5;
      player.hivePos[2] -= 2;
    },
  },

  softWax: {
    canUseOnSlot: (slot) => {
      return slot.beequip && slot.beequip.waxes.length < 5;
    },
    amount: 0,
    u: (128 * 2) / 2048,
    v: (128 * 9) / 2048,
    value: 3,
    use: function () {
      player.addMessage("The wax improved the beequip!");

      items.softWax.amount--;

      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip.waxes.push(
        "1softWax",
      );

      let beeStats =
          player.hive[player.hiveIndex[1]][
            player.hiveIndex[0]
          ].beequip.stats.bee.split(","),
        numStatsToAdd =
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip
            .potential >= 3
            ? 2
            : 1,
        statsToAdd = [],
        permBeeStats =
          player.hive[player.hiveIndex[1]][
            player.hiveIndex[0]
          ].beequip.stats.bee.split(",");

      for (let i = 0; i < numStatsToAdd; i++) {
        let j = (Math.random() * beeStats.length) | 0;
        statsToAdd.push(beeStats[j]);
        beeStats.splice(j, 1);
      }

      for (let i in statsToAdd) {
        for (let j in permBeeStats) {
          if (statsToAdd[i] === permBeeStats[j]) {
            let np =
              player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip
                .potential / 5;

            let improvement = Number(
              permBeeStats[j][0] === "*"
                ? (MATH.random(0.05, 0.1) * (np * 0.15 + 1)).toFixed(2)
                : (MATH.random(1, 5) * (np * 0.5 + 1)) | 0,
            );

            permBeeStats[j] =
              permBeeStats[j].substring(0, permBeeStats[j].indexOf("(") + 2) +
              (
                Number(
                  permBeeStats[j].substring(
                    permBeeStats[j].indexOf("(") + 2,
                    permBeeStats[j].indexOf(")"),
                  ),
                ) + improvement
              )
                .toFixed(2)
                .replaceAll(".00", "") +
              ")";
          }
        }
      }

      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip.stats.bee =
        permBeeStats.join(",");

      player.updateBeequipPage();
      player.updateHive();
    },
  },

  hardWax: {
    canUseOnSlot: (slot) => {
      return slot.beequip && slot.beequip.waxes.length < 5;
    },
    amount: 0,
    u: (128 * 3) / 2048,
    v: (128 * 9) / 2048,
    value: 26,
    use: function () {
      items.hardWax.amount--;

      if (Math.random() > 0.6) {
        player.addMessage(
          "The wax failed to improve the beequip!",
          COLORS.redArr,
        );
        player.hive[player.hiveIndex[1]][
          player.hiveIndex[0]
        ].beequip.waxes.push("0hardWax");
        player.updateBeequipPage();
        player.updateHive();
        return;
      }

      player.addMessage("The wax improved the beequip!");

      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip.waxes.push(
        "1hardWax",
      );

      let beeStats =
          player.hive[player.hiveIndex[1]][
            player.hiveIndex[0]
          ].beequip.stats.bee.split(","),
        numStatsToAdd =
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip
            .potential >= 3 && Math.random() < 0.5
            ? 3
            : 2,
        statsToAdd = [],
        permBeeStats =
          player.hive[player.hiveIndex[1]][
            player.hiveIndex[0]
          ].beequip.stats.bee.split(",");

      for (let i = 0; i < numStatsToAdd; i++) {
        let j = (Math.random() * beeStats.length) | 0;
        statsToAdd.push(beeStats[j]);
        beeStats.splice(j, 1);
      }

      for (let i in statsToAdd) {
        for (let j in permBeeStats) {
          if (statsToAdd[i] === permBeeStats[j]) {
            let np =
              player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip
                .potential / 5;

            let improvement = Number(
              permBeeStats[j][0] === "*"
                ? (MATH.random(0.075, 0.125) * (np * 0.15 + 1)).toFixed(2)
                : (MATH.random(2, 6) * (np * 0.5 + 1)) | 0,
            );

            permBeeStats[j] =
              permBeeStats[j].substring(0, permBeeStats[j].indexOf("(") + 2) +
              (
                Number(
                  permBeeStats[j].substring(
                    permBeeStats[j].indexOf("(") + 2,
                    permBeeStats[j].indexOf(")"),
                  ),
                ) + improvement
              )
                .toFixed(2)
                .replaceAll(".00", "") +
              ")";
          }
        }
      }

      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip.stats.bee =
        permBeeStats.join(",");

      player.updateBeequipPage();
      player.updateHive();
    },
  },

  causticWax: {
    canUseOnSlot: (slot) => {
      return slot.beequip && slot.beequip.waxes.length < 5;
    },
    amount: 0,
    u: (128 * 4) / 2048,
    v: (128 * 9) / 2048,
    value: 55,
    use: function () {
      items.causticWax.amount--;

      if (Math.random() < 0.75) {
        player.addMessage("The wax destroyed the beequip!", COLORS.redArr);

        for (let i in player.currentGear.beequips)
          if (
            player.currentGear.beequips[i].id ===
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip.id
          )
            player.beequipLookingAt = Number(i);

        window.deleteBeequip();
        return;
      }

      player.addMessage("The wax improved the beequip!");

      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip.waxes.push(
        "1causticWax",
      );

      let beeStats =
          player.hive[player.hiveIndex[1]][
            player.hiveIndex[0]
          ].beequip.stats.bee.split(","),
        numStatsToAdd =
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip
            .potential >= 4 && Math.random() < 0.75
            ? 4
            : 3,
        statsToAdd = [],
        permBeeStats =
          player.hive[player.hiveIndex[1]][
            player.hiveIndex[0]
          ].beequip.stats.bee.split(",");

      for (let i = 0; i < numStatsToAdd; i++) {
        let j = (Math.random() * beeStats.length) | 0;
        statsToAdd.push(beeStats[j]);
        beeStats.splice(j, 1);
      }

      for (let i in statsToAdd) {
        for (let j in permBeeStats) {
          if (statsToAdd[i] === permBeeStats[j]) {
            let np =
              player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip
                .potential / 5;

            let improvement = Number(
              permBeeStats[j][0] === "*"
                ? (MATH.random(0.1, 0.175) * (np * 0.15 + 1)).toFixed(2)
                : (MATH.random(4, 9) * (np * 0.5 + 1)) | 0,
            );

            permBeeStats[j] =
              permBeeStats[j].substring(0, permBeeStats[j].indexOf("(") + 2) +
              (
                Number(
                  permBeeStats[j].substring(
                    permBeeStats[j].indexOf("(") + 2,
                    permBeeStats[j].indexOf(")"),
                  ),
                ) + improvement
              )
                .toFixed(2)
                .replaceAll(".00", "") +
              ")";
          }
        }
      }

      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip.stats.bee =
        permBeeStats.join(",");

      player.updateBeequipPage();
      player.updateHive();
    },
  },

  swirledWax: {
    canUseOnSlot: (slot) => {
      return slot.beequip && slot.beequip.waxes.length < 5;
    },
    amount: 0,
    u: (128 * 5) / 2048,
    v: (128 * 9) / 2048,
    value: 42,
    use: function () {
      items.swirledWax.amount--;

      player.addMessage("The wax rerolled the beequip stats!");

      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip.waxes.push(
        "1swirledWax",
      );

      let stats =
        player.hive[player.hiveIndex[1]][
          player.hiveIndex[0]
        ].beequip.stats.bee.split(",");

      for (let i in stats) {
        let newNum =
          Number(stats[i].substring(1, stats[i].indexOf(" "))) *
          (stats[i][0] === "*" ? MATH.random(0.8, 1.25) : MATH.random(0.5, 2));

        stats[i] =
          stats[i][0] +
          (stats[i][0] === "+"
            ? Math.round(newNum)
            : newNum.toFixed(2).replace(".00", "")) +
          stats[i].substring(stats[i].indexOf(" "), stats[i].length);
      }

      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip.stats.bee =
        stats.join(",");

      player.updateBeequipPage();
      player.updateHive();
    },
  },

  turpentine: {
    canUseOnSlot: (slot) => {
      return slot.beequip && slot.beequip.waxes.length > 0;
    },
    amount: 0,
    u: (128 * 0) / 2048,
    v: (128 * 13) / 2048,
    value: 60,
    use: function () {
      items.turpentine.amount--;

      player.addMessage("The turpentine removed all waxes on the beequip!");

      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip.waxes = [];

      let stats =
        player.hive[player.hiveIndex[1]][
          player.hiveIndex[0]
        ].beequip.stats.bee.split(",");

      for (let i in stats) {
        stats[i] = stats[i].substr(0, stats[i].indexOf("(")) + "(+0)";
      }

      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip.stats.bee =
        stats.join(",");

      player.updateBeequipPage();
      player.updateHive();
    },
  },

  paperPlanter: {
    amount: 0,
    u: 0,
    v: 0,
    value: Infinity,
    use: function () {
      if (objects.planters.length >= 3) {
        player.addMessage(
          "You can only have 3 planters at once!",
          COLORS.redArr,
        );
        return;
      }

      if (player.fieldIn) {
        for (let i in objects.planters) {
          if (player.fieldIn === objects.planters[i].field) {
            player.addMessage(
              "You can only have 1 planter in a field!",
              COLORS.redArr,
            );
            return;
          }

          if (objects.planters[i].type === "paper") {
            player.addMessage(
              "You can only have 1 paper planter active!",
              COLORS.redArr,
            );
            return;
          }
        }

        items.paperPlanter.amount--;
        objects.planters.push(new Planter("paper"));
      } else {
        player.addMessage(
          "You must be in a field to place a planter!",
          COLORS.redArr,
        );
      }
    },
  },

  plasticPlanter: {
    amount: 0,
    u: 0,
    v: 0,
    value: Infinity,
    use: function () {
      if (objects.planters.length >= 3) {
        player.addMessage(
          "You can only have 3 planters at once!",
          COLORS.redArr,
        );
        return;
      }

      if (player.fieldIn) {
        items.plasticPlanter.amount--;
        objects.planters.push(new Planter("plastic"));
      } else {
        player.addMessage(
          "You must be in a field to place a planter!",
          COLORS.redArr,
        );
      }
    },
  },

  candyPlanter: {
    amount: 0,
    u: 0,
    v: 0,
    value: Infinity,
    use: function () {
      if (objects.planters.length >= 3) {
        player.addMessage(
          "You can only have 3 planters at once!",
          COLORS.redArr,
        );
        return;
      }

      if (player.fieldIn) {
        items.candyPlanter.amount--;
        objects.planters.push(new Planter("candy"));
      } else {
        player.addMessage(
          "You must be in a field to place a planter!",
          COLORS.redArr,
        );
      }
    },
  },

  redClayPlanter: {
    amount: 0,
    u: 0,
    v: 0,
    value: Infinity,
    use: function () {
      if (objects.planters.length >= 3) {
        player.addMessage(
          "You can only have 3 planters at once!",
          COLORS.redArr,
        );
        return;
      }

      if (player.fieldIn) {
        items.redClayPlanter.amount--;
        objects.planters.push(new Planter("redClay"));
      } else {
        player.addMessage(
          "You must be in a field to place a planter!",
          COLORS.redArr,
        );
      }
    },
  },

  blueClayPlanter: {
    amount: 0,
    u: 0,
    v: 0,
    value: Infinity,
    use: function () {
      if (objects.planters.length >= 3) {
        player.addMessage(
          "You can only have 3 planters at once!",
          COLORS.redArr,
        );
        return;
      }

      if (player.fieldIn) {
        items.blueClayPlanter.amount--;
        objects.planters.push(new Planter("blueClay"));
      } else {
        player.addMessage(
          "You must be in a field to place a planter!",
          COLORS.redArr,
        );
      }
    },
  },

  tackyPlanter: {
    amount: 0,
    u: 0,
    v: 0,
    value: Infinity,
    use: function () {
      if (objects.planters.length >= 3) {
        player.addMessage(
          "You can only have 3 planters at once!",
          COLORS.redArr,
        );
        return;
      }

      if (player.fieldIn) {
        items.tackyPlanter.amount--;
        objects.planters.push(new Planter("tacky"));
      } else {
        player.addMessage(
          "You must be in a field to place a planter!",
          COLORS.redArr,
        );
      }
    },
  },

  pesticidePlanter: {
    amount: 0,
    u: 0,
    v: 0,
    value: Infinity,
    use: function () {
      if (objects.planters.length >= 3) {
        player.addMessage(
          "You can only have 3 planters at once!",
          COLORS.redArr,
        );
        return;
      }

      if (player.fieldIn) {
        items.pesticidePlanter.amount--;
        objects.planters.push(new Planter("pesticide"));
      } else {
        player.addMessage(
          "You must be in a field to place a planter!",
          COLORS.redArr,
        );
      }
    },
  },

  petalPlanter: {
    amount: 0,
    u: 0,
    v: 0,
    value: Infinity,
    use: function () {
      if (objects.planters.length >= 3) {
        player.addMessage(
          "You can only have 3 planters at once!",
          COLORS.redArr,
        );
        return;
      }

      if (player.fieldIn) {
        items.petalPlanter.amount--;
        objects.planters.push(new Planter("petal"));
      } else {
        player.addMessage(
          "You must be in a field to place a planter!",
          COLORS.redArr,
        );
      }
    },
  },

  plentyPlanter: {
    amount: 0,
    u: 0,
    v: 0,
    value: Infinity,
    use: function () {
      if (objects.planters.length >= 3) {
        player.addMessage(
          "You can only have 3 planters at once!",
          COLORS.redArr,
        );
        return;
      }

      if (player.fieldIn) {
        items.plentyPlanter.amount--;
        objects.planters.push(new Planter("plenty"));
      } else {
        player.addMessage(
          "You must be in a field to place a planter!",
          COLORS.redArr,
        );
      }
    },
  },

  gumdrops: {
    amount: 0,
    u: 128 / 2048,
    v: (128 * 7) / 2048,
    cooldown: 4,
    autoUse: true,
    value: 5,
    use: function () {
      if (player.fieldIn) {
        player.stats.gummyMorph++;
        player.stats.gummyStar++;

        if (Math.random() < 0.09) player.stats.gummyStar += 20;

        items.gumdrops.amount--;

        for (let i = 0, l = MATH.random(2, 5) | 0; i < l; i++) {
          let r = MATH.random(2, 5) | 0,
            f = function (f) {
              f.goo = 1;
              f.height = 1;
            },
            ox = (Math.random() * fieldInfo[player.fieldIn].width) | 0,
            oz = (Math.random() * fieldInfo[player.fieldIn].length) | 0;

          for (let x = -r; x <= r; x++) {
            let _x = x + ox;

            for (let z = -r; z <= r; z++) {
              let _z = z + oz;

              if (
                Math.abs(_x - ox) + Math.abs(_z - oz) <= r &&
                _x >= 0 &&
                _x < fieldInfo[player.fieldIn].width &&
                _z >= 0 &&
                _z < fieldInfo[player.fieldIn].length
              ) {
                updateFlower(player.fieldIn, _x, _z, f, true, true, false);
              }
            }
          }

          objects.explosions.push(
            new Explosion({
              col: [1, 0.2, 1],
              pos: [
                fieldInfo[player.fieldIn].x + ox,
                fieldInfo[player.fieldIn].y + 0.5,
                fieldInfo[player.fieldIn].z + oz,
              ],
              life: 0.75,
              size: r * 1.5,
              speed: 0.5,
              aftershock: 0.005,
              height: 0.3,
            }),
          );
        }
      } else {
        if (triggers.gummyBee_tame.colliding) {
          items.gumdrops.amount--;
          player.body.position.set(0, 1002, 1013);
          player.body.velocity.set(0, 0, 0);
          return;
        }

        player.addMessage(
          "You must be standing in a field to use gumdrops!",
          COLORS.redArr,
        );
      }
    },
  },

  coconut: {
    amount: 0,
    u: (128 * 2) / 2048,
    v: (128 * 7) / 2048,
    cooldown: 10,
    autoUse: true,
    value: 4,
    use: function () {
      if (player.fieldIn) {
        items.coconut.amount--;

        objects.mobs.push(
          new Coconut(
            (Math.random() * fieldInfo[player.fieldIn].width) | 0,
            (Math.random() * fieldInfo[player.fieldIn].length) | 0,
            0,
          ),
        );
      } else {
        player.addMessage(
          "You must be standing in a field to use coconuts!",
          COLORS.redArr,
        );
      }
    },
  },

  stinger: {
    amount: 0,
    u: (128 * 3) / 2048,
    v: (128 * 7) / 2048,
    value: 10,
    use: function () {
      items.stinger.amount--;
      player.addEffect("stingerBuff");
      player.stats.stingerUsed++;
    },
  },

  glue: {
    amount: 0,
    u: 0,
    v: (128 * 3) / 2048,
    value: 19,
    use: function () {
      for (let i in player.effects) {
        // if(player.effects[i].type==='purplePotionBuff'){

        //     player.addMessage('Cannot use while Purple Potion is active!',COLORS.redArr)
        //     return
        // }

        if (player.effects[i].type === "superSmoothieBuff") {
          player.addMessage(
            "Cannot use while Super Smoothie is active!",
            COLORS.redArr,
          );
          return;
        }
      }

      items.glue.amount--;
      player.addEffect("glueBuff");
    },
  },

  oil: {
    amount: 0,
    u: 128 / 2048,
    v: (128 * 3) / 2048,
    value: 17,
    use: function () {
      for (let i in player.effects) {
        if (player.effects[i].type === "superSmoothieBuff") {
          player.addMessage(
            "Cannot use while Super Smoothie is active!",
            COLORS.redArr,
          );
          return;
        }
      }

      items.oil.amount--;
      player.addEffect("oilBuff");
    },
  },

  enzymes: {
    amount: 0,
    u: (128 * 2) / 2048,
    v: (128 * 3) / 2048,
    value: 17,
    use: function () {
      for (let i in player.effects) {
        if (player.effects[i].type === "superSmoothieBuff") {
          player.addMessage(
            "Cannot use while Super Smoothie is active!",
            COLORS.redArr,
          );
          return;
        }
      }

      items.enzymes.amount--;
      player.addEffect("enzymesBuff");
    },
  },

  redExtract: {
    amount: 0,
    u: (128 * 3) / 2048,
    v: (128 * 3) / 2048,
    value: 17,
    use: function () {
      for (let i in player.effects) {
        // if(player.effects[i].type==='purplePotionBuff'){

        //     player.addMessage('Cannot use while Purple Potion is active!',COLORS.redArr)
        //     return
        // }

        if (player.effects[i].type === "superSmoothieBuff") {
          player.addMessage(
            "Cannot use while Super Smoothie is active!",
            COLORS.redArr,
          );
          return;
        }
      }

      items.redExtract.amount--;
      player.addEffect("redExtractBuff");
    },
  },

  blueExtract: {
    amount: 0,
    u: (128 * 4) / 2048,
    v: (128 * 3) / 2048,
    value: 17,
    use: function () {
      for (let i in player.effects) {
        // if(player.effects[i].type==='purplePotionBuff'){

        //     player.addMessage('Cannot use while Purple Potion is active!',COLORS.redArr)
        //     return
        // }

        if (player.effects[i].type === "superSmoothieBuff") {
          player.addMessage(
            "Cannot use while Super Smoothie is active!",
            COLORS.redArr,
          );
          return;
        }
      }

      items.blueExtract.amount--;
      player.addEffect("blueExtractBuff");
    },
  },

  tropicalDrink: {
    amount: 0,
    u: (128 * 5) / 2048,
    v: (128 * 3) / 2048,
    value: 22,
    use: function () {
      for (let i in player.effects) {
        if (player.effects[i].type === "superSmoothieBuff") {
          player.addMessage(
            "Cannot use while Super Smoothie is active!",
            COLORS.redArr,
          );
          return;
        }
      }

      items.tropicalDrink.amount--;
      player.addEffect("tropicalDrinkBuff");
    },
  },

  purplePotion: {
    amount: 0,
    u: (128 * 6) / 2048,
    v: (128 * 3) / 2048,
    value: 95,
    use: function () {
      for (let i in player.effects) {
        if (player.effects[i].type === "redExtractBuff") {
          player.addMessage(
            "Cannot use while Red Extract is active!",
            COLORS.redArr,
          );
          return;
        }

        if (player.effects[i].type === "blueExtractBuff") {
          player.addMessage(
            "Cannot use while Blue Extract is active!",
            COLORS.redArr,
          );
          return;
        }

        if (player.effects[i].type === "glueBuff") {
          player.addMessage("Cannot use while Glue is active!", COLORS.redArr);
          return;
        }

        if (player.effects[i].type === "superSmoothieBuff") {
          player.addMessage(
            "Cannot use while Super Smoothie is active!",
            COLORS.redArr,
          );
          return;
        }
      }

      items.purplePotion.amount--;
      player.addEffect("purplePotionBuff");
    },
  },

  superSmoothie: {
    amount: 0,
    u: (128 * 7) / 2048,
    v: (128 * 3) / 2048,
    value: 120,
    use: function () {
      for (let i in player.effects) {
        if (player.effects[i].type === "redExtractBuff") {
          player.addMessage(
            "Cannot use while Red Extract is active!",
            COLORS.redArr,
          );
          return;
        }

        if (player.effects[i].type === "blueExtractBuff") {
          player.addMessage(
            "Cannot use while Blue Extract is active!",
            COLORS.redArr,
          );
          return;
        }

        if (player.effects[i].type === "glueExtractBuff") {
          player.addMessage("Cannot use while Glue is active!", COLORS.redArr);
          return;
        }

        if (player.effects[i].type === "enzymesBuff") {
          player.addMessage(
            "Cannot use while Enzymes are active!",
            COLORS.redArr,
          );
          return;
        }

        if (player.effects[i].type === "oilBuff") {
          player.addMessage("Cannot use while Oil is active!", COLORS.redArr);
          return;
        }

        if (player.effects[i].type === "tropicalDrinkBuff") {
          player.addMessage(
            "Cannot use while Tropical Drink is active!",
            COLORS.redArr,
          );
          return;
        }

        if (player.effects[i].type === "purplePotionBuff") {
          player.addMessage(
            "Cannot use while Purple Potion is active!",
            COLORS.redArr,
          );
          return;
        }
      }

      items.superSmoothie.amount--;
      player.addEffect("superSmoothieBuff");
    },
  },

  bitterberry: {
    canUseOnSlot: (slot) => {
      return slot.type !== null;
    },
    amount: 0,
    u: (128 * 6) / 2048,
    v: (128 * 7) / 2048,
    value: 10,
    use: function () {
      howManyToFeed.style.display = "block";
      feedAmount.value = 1;
      howManyMessage.innerHTML =
        "How many bitterberries will you feed to " +
        MATH.doGrammar(
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
        ) +
        " Bee?";
      document.getElementById("feedUntilGifted").style.display = "none";

      // CHQ: Limit the amount of treats fed to what the player actually have in inventory.
      //      How: using constrain method of Math to set the feed amount to the lower of the
      //           amount the player specified and the amount that the user actually has
      howManyToFeed.onmousemove = feedAmount.oninput = function () {
        let a = feedAmount.value;
        feedAmount.value = MATH.constrain(a, 1, items.bitterberry.amount);
      };

      document.getElementById("cancelFeeding").onclick = function () {
        howManyToFeed.style.display = "none";
      };

      document.getElementById("feedThisAmount").onclick = function () {
        howManyToFeed.style.display = "none";

        let amount = feedAmount.value;
        items.bitterberry.amount -= amount;
        player.stats.bitterberry += Number(amount);
        player.updateInventory();

        // CHQ: randomly gives powerup to bees
        if (
          Math.random() <
          1 -
            Math.pow(
              1 -
                1 /
                  (player.hive[player.hiveIndex[1]][player.hiveIndex[0]]
                    .radioactive > 0
                    ? 30
                    : 100),
              amount,
            )
        ) {
          player.addMessage(
            "☢️ " +
              MATH.doGrammar(
                player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
              ) +
              " bee gained a mutation! ☢️",
            [50, 225, 90],
          );

          let stat = [
              "abilityRate",
              "gatherAmount",
              "convertAmount",
              "maxEnergy",
              "attack",
              "gatherAmount",
              "convertAmount",
              "maxEnergy",
              "attack",
              "gatherAmount",
              "convertAmount",
              "maxEnergy",
              "attack",
              "gatherAmount",
              "convertAmount",
              "maxEnergy",
              "attack",
              "gatherAmount",
              "convertAmount",
              "maxEnergy",
              "attack",
              "gatherAmount",
              "convertAmount",
              "maxEnergy",
              "attack",
              "gatherAmount",
              "convertAmount",
              "maxEnergy",
              "attack",
              "gatherAmount",
              "convertAmount",
              "maxEnergy",
              "attack",
            ],
            oper,
            num,
            level =
              player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.level -
              1;

          stat = stat[(Math.random() * stat.length) | 0];

          oper =
            stat === "attack" ||
            stat === "convertAmount" ||
            stat === "gatherAmount"
              ? Math.random() < 0.5
                ? "+"
                : "*"
              : "*";

          switch (stat) {
            case "attack":
              num =
                oper === "+"
                  ? MATH.random(1 + level * (2 / 20), 3 + level * (4 / 20)) | 0
                  : MATH.random(1.05, 1.35 + level * 0.02);
              break;
            case "gatherAmount":
              num =
                oper === "+"
                  ? MATH.random(4 + level * (8 / 20), 10 + level * (16 / 20)) |
                    0
                  : MATH.random(1.1, 1.3 + level * 0.04);
              break;
            case "convertAmount":
              num =
                oper === "+"
                  ? MATH.random(7 + level * (10 / 20), 15 + level * (20 / 20)) |
                    0
                  : MATH.random(1.15, 1.4 + level * 0.04);
              break;
            case "maxEnergy":
              num = MATH.random(1.2, 1.5 + level * 0.04);
              break;
            case "abilityRate":
              num = MATH.random(1.05, 1.15 + level * 0.0175);
              break;
          }

          num = Number(num.toFixed(2));

          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.mutation =
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].mutation = {
              stat: stat,
              num: num,
              oper: oper,
            };

          player.addMessage(
            "☢️ " +
              MATH.doGrammar(
                player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
              ) +
              " got " +
              oper.replace("*", "x") +
              num +
              " " +
              MATH.doGrammar(stat.replace("max", "")).toLowerCase() +
              "! ☢️",
            [50, 225, 90],
          );
        }

        let addedBond = (amount * 100 * player.bondFromTreats) | 0;

        player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bond += addedBond;

        textRenderer.add(
          addedBond + "",
          [
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[0],
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[1] +
              1,
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[2],
          ],
          COLORS.bondArr,
          0,
          "+",
          1.5,
        );

        player.addMessage(
          MATH.doGrammar(
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
          ) + " Bee's bond improved",
          COLORS.bondArr,
        );
        player.addMessage(
          "by " + MATH.addCommas(addedBond + "") + "!",
          COLORS.bondArr,
        );

        player.updateHive();
      };
    },
  },

  neonberry: {
    canUseOnSlot: (slot) => {
      return slot.type !== null;
    },
    amount: 0,
    u: (128 * 7) / 2048,
    v: (128 * 7) / 2048,
    value: 16,
    use: function () {
      howManyToFeed.style.display = "block";
      feedAmount.value = 1;
      howManyMessage.innerHTML =
        "How many neonberries will you feed to " +
        MATH.doGrammar(
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
        ) +
        " Bee?";
      document.getElementById("feedUntilGifted").style.display = "none";

      // CHQ: Limit the amount of treats fed to what the player actually have in inventory.
      //      How: using constrain method of Math to set the feed amount to the lower of the
      //           amount the player specified and the amount that the user actually has
      howManyToFeed.onmousemove = feedAmount.oninput = function () {
        let a = feedAmount.value;
        feedAmount.value = MATH.constrain(a, 1, items.neonberry.amount);
      };

      document.getElementById("cancelFeeding").onclick = function () {
        howManyToFeed.style.display = "none";
      };

      document.getElementById("feedThisAmount").onclick = function () {
        howManyToFeed.style.display = "none";

        let amount = feedAmount.value;
        items.neonberry.amount -= amount;
        player.stats.neonberry += Number(amount);
        player.updateInventory();

        player.hive[player.hiveIndex[1]][player.hiveIndex[0]].radioactive =
          3 * 60 + (amount - 1) * 3;

        player.addMessage(
          "☢️ " +
            MATH.doGrammar(
              player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
            ) +
            " bee became radioactive for " +
            MATH.doTime(
              player.hive[player.hiveIndex[1]][player.hiveIndex[0]].radioactive,
            ) +
            " ☢️",
          [50, 225, 90],
        );

        let addedBond = (amount * 500 * player.bondFromTreats) | 0;

        player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bond += addedBond;

        textRenderer.add(
          addedBond + "",
          [
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[0],
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[1] +
              1,
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[2],
          ],
          COLORS.bondArr,
          0,
          "+",
          1.5,
        );

        player.addMessage(
          MATH.doGrammar(
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
          ) + " Bee's bond improved",
          COLORS.bondArr,
        );
        player.addMessage(
          "by " + MATH.addCommas(addedBond + "") + "!",
          COLORS.bondArr,
        );

        player.updateHive();
      };
    },
  },

  moonCharm: {
    canUseOnSlot: (slot) => {
      return slot.type !== null;
    },
    amount: 0,
    u: (128 * 7) / 2048,
    v: (128 * 12) / 2048,
    value: 10,
    use: function () {
      howManyToFeed.style.display = "block";
      feedAmount.value = 1;
      howManyMessage.innerHTML =
        "How many moon charms will you feed to " +
        MATH.doGrammar(
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
        ) +
        " Bee?";
      document.getElementById("feedUntilGifted").style.display = "none";

      // CHQ: Limit the amount of treats fed to what the player actually have in inventory.
      //      How: using constrain method of Math to set the feed amount to the lower of the
      //           amount the player specified and the amount that the user actually has
      howManyToFeed.onmousemove = feedAmount.oninput = function () {
        let a = feedAmount.value;
        feedAmount.value = MATH.constrain(a, 1, items.moonCharm.amount);
      };

      document.getElementById("cancelFeeding").onclick = function () {
        howManyToFeed.style.display = "none";
      };

      document.getElementById("feedThisAmount").onclick = function () {
        howManyToFeed.style.display = "none";

        let amount = feedAmount.value;
        items.moonCharm.amount -= amount;
        player.stats.moonCharm += Number(amount);
        player.updateInventory();

        let addedBond = (amount * 250 * player.bondFromTreats) | 0;

        player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bond += addedBond;

        textRenderer.add(
          addedBond + "",
          [
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[0],
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[1] +
              1,
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[2],
          ],
          COLORS.bondArr,
          0,
          "+",
          1.5,
        );

        player.addMessage(
          MATH.doGrammar(
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
          ) + " Bee's bond improved",
          COLORS.bondArr,
        );
        player.addMessage(
          "by " + MATH.addCommas(addedBond + "") + "!",
          COLORS.bondArr,
        );

        player.updateHive();
      };
    },
  },

  treat: {
    canUseOnSlot: (slot) => {
      return slot.type !== null;
    },
    amount: 0,
    u: 0,
    v: (128 * 4) / 2048,
    value: 1,
    use: function () {
      howManyToFeed.style.display = "block";
      feedAmount.value = 1;
      howManyMessage.innerHTML =
        "How many treats will you feed to " +
        MATH.doGrammar(
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
        ) +
        " Bee?";
      document.getElementById("feedUntilGifted").style.display = "none";

      // CHQ: Limit the amount of treats fed to what the player actually have in inventory.
      //      How: using constrain method of Math to set the feed amount to the lower of the
      //           amount the player specified and the amount that the user actually has
      howManyToFeed.onmousemove = feedAmount.oninput = function () {
        let a = feedAmount.value;
        feedAmount.value = MATH.constrain(a, 1, items.treat.amount);
      };

      document.getElementById("cancelFeeding").onclick = function () {
        howManyToFeed.style.display = "none";
      };

      document.getElementById("feedThisAmount").onclick = function () {
        howManyToFeed.style.display = "none";

        let amount = feedAmount.value;
        items.treat.amount -= amount;
        player.stats.treat += Number(amount);

        player.updateInventory();

        let addedBond = (amount * 10 * player.bondFromTreats) | 0;

        player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bond += addedBond;

        textRenderer.add(
          addedBond + "",
          [
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[0],
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[1] +
              1,
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[2],
          ],
          COLORS.bondArr,
          0,
          "+",
          1.5,
        );

        player.addMessage(
          MATH.doGrammar(
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
          ) + " Bee's bond improved",
          COLORS.bondArr,
        );
        player.addMessage(
          "by " + MATH.addCommas(addedBond + "") + "!",
          COLORS.bondArr,
        );

        player.updateHive();
      };
    },
  },

  starTreat: {
    canUseOnSlot: (slot) => {
      return slot.type !== null;
    },
    amount: 0,
    u: (128 * 1) / 2048,
    v: (128 * 13) / 2048,
    value: 500,
    use: function () {
      howManyToFeed.style.display = "block";
      feedAmount.value = 1;
      howManyMessage.innerHTML =
        "How many star treats will you feed to " +
        MATH.doGrammar(
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
        ) +
        " Bee?";
      document.getElementById("feedUntilGifted").style.display = "none";

      // CHQ: Limit the amount of treats fed to what the player actually have in inventory.
      //      How: using constrain method of Math to set the feed amount to the lower of the
      //           amount the player specified and the amount that the user actually has
      howManyToFeed.onmousemove = feedAmount.oninput = function () {
        let a = feedAmount.value;
        feedAmount.value = MATH.constrain(a, 1, items.starTreat.amount);
      };

      document.getElementById("cancelFeeding").onclick = function () {
        howManyToFeed.style.display = "none";
      };

      document.getElementById("feedThisAmount").onclick = function () {
        howManyToFeed.style.display = "none";

        let amount = feedAmount.value;
        items.starTreat.amount -= amount;
        player.stats.starTreat += Number(amount);
        player.updateInventory();

        let addedBond = (amount * 1000 * player.bondFromTreats) | 0;

        player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bond += addedBond;

        player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted = true;
        player.addMessage("⭐ The treat made the bee gifted! ⭐", COLORS.honey);

        textRenderer.add(
          addedBond + "",
          [
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[0],
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[1] +
              1,
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[2],
          ],
          COLORS.bondArr,
          0,
          "+",
          1.5,
        );

        player.addMessage(
          MATH.doGrammar(
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
          ) + " Bee's bond improved",
          COLORS.bondArr,
        );
        player.addMessage(
          "by " + MATH.addCommas(addedBond + "") + "!",
          COLORS.bondArr,
        );

        player.updateHive();
      };
    },
  },

  atomicTreat: {
    canUseOnSlot: (slot) => {
      return slot.type !== null;
    },
    amount: 0,
    u: (128 * 2) / 2048,
    v: (128 * 13) / 2048,
    value: 40,
    use: function () {
      howManyToFeed.style.display = "block";
      feedAmount.value = 1;
      howManyMessage.innerHTML =
        "How many atomic treats will you feed to " +
        MATH.doGrammar(
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
        ) +
        " Bee?";
      document.getElementById("feedUntilGifted").style.display = "none";

      // CHQ: Limit the amount of treats fed to what the player actually have in inventory.
      //      How: using constrain method of Math to set the feed amount to the lower of the
      //           amount the player specified and the amount that the user actually has
      howManyToFeed.onmousemove = feedAmount.oninput = function () {
        let a = feedAmount.value;
        feedAmount.value = MATH.constrain(a, 1, items.atomicTreat.amount);
      };

      document.getElementById("cancelFeeding").onclick = function () {
        howManyToFeed.style.display = "none";
      };

      document.getElementById("feedThisAmount").onclick = function () {
        howManyToFeed.style.display = "none";

        let amount = feedAmount.value;
        items.atomicTreat.amount -= amount;
        player.stats.atomicTreat += Number(amount);
        player.updateInventory();

        let addedBond = (amount * 1000 * player.bondFromTreats) | 0;

        player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bond += addedBond;

        player.addMessage(
          "☢️ " +
            MATH.doGrammar(
              player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
            ) +
            " bee gained a mutation! ☢️",
          [50, 225, 90],
        );

        let stat = [
            "abilityRate",
            "gatherAmount",
            "convertAmount",
            "maxEnergy",
            "attack",
            "gatherAmount",
            "convertAmount",
            "maxEnergy",
            "attack",
            "gatherAmount",
            "convertAmount",
            "maxEnergy",
            "attack",
            "gatherAmount",
            "convertAmount",
            "maxEnergy",
            "attack",
            "gatherAmount",
            "convertAmount",
            "maxEnergy",
            "attack",
            "gatherAmount",
            "convertAmount",
            "maxEnergy",
            "attack",
            "gatherAmount",
            "convertAmount",
            "maxEnergy",
            "attack",
            "gatherAmount",
            "convertAmount",
            "maxEnergy",
            "attack",
          ],
          oper,
          num,
          level =
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.level - 1;

        stat = stat[(Math.random() * stat.length) | 0];

        oper =
          stat === "attack" ||
          stat === "convertAmount" ||
          stat === "gatherAmount"
            ? Math.random() < 0.5
              ? "+"
              : "*"
            : "*";

        switch (stat) {
          case "attack":
            num =
              oper === "+"
                ? MATH.random(1 + level * (2 / 20), 3 + level * (4 / 20)) | 0
                : MATH.random(1.05, 1.35 + level * 0.02);
            break;
          case "gatherAmount":
            num =
              oper === "+"
                ? MATH.random(4 + level * (8 / 20), 10 + level * (16 / 20)) | 0
                : MATH.random(1.1, 1.3 + level * 0.04);
            break;
          case "convertAmount":
            num =
              oper === "+"
                ? MATH.random(7 + level * (10 / 20), 15 + level * (20 / 20)) | 0
                : MATH.random(1.15, 1.4 + level * 0.04);
            break;
          case "maxEnergy":
            num = MATH.random(1.2, 1.5 + level * 0.04);
            break;
          case "abilityRate":
            num = MATH.random(1.05, 1.15 + level * 0.0175);
            break;
        }

        num = Number(num.toFixed(2));

        player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.mutation =
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].mutation = {
            stat: stat,
            num: num,
            oper: oper,
          };

        player.addMessage(
          "☢️ " +
            MATH.doGrammar(
              player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
            ) +
            " got " +
            oper.replace("*", "x") +
            num +
            " " +
            MATH.doGrammar(stat.replace("max", "")).toLowerCase() +
            "! ☢️",
          [50, 225, 90],
        );

        textRenderer.add(
          addedBond + "",
          [
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[0],
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[1] +
              1,
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[2],
          ],
          COLORS.bondArr,
          0,
          "+",
          1.5,
        );

        player.addMessage(
          MATH.doGrammar(
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
          ) + " Bee's bond improved",
          COLORS.bondArr,
        );
        player.addMessage(
          "by " + MATH.addCommas(addedBond + "") + "!",
          COLORS.bondArr,
        );

        player.updateHive();
      };
    },
  },

  blueberry: {
    canUseOnSlot: (slot) => {
      return slot.type !== null;
    },
    amount: 0,
    u: 128 / 2048,
    v: (128 * 4) / 2048,
    value: 2,
    use: function () {
      howManyToFeed.style.display = "block";
      feedAmount.value = 1;
      howManyMessage.innerHTML =
        "How many blueberries will you feed to " +
        MATH.doGrammar(
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
        ) +
        " Bee?";

      document.getElementById("feedUntilGifted").style.display =
        beeInfo[player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type]
          .favoriteTreat === "blueberry" &&
        !player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted
          ? "block"
          : "none";

      // CHQ: Limit the amount of treats fed to what the player actually have in inventory.
      //      How: using constrain method of Math to set the feed amount to the lower of the
      //           amount the player specified and the amount that the user actually has
      howManyToFeed.onmousemove = feedAmount.oninput = function () {
        let a = feedAmount.value;
        feedAmount.value = MATH.constrain(a, 1, items.blueberry.amount);
      };

      document.getElementById("cancelFeeding").onclick = function () {
        howManyToFeed.style.display = "none";
      };

      let feed = function (amount) {
        howManyToFeed.style.display = "none";

        items.blueberry.amount -= amount;
        player.stats.blueberry += Number(amount);
        player.updateInventory();

        let isFavorite =
            beeInfo[
              player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type
            ].favoriteTreat === "blueberry",
          bondToAdd =
            (amount *
              25 *
              (isFavorite
                ? player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee
                    .type === "buoyant"
                  ? 3
                  : 2
                : 1) *
              player.bondFromTreats) |
            0;

        player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bond += bondToAdd;

        if (isFavorite)
          player.addMessage(
            MATH.doGrammar(
              player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
            ) + " Bee loves blueberries! ╰(*°▽°*)╯",
            COLORS.bondArr,
          );

        textRenderer.add(
          bondToAdd + "",
          [
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[0],
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[1] +
              1,
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[2],
          ],
          COLORS.bondArr,
          0,
          "+",
          1.5,
        );

        player.addMessage(
          MATH.doGrammar(
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
          ) + " Bee's bond improved",
          COLORS.bondArr,
        );
        player.addMessage(
          "by " + MATH.addCommas(bondToAdd + "") + "!",
          COLORS.bondArr,
        );

        player.updateHive();
      };

      document.getElementById("feedThisAmount").onclick = function () {
        feed(feedAmount.value);
      };

      document.getElementById("feedUntilGifted").onclick = function () {
        let am = MATH.simulateProbabilityTries(
          1 /
            (player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type ===
            "buoyant"
              ? 15000 / 1.15
              : 15000),
        );

        if (am < items.blueberry.amount) {
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted = true;
          player.addMessage(
            "After " + MATH.abvNumber(am + "") + " treats.....",
            COLORS.honey,
          );
          player.addMessage(
            "⭐ The treat made the bee gifted! ⭐",
            COLORS.honey,
          );
          feed(am);
        } else {
          player.addMessage(
            "The treat failed to make the bee gifted :(",
            COLORS.redArr,
          );
          feed(items.blueberry.amount);
        }
      };
    },
  },

  strawberry: {
    canUseOnSlot: (slot) => {
      return slot.type !== null;
    },
    amount: 0,
    u: (128 * 2) / 2048,
    v: (128 * 4) / 2048,
    value: 2,
    use: function () {
      howManyToFeed.style.display = "block";
      feedAmount.value = 1;
      howManyMessage.innerHTML =
        "How many strawberries will you feed to " +
        MATH.doGrammar(
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
        ) +
        " Bee?";

      document.getElementById("feedUntilGifted").style.display =
        beeInfo[player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type]
          .favoriteTreat === "strawberry" &&
        !player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted
          ? "block"
          : "none";

      // CHQ: Limit the amount of treats fed to what the player actually have in inventory.
      //      How: using constrain method of Math to set the feed amount to the lower of the
      //           amount the player specified and the amount that the user actually has
      howManyToFeed.onmousemove = feedAmount.oninput = function () {
        let a = feedAmount.value;
        feedAmount.value = MATH.constrain(a, 1, items.strawberry.amount);
      };

      document.getElementById("cancelFeeding").onclick = function () {
        howManyToFeed.style.display = "none";
      };

      let feed = function (amount) {
        howManyToFeed.style.display = "none";

        items.strawberry.amount -= amount;
        player.stats.strawberry += Number(amount);
        player.updateInventory();

        let isFavorite =
            beeInfo[
              player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type
            ].favoriteTreat === "strawberry",
          bondToAdd =
            (amount * 25 * (isFavorite ? 2 : 1) * player.bondFromTreats) | 0;

        player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bond += bondToAdd;

        if (isFavorite)
          player.addMessage(
            MATH.doGrammar(
              player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
            ) + " Bee loves strawberries! ╰(*°▽°*)╯",
            COLORS.bondArr,
          );

        textRenderer.add(
          bondToAdd + "",
          [
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[0],
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[1] +
              1,
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[2],
          ],
          COLORS.bondArr,
          0,
          "+",
          1.5,
        );

        player.addMessage(
          MATH.doGrammar(
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
          ) + " Bee's bond improved",
          COLORS.bondArr,
        );
        player.addMessage(
          "by " + MATH.addCommas(bondToAdd + "") + "!",
          COLORS.bondArr,
        );

        player.updateHive();
      };

      document.getElementById("feedThisAmount").onclick = function () {
        feed(feedAmount.value);
      };

      document.getElementById("feedUntilGifted").onclick = function () {
        let am = MATH.simulateProbabilityTries(1 / 15000);

        if (am < items.strawberry.amount) {
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted = true;
          player.addMessage(
            "After " + MATH.abvNumber(am + "") + " treats.....",
            COLORS.honey,
          );
          player.addMessage(
            "⭐ The treat made the bee gifted! ⭐",
            COLORS.honey,
          );
          feed(am);
        } else {
          player.addMessage(
            "The treat failed to make the bee gifted :(",
            COLORS.redArr,
          );
          feed(items.strawberry.amount);
        }
      };
    },
  },

  pineapple: {
    canUseOnSlot: (slot) => {
      return slot.type !== null;
    },
    amount: 0,
    u: (128 * 2) / 2048,
    v: (128 * 5) / 2048,
    value: 2,
    use: function () {
      howManyToFeed.style.display = "block";
      feedAmount.value = 1;
      howManyMessage.innerHTML =
        "How many pineapples will you feed to " +
        MATH.doGrammar(
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
        ) +
        " Bee?";

      document.getElementById("feedUntilGifted").style.display =
        beeInfo[player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type]
          .favoriteTreat === "pineapple" &&
        !player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted
          ? "block"
          : "none";

      // CHQ: Limit the amount of treats fed to what the player actually have in inventory.
      //      How: using constrain method of Math to set the feed amount to the lower of the
      //           amount the player specified and the amount that the user actually has
      howManyToFeed.onmousemove = feedAmount.oninput = function () {
        let a = feedAmount.value;
        feedAmount.value = MATH.constrain(a, 1, items.pineapple.amount);
      };

      document.getElementById("cancelFeeding").onclick = function () {
        howManyToFeed.style.display = "none";
      };

      let feed = function (amount) {
        howManyToFeed.style.display = "none";

        items.pineapple.amount -= amount;
        player.stats.pineapple += Number(amount);
        player.updateInventory();

        let isFavorite =
            beeInfo[
              player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type
            ].favoriteTreat === "pineapple",
          bondToAdd =
            (amount * 25 * (isFavorite ? 2 : 1) * player.bondFromTreats) | 0;

        player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bond += bondToAdd;

        if (isFavorite)
          player.addMessage(
            MATH.doGrammar(
              player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
            ) + " Bee loves pineapples! ╰(*°▽°*)╯",
            COLORS.bondArr,
          );

        textRenderer.add(
          bondToAdd + "",
          [
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[0],
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[1] +
              1,
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[2],
          ],
          COLORS.bondArr,
          0,
          "+",
          1.5,
        );

        player.addMessage(
          MATH.doGrammar(
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
          ) + " Bee's bond improved",
          COLORS.bondArr,
        );
        player.addMessage(
          "by " + MATH.addCommas(bondToAdd + "") + "!",
          COLORS.bondArr,
        );

        player.updateHive();
      };

      document.getElementById("feedThisAmount").onclick = function () {
        feed(feedAmount.value);
      };

      document.getElementById("feedUntilGifted").onclick = function () {
        let am = MATH.simulateProbabilityTries(1 / 15000);

        if (am < items.pineapple.amount) {
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted = true;
          player.addMessage(
            "After " + MATH.abvNumber(am + "") + " treats.....",
            COLORS.honey,
          );
          player.addMessage(
            "⭐ The treat made the bee gifted! ⭐",
            COLORS.honey,
          );
          feed(am);
        } else {
          player.addMessage(
            "The treat failed to make the bee gifted :(",
            COLORS.redArr,
          );
          feed(items.pineapple.amount);
        }
      };
    },
  },

  sunflowerSeed: {
    canUseOnSlot: (slot) => {
      return slot.type !== null;
    },
    amount: 0,
    u: (128 * 3) / 2048,
    v: (128 * 5) / 2048,
    value: 2,
    use: function () {
      howManyToFeed.style.display = "block";
      feedAmount.value = 1;
      howManyMessage.innerHTML =
        "How many sunflower seeds will you feed to " +
        MATH.doGrammar(
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
        ) +
        " Bee?";

      document.getElementById("feedUntilGifted").style.display =
        beeInfo[player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type]
          .favoriteTreat === "sunflowerSeed" &&
        !player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted
          ? "block"
          : "none";

      // CHQ: Limit the amount of treats fed to what the player actually have in inventory.
      //      How: using constrain method of Math to set the feed amount to the lower of the
      //           amount the player specified and the amount that the user actually has
      howManyToFeed.onmousemove = feedAmount.oninput = function () {
        let a = feedAmount.value;
        feedAmount.value = MATH.constrain(a, 1, items.sunflowerSeed.amount);
      };

      document.getElementById("cancelFeeding").onclick = function () {
        howManyToFeed.style.display = "none";
      };

      let feed = function (amount) {
        howManyToFeed.style.display = "none";

        items.sunflowerSeed.amount -= amount;
        player.stats.sunflowerSeed += Number(amount);
        player.updateInventory();

        let isFavorite =
            beeInfo[
              player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type
            ].favoriteTreat === "sunflowerSeed",
          bondToAdd =
            (amount * 25 * (isFavorite ? 2 : 1) * player.bondFromTreats) | 0;

        player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bond += bondToAdd;

        if (isFavorite)
          player.addMessage(
            MATH.doGrammar(
              player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
            ) + " Bee loves sunflower seeds! ╰(*°▽°*)╯",
            COLORS.bondArr,
          );

        textRenderer.add(
          bondToAdd + "",
          [
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[0],
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[1] +
              1,
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.pos[2],
          ],
          COLORS.bondArr,
          0,
          "+",
          1.5,
        );

        player.addMessage(
          MATH.doGrammar(
            player.hive[player.hiveIndex[1]][player.hiveIndex[0]].bee.type,
          ) + " Bee's bond improved",
          COLORS.bondArr,
        );
        player.addMessage(
          "by " + MATH.addCommas(bondToAdd + "") + "!",
          COLORS.bondArr,
        );

        player.updateHive();
      };

      document.getElementById("feedThisAmount").onclick = function () {
        feed(feedAmount.value);
      };

      document.getElementById("feedUntilGifted").onclick = function () {
        let am = MATH.simulateProbabilityTries(1 / 15000);

        if (am < items.sunflowerSeed.amount) {
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted = true;
          player.addMessage(
            "After " + MATH.abvNumber(am + "") + " treats.....",
            COLORS.honey,
          );
          player.addMessage(
            "⭐ The treat made the bee gifted! ⭐",
            COLORS.honey,
          );
          feed(am);
        } else {
          player.addMessage(
            "The treat failed to make the bee gifted :(",
            COLORS.redArr,
          );
          feed(items.sunflowerSeed.amount);
        }
      };
    },
  },

  basicEgg: {
    canUseOnSlot: (slot) => {
      return slot.type !== "basic";
    },
    amount: 0,
    u: (128 * 4) / 2048,
    v: (128 * 5) / 2048,
    value: 60,
    use: function () {
      items.basicEgg.amount--;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type = "basic";
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted =
        Math.random() < 1 / 100;

      for (let i in player.currentGear.beequips)
        if (
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip &&
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip.id ===
            player.currentGear.beequips[i].id
        )
          player.currentGear.beequips[i].bee = undefined;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip = undefined;

      player.beePopup = {
        type: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type,
        message: "You hatched a...",
        time: TIME,
        gifted: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted,
      };

      player.updateHive();
    },
  },

  silverEgg: {
    canUseOnSlot: (slot) => {
      return true;
    },
    amount: 0,
    u: (128 * 5) / 2048,
    v: (128 * 5) / 2048,
    value: 90,
    use: function () {
      let types = {
          mythic: 1 / 4000,
          legendary: 0.075 - 1 / 4000,
          epic: 0.325,
          rare: 0.6,
        },
        r = Math.random(),
        type,
        c = 0;

      for (let i in types) {
        if (r <= types[i] + c) {
          type = i;
          break;
        }

        c += types[i];
      }

      types = [];

      for (let i in beeInfo) {
        if (beeInfo[i].rarity === type) {
          types.push(i);
        }
      }

      type = types[(Math.random() * types.length) | 0];

      items.silverEgg.amount--;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type = type;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted =
        Math.random() < 1 / 100;

      for (let i in player.currentGear.beequips)
        if (
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip &&
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip.id ===
            player.currentGear.beequips[i].id
        )
          player.currentGear.beequips[i].bee = undefined;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip = undefined;

      player.beePopup = {
        type: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type,
        message: "You hatched a...",
        time: TIME,
        gifted: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted,
      };

      player.updateHive();
    },
  },

  goldEgg: {
    canUseOnSlot: (slot) => {
      return true;
    },
    amount: 0,
    u: (128 * 6) / 2048,
    v: (128 * 5) / 2048,
    value: 125,
    use: function () {
      let types = { mythic: 1 / 500, legendary: 0.3 - 1 / 500, epic: 0.7 },
        r = Math.random(),
        type,
        c = 0;

      for (let i in types) {
        if (r <= types[i] + c) {
          type = i;
          break;
        }

        c += types[i];
      }

      types = [];

      for (let i in beeInfo) {
        if (beeInfo[i].rarity === type) {
          types.push(i);
        }
      }

      type = types[(Math.random() * types.length) | 0];

      items.goldEgg.amount--;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type = type;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted =
        Math.random() < 1 / 100;

      for (let i in player.currentGear.beequips)
        if (
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip &&
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip.id ===
            player.currentGear.beequips[i].id
        )
          player.currentGear.beequips[i].bee = undefined;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip = undefined;

      player.beePopup = {
        type: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type,
        message: "You hatched a...",
        time: TIME,
        gifted: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted,
      };

      player.updateHive();
    },
  },

  diamondEgg: {
    canUseOnSlot: (slot) => {
      return true;
    },
    amount: 0,
    u: (128 * 7) / 2048,
    v: (128 * 5) / 2048,
    value: 200,
    use: function () {
      let types = { mythic: 0.05, legendary: 0.95 },
        r = Math.random(),
        type,
        c = 0;

      for (let i in types) {
        if (r <= types[i] + c) {
          type = i;
          break;
        }

        c += types[i];
      }

      types = [];

      for (let i in beeInfo) {
        if (beeInfo[i].rarity === type) {
          types.push(i);
        }
      }

      type = types[(Math.random() * types.length) | 0];

      items.diamondEgg.amount--;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type = type;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted =
        Math.random() < 1 / 100;

      for (let i in player.currentGear.beequips)
        if (
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip &&
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip.id ===
            player.currentGear.beequips[i].id
        )
          player.currentGear.beequips[i].bee = undefined;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip = undefined;

      player.beePopup = {
        type: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type,
        message: "You hatched a...",
        time: TIME,
        gifted: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted,
      };

      player.updateHive();
    },
  },

  mythicEgg: {
    canUseOnSlot: (slot) => {
      return true;
    },
    amount: 0,
    u: (128 * 0) / 2048,
    v: (128 * 6) / 2048,
    value: 250,
    use: function () {
      let types = [];

      for (let i in beeInfo) {
        if (beeInfo[i].rarity === "mythic") {
          types.push(i);
        }
      }

      type = types[(Math.random() * types.length) | 0];

      items.mythicEgg.amount--;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type = type;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted =
        Math.random() < 1 / 100;

      for (let i in player.currentGear.beequips)
        if (
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip &&
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip.id ===
            player.currentGear.beequips[i].id
        )
          player.currentGear.beequips[i].bee = undefined;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip = undefined;

      player.beePopup = {
        type: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type,
        message: "You hatched a...",
        time: TIME,
        gifted: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted,
      };

      player.updateHive();
    },
  },

  giftedSilverEgg: {
    canUseOnSlot: (slot) => {
      return true;
    },
    amount: 0,
    u: (128 * 5) / 2048,
    v: (128 * 8) / 2048,
    value: 150,
    use: function () {
      let types = {
          mythic: 1 / 4000,
          legendary: 0.075 - 1 / 4000,
          epic: 0.325,
          rare: 0.6,
        },
        r = Math.random(),
        type,
        c = 0;

      for (let i in types) {
        if (r <= types[i] + c) {
          type = i;
          break;
        }

        c += types[i];
      }

      types = [];

      for (let i in beeInfo) {
        if (beeInfo[i].rarity === type) {
          types.push(i);
        }
      }

      type = types[(Math.random() * types.length) | 0];

      items.giftedSilverEgg.amount--;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type = type;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted = true;

      for (let i in player.currentGear.beequips)
        if (
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip &&
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip.id ===
            player.currentGear.beequips[i].id
        )
          player.currentGear.beequips[i].bee = undefined;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip = undefined;

      player.beePopup = {
        type: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type,
        message: "You hatched a...",
        time: TIME,
        gifted: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted,
      };

      player.updateHive();
    },
  },

  giftedGoldEgg: {
    canUseOnSlot: (slot) => {
      return true;
    },
    amount: 0,
    u: (128 * 6) / 2048,
    v: (128 * 8) / 2048,
    value: 225,
    use: function () {
      let types = { mythic: 1 / 500, legendary: 0.3 - 1 / 500, epic: 0.7 },
        r = Math.random(),
        type,
        c = 0;

      for (let i in types) {
        if (r <= types[i] + c) {
          type = i;
          break;
        }

        c += types[i];
      }

      types = [];

      for (let i in beeInfo) {
        if (beeInfo[i].rarity === type) {
          types.push(i);
        }
      }

      type = types[(Math.random() * types.length) | 0];

      items.giftedGoldEgg.amount--;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type = type;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted = true;

      for (let i in player.currentGear.beequips)
        if (
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip &&
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip.id ===
            player.currentGear.beequips[i].id
        )
          player.currentGear.beequips[i].bee = undefined;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip = undefined;

      player.beePopup = {
        type: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type,
        message: "You hatched a...",
        time: TIME,
        gifted: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted,
      };

      player.updateHive();
    },
  },

  giftedDiamondEgg: {
    canUseOnSlot: (slot) => {
      return true;
    },
    amount: 0,
    u: (128 * 7) / 2048,
    v: (128 * 8) / 2048,
    value: 300,
    use: function () {
      let types = { mythic: 0.05, legendary: 0.95 },
        r = Math.random(),
        type,
        c = 0;

      for (let i in types) {
        if (r <= types[i] + c) {
          type = i;
          break;
        }

        c += types[i];
      }

      types = [];

      for (let i in beeInfo) {
        if (beeInfo[i].rarity === type) {
          types.push(i);
        }
      }

      type = types[(Math.random() * types.length) | 0];

      items.giftedDiamondEgg.amount--;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type = type;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted = true;

      for (let i in player.currentGear.beequips)
        if (
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip &&
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip.id ===
            player.currentGear.beequips[i].id
        )
          player.currentGear.beequips[i].bee = undefined;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip = undefined;

      player.beePopup = {
        type: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type,
        message: "You hatched a...",
        time: TIME,
        gifted: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted,
      };

      player.updateHive();
    },
  },

  giftedMythicEgg: {
    canUseOnSlot: (slot) => {
      return true;
    },
    amount: 0,
    u: (128 * 0) / 2048,
    v: (128 * 9) / 2048,
    value: 375,
    use: function () {
      let types = [];

      for (let i in beeInfo) {
        if (beeInfo[i].rarity === "mythic") {
          types.push(i);
        }
      }

      type = types[(Math.random() * types.length) | 0];

      items.giftedMythicEgg.amount--;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type = type;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted = true;

      for (let i in player.currentGear.beequips)
        if (
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip &&
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip.id ===
            player.currentGear.beequips[i].id
        )
          player.currentGear.beequips[i].bee = undefined;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip = undefined;

      player.beePopup = {
        type: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type,
        message: "You hatched a...",
        time: TIME,
        gifted: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted,
      };

      player.updateHive();
    },
  },

  starEgg: {
    canUseOnSlot: (slot) => {
      return true;
    },
    amount: 0,
    u: (128 * 1) / 2048,
    v: (128 * 9) / 2048,
    value: 350,
    use: function () {
      let types = [],
        alreadyGot = [];

      for (let i in objects.bees) {
        if (objects.bees[i].gifted) {
          alreadyGot.push(objects.bees[i].type);
        }
      }

      for (let i in beeInfo) {
        if (alreadyGot.indexOf(i) < 0) {
          types.push(i);
        }
      }

      type = types[(Math.random() * types.length) | 0];

      items.starEgg.amount--;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type = type;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted = true;

      for (let i in player.currentGear.beequips)
        if (
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip &&
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip &&
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip.id ===
            player.currentGear.beequips[i].id
        )
          player.currentGear.beequips[i].bee = undefined;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip = undefined;

      player.beePopup = {
        type: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type,
        message: "You hatched a...",
        time: TIME,
        gifted: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted,
      };

      player.updateHive();
    },
  },

  royalJelly: {
    canUseOnSlot: (slot) => {
      return slot.type;
    },
    amount: 0,
    u: (128 * 3) / 2048,
    v: (128 * 8) / 2048,
    value: 10,
    use: function () {
      for (let i in player.currentGear.beequips)
        if (
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip &&
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip.id ===
            player.currentGear.beequips[i].id
        )
          player.currentGear.beequips[i].bee = undefined;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip = undefined;

      let max = 250000;

      while (max-- >= 0 && items.royalJelly.amount-- > 0) {
        let types = {
            mythic: 1 / 4000,
            legendary: 0.075 - 1 / 4000,
            epic: 0.325,
            rare: 0.6,
          },
          r = Math.random(),
          type,
          c = 0;

        for (let i in types) {
          if (r <= types[i] + c) {
            type = i;
            break;
          }

          c += types[i];
        }

        types = [];

        for (let i in beeInfo) {
          if (beeInfo[i].rarity === type) {
            types.push(i);
          }
        }

        type = types[(Math.random() * types.length) | 0];

        player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type = type;
        player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted =
          Math.random() < 1 / 100;

        if (
          ["rare", "epic", "legendary", "mythic"].indexOf(
            beeInfo[type].rarity,
          ) >=
          ["rare", "epic", "legendary", "mythic"].indexOf(
            player.autoRJSettings.until,
          )
        ) {
          if (
            (player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted &&
              player.autoRJSettings.gifted) ||
            !player.autoRJSettings.gifted
          ) {
            break;
          }
        }
      }

      if (250000 - max > 1)
        player.addMessage(
          "After using " + MATH.addCommas(250000 - max + "") + " jellies...",
        );

      player.stats.royalJelly += 250000 - max;
      player.beePopup = {
        type: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type,
        message: "You got a...",
        time: TIME,
        gifted: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted,
      };

      player.updateInventory();
      player.updateHive();
    },
  },

  starJelly: {
    canUseOnSlot: (slot) => {
      return slot.type;
    },
    amount: 0,
    u: (128 * 4) / 2048,
    v: (128 * 8) / 2048,
    value: 90,
    use: function () {
      for (let i in player.currentGear.beequips)
        if (
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip &&
          player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip.id ===
            player.currentGear.beequips[i].id
        )
          player.currentGear.beequips[i].bee = undefined;
      player.hive[player.hiveIndex[1]][player.hiveIndex[0]].beequip = undefined;

      let max = 250000;

      while (max-- >= 0 && items.starJelly.amount-- >= 0) {
        let types = {
            mythic: 1 / 4000,
            legendary: 0.075 - 1 / 4000,
            epic: 0.325,
            rare: 0.6,
          },
          r = Math.random(),
          type,
          c = 0;

        for (let i in types) {
          if (r <= types[i] + c) {
            type = i;
            break;
          }

          c += types[i];
        }

        types = [];

        for (let i in beeInfo) {
          if (beeInfo[i].rarity === type) {
            types.push(i);
          }
        }

        type = types[(Math.random() * types.length) | 0];

        player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type = type;
        player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted = true;

        if (
          ["rare", "epic", "legendary", "mythic"].indexOf(
            beeInfo[type].rarity,
          ) >=
          ["rare", "epic", "legendary", "mythic"].indexOf(
            player.autoRJSettings.until,
          )
        ) {
          break;
        }
      }

      if (250000 - max > 1)
        player.addMessage(
          "After using " + MATH.addCommas(250000 - max + "") + " jellies...",
        );

      player.stats.starJelly += 250000 - max;
      player.beePopup = {
        type: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type,
        message: "You got a...",
        time: TIME,
        gifted: player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted,
      };

      player.updateInventory();
      player.updateHive();
    },
  },

  glitter: {
    amount: 0,
    u: 0,
    v: (128 * 7) / 2048,
    value: 25,
    cooldown: 15.1 * 60,
    use: function () {
      if (player.fieldIn) {
        if (player.fieldIn === "AntField") {
          player.addMessage(
            "You can' use this item in the Ant Field!",
            COLORS.redArr,
          );
          return;
        }

        let f = player.fieldIn;
        f = f[0].toLowerCase() + f.substring(1, f.length);
        player.addEffect(f + "Boost");
        player.addMessage('Activated "' + MATH.doGrammar(f) + ' Boost"');
        items.glitter.amount--;

        for (let i in objects.planters) {
          if (
            objects.planters[i].field === player.fieldIn &&
            !objects.planters[i].glistering
          ) {
            objects.planters[i].growthRate *= 1.25;
            objects.planters[i].glistering = true;
          }
        }
      } else {
        player.addMessage(
          "You must be standing in a field to use glitter!",
          COLORS.redArr,
        );
      }
    },
  },
};
