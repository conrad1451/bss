// data/effects.js

// CHQ: Claude AI (Sonnet) refactored: removed every bare-global read
// (player, objects, fieldInfo, TIME, textRenderer, COLORS, MATH, effects, dt, items,
// flowers, updateFlower, collectPollen and ~25 entity classes) that this file
// used to close over as if it still lived inside one giant top-level script
// (see stubbedOldIndex.js for what that looked like).
//
// Conventions applied, matching the rest of the already-refactored engine
// (FieldManager.js, RoboChallengeManager.js, AntChallengeManager.js):
//
//   - `update(amount, player)` keeps its existing signature since every `update`
//     in this file only ever touched `player`, so no gameState is needed there.
//   - `func(params)` -> `func(params, gameState)`. Every call site that
//     invokes an ability token's `.func(...)` (wherever tokens are collected)
//     must be updated to pass gameState as the second argument.
//   - `activate()` -> `activate(gameState)`. Every call site that ticks a
//     passive effect (the passive-effect trigger checker) must be updated
//     to pass gameState.
//   - `player`, `objects`, `fieldInfo`, `textRenderer` are destructured off
//     `gameState` at the top of each func/activate body that needs them,
//     instead of being read as bare identifiers.
//   - `TIME` -> `gameState.TIME`.
//   - `items` -> `gameState.items` (mirrors AntChallengeManager/RoboChallengeManager,
//     which already receive `items` as an explicit param rather than a global).
//   - `MATH` is imported from utils/MathHelper.js.

//   - `COLORS` is imported from a new data/colors.js (doesn't exist yet in
//     the current codebase — the values used here are lifted verbatim from
//     the COLORS object literal in stubbedOldIndex.js). If day/night tinting
//     ever needs COLORS to vary at runtime, move it to gameState.COLORS instead.
//   - Every entity class previously referenced as a bare global (Flame,
//     Bubble, Explosion, ReverseExplosion, Token, LootToken, DupedToken,
//     Mark, Triangulate, Frog, TempBee, FuzzBomb, GummyBall, PopStar,
//     ScorchingStar, GummyStar, Cloud, Tornado, Pulse, GlitchEffect, Spike,
//     FetchBall, PetalShuriken, Beam, StarShower, StarSaw, GuidingStar,
//     Coconut, DrainingDiamond, Scratch, ParticleRenderer) is now a real
//     import.
//
//   - `updateFlower(...)` doesn't exist anywhere in the current codebase —
//     the field model moved from a per-cell (x,z) flower grid to
//     FieldManager's pooled currentPollen + flat flowers[fieldId] array
//     (see FieldManager.js / collectPollen.js's own file-level TODOs on this
//     exact gap). Every call site that used updateFlower here is replaced
//     with a call to a new FieldManager method that needs to be *added*
//     (stubbed below with a CHQ TODO at each call site) since the old
//     per-cell goo/pollination logic has no equivalent yet.
//   - `collectPollen(params)` -> `collectPollen(params, gameState)`, matching
//     collectPollen.js's actual current signature.

import { MATH } from "../utils/MathHelper.js";
import { COLORS } from "./colors.js";
import { collectPollen } from "../engine/collectPollen.js";

import { Balloon } from "../entities/miscEntities/Balloon.js";
import { Flame } from "../entities/mobs/Flame.js";
import { Bubble } from "../entities/miscEntities/Bubble.js";
import { Explosion } from "../entities/fx/Explosion.js";
import { ReverseExplosion } from "../entities/miscEntities/ReverseExplosion.js";
import { Token } from "../entities/tokens.js";
import { LootToken } from "../entities/tokens.js";
import { DupedToken } from "../entities/miscEntities/DupedToken.js";
import { Mark } from "../entities/miscEntities/Mark.js";
import { Triangulate } from "../entities/beeAbilityProjectiles/Triangulate.js";
// import { Frog } from "../entities/miscEntities/Frog.js";  // CHQ: must refactor file first
import { TempBee } from "../entities/bees.js";
import { FuzzBomb } from "../entities/beeAbilityProjectiles/FuzzBomb.js";
// import { GummyBall } from "../entities/items/GummyBall.js"; // CHQ: must refactor file first
// import { PopStar } from "../entities/stars/PopStar.js"; // CHQ: must refactor file first
// import { ScorchingStar } from "../entities/stars/ScorchingStar.js"; // CHQ: must refactor file first
// import { GummyStar } from "../entities/stars/GummyStar.js"; // CHQ: must refactor file first
// import { Cloud } from "../entities/world/Cloud.js"; // CHQ: must refactor file first
// import { Tornado } from "../entities/mobs/Tornado.js"; // CHQ: must refactor file first
// import { Pulse } from "../entities/beeAbilityProjectiles/Pulse.js"; // CHQ: must refactor file first
// import { GlitchEffect } from "../entities/mobs/GlitchEffect.js"; // CHQ: must refactor file first
// import { Spike } from "../entities/beeAbilityProjectiles/Spike.js"; // CHQ: must refactor file first
// import { FetchBall } from "../entities/items/FetchBall.js"; // CHQ: must refactor file first
// import { PetalShuriken } from "../entities/projectiles/PetalShuriken.js"; // CHQ: must refactor file first
// import { Beam } from "../entities/beeAbilityProjectiles/Beam.js"; // CHQ: must refactor file first
// import { StarShower } from "../entities/stars/StarShower.js";  // CHQ: must refactor file first
// import { StarSaw } from "../entities/stars/StarSaw.js";  // CHQ: must refactor file first
// import { GuidingStar } from "../entities/stars/GuidingStar.js"; // CHQ: must refactor file first
// import { Coconut } from "../entities/items/Coconut.js"; // CHQ: must refactor file first
// import { DrainingDiamond } from "../entities/mobs/DrainingDiamond.js"; // CHQ: must refactor file first
// import { Scratch } from "../entities/mobs/Scratch.js";  // CHQ: must refactor file first
import { ParticleRenderer } from "../engine/particles.js";

export const effectsConfig = {
  scienceEnhancement: {
    u: 0,
    v: 0,
    maxCooldown: Infinity,
    maxAmount: 1000,
    tokenLife: 16,

    update: (amount, player) => {
      player.convertRate *= amount * 0.1 + 1;
    },

    getMessage: (amount) => {
      return "Science Enhancement\nx" + (amount * 0.1 + 1) + " convert rate";
    },
  },

  polarPower: {
    u: 0,
    v: 0,
    maxCooldown: Infinity,
    maxAmount: Infinity,
    tokenLife: 16,

    update: (amount, player) => {
      player.beeEnergy *= amount * 0.05 + 1;
    },

    getMessage: (amount) => {
      return "Polar Power\nx" + (amount * 0.05 + 1) + " bee energy";
    },
  },

  // CHQ: the fieldXBoost / fieldXWinds effects below are all pure `update`
  // functions that only ever touch `player` — no change needed, kept as-is.

  dandelionFieldBoost: {
    u: 0,
    v: 0,
    maxCooldown: 15 * 60,
    maxAmount: 4,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "DandelionField") {
        player.redPollen *= amount * 0.75 + 1;
        player.whitePollen *= amount * 0.75 + 1;
        player.bluePollen *= amount * 0.75 + 1;
      }
    },
    getMessage: (amount) =>
      "Dandelion Field Boost\nx" +
      (amount * 0.75 + 1) +
      " pollen in dandelion field",
  },

  sunflowerFieldBoost: {
    u: 0,
    v: 0,
    maxCooldown: 15 * 60,
    maxAmount: 4,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "SunflowerField") {
        player.redPollen *= amount * 0.75 + 1;
        player.whitePollen *= amount * 0.75 + 1;
        player.bluePollen *= amount * 0.75 + 1;
      }
    },
    getMessage: (amount) =>
      "Sunflower Field Boost\nx" +
      (amount * 0.75 + 1) +
      " pollen in sunflower field",
  },

  blueFlowerFieldBoost: {
    u: 0,
    v: 0,
    maxCooldown: 15 * 60,
    maxAmount: 4,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "BlueFlowerField") {
        player.redPollen *= amount * 0.75 + 1;
        player.whitePollen *= amount * 0.75 + 1;
        player.bluePollen *= amount * 0.75 + 1;
      }
    },
    getMessage: (amount) =>
      "Blue Flower Field Boost\nx" +
      (amount * 0.75 + 1) +
      " pollen in blue flower field",
  },

  mushroomFieldBoost: {
    u: 0,
    v: 0,
    maxCooldown: 15 * 60,
    maxAmount: 4,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "MushroomField") {
        player.redPollen *= amount * 0.75 + 1;
        player.whitePollen *= amount * 0.75 + 1;
        player.bluePollen *= amount * 0.75 + 1;
      }
    },
    getMessage: (amount) =>
      "Mushroom Field Boost\nx" +
      (amount * 0.75 + 1) +
      " pollen in mushroom field",
  },

  cloverFieldBoost: {
    u: 0,
    v: 0,
    maxCooldown: 15 * 60,
    maxAmount: 4,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "CloverField") {
        player.redPollen *= amount * 0.75 + 1;
        player.whitePollen *= amount * 0.75 + 1;
        player.bluePollen *= amount * 0.75 + 1;
      }
    },
    getMessage: (amount) =>
      "Clover Field Boost\nx" + (amount * 0.75 + 1) + " pollen in clover field",
  },

  strawberryFieldBoost: {
    u: 0,
    v: 0,
    maxCooldown: 15 * 60,
    maxAmount: 4,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "StrawberryField") {
        player.redPollen *= amount * 0.75 + 1;
        player.whitePollen *= amount * 0.75 + 1;
        player.bluePollen *= amount * 0.75 + 1;
      }
    },
    getMessage: (amount) =>
      "Strawberry Field Boost\nx" +
      (amount * 0.75 + 1) +
      " pollen in strawberry field",
  },

  spiderFieldBoost: {
    u: 0,
    v: 0,
    maxCooldown: 15 * 60,
    maxAmount: 4,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "SpiderField") {
        player.redPollen *= amount * 0.75 + 1;
        player.whitePollen *= amount * 0.75 + 1;
        player.bluePollen *= amount * 0.75 + 1;
      }
    },
    getMessage: (amount) =>
      "Spider Field Boost\nx" + (amount * 0.75 + 1) + " pollen in spider field",
  },

  bambooFieldBoost: {
    u: 0,
    v: 0,
    maxCooldown: 15 * 60,
    maxAmount: 4,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "BambooField") {
        player.redPollen *= amount * 0.75 + 1;
        player.whitePollen *= amount * 0.75 + 1;
        player.bluePollen *= amount * 0.75 + 1;
      }
    },
    getMessage: (amount) =>
      "Bamboo Field Boost\nx" + (amount * 0.75 + 1) + " pollen in bamboo field",
  },

  pineapplePatchBoost: {
    u: 0,
    v: 0,
    maxCooldown: 15 * 60,
    maxAmount: 4,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "PineapplePatch") {
        player.redPollen *= amount * 0.75 + 1;
        player.whitePollen *= amount * 0.75 + 1;
        player.bluePollen *= amount * 0.75 + 1;
      }
    },
    getMessage: (amount) =>
      "Pineapple Patch Boost\nx" +
      (amount * 0.75 + 1) +
      " pollen in pineapple patch",
  },

  stumpFieldBoost: {
    u: 0,
    v: 0,
    maxCooldown: 15 * 60,
    maxAmount: 4,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "StumpField") {
        player.redPollen *= amount * 0.75 + 1;
        player.whitePollen *= amount * 0.75 + 1;
        player.bluePollen *= amount * 0.75 + 1;
      }
    },
    getMessage: (amount) =>
      "Stump Field Boost\nx" + (amount * 0.75 + 1) + " pollen in stump field",
  },

  cactusFieldBoost: {
    u: 0,
    v: 0,
    maxCooldown: 15 * 60,
    maxAmount: 4,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "CactusField") {
        player.redPollen *= amount * 0.75 + 1;
        player.whitePollen *= amount * 0.75 + 1;
        player.bluePollen *= amount * 0.75 + 1;
      }
    },
    getMessage: (amount) =>
      "Cactus Field Boost\nx" + (amount * 0.75 + 1) + " pollen in cactus field",
  },

  pumpkinPatchBoost: {
    u: 0,
    v: 0,
    maxCooldown: 15 * 60,
    maxAmount: 4,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "PumpkinPatch") {
        player.redPollen *= amount * 0.75 + 1;
        player.whitePollen *= amount * 0.75 + 1;
        player.bluePollen *= amount * 0.75 + 1;
      }
    },
    getMessage: (amount) =>
      "Pumpkin Patch Boost\nx" +
      (amount * 0.75 + 1) +
      " pollen in pumpkin patch",
  },

  pineTreeForestBoost: {
    u: 0,
    v: 0,
    maxCooldown: 15 * 60,
    maxAmount: 4,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "PineTreeForest") {
        player.redPollen *= amount * 0.75 + 1;
        player.whitePollen *= amount * 0.75 + 1;
        player.bluePollen *= amount * 0.75 + 1;
      }
    },
    getMessage: (amount) =>
      "Pine Tree Forest Boost\nx" +
      (amount * 0.75 + 1) +
      " pollen in pine tree forest",
  },

  roseFieldBoost: {
    u: 0,
    v: 0,
    maxCooldown: 15 * 60,
    maxAmount: 4,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "RoseField") {
        player.redPollen *= amount * 0.75 + 1;
        player.whitePollen *= amount * 0.75 + 1;
        player.bluePollen *= amount * 0.75 + 1;
      }
    },
    getMessage: (amount) =>
      "Rose Field Boost\nx" + (amount * 0.75 + 1) + " pollen in rose field",
  },

  mountainTopFieldBoost: {
    u: 0,
    v: 0,
    maxCooldown: 15 * 60,
    maxAmount: 4,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "MountainTopField") {
        player.redPollen *= amount * 0.75 + 1;
        player.whitePollen *= amount * 0.75 + 1;
        player.bluePollen *= amount * 0.75 + 1;
      }
    },
    getMessage: (amount) =>
      "Mountain Top Field Boost\nx" +
      (amount * 0.75 + 1) +
      " pollen in mountain top field",
  },

  coconutFieldBoost: {
    u: 0,
    v: 0,
    maxCooldown: 15 * 60,
    maxAmount: 4,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "CoconutField") {
        player.redPollen *= amount * 0.75 + 1;
        player.whitePollen *= amount * 0.75 + 1;
        player.bluePollen *= amount * 0.75 + 1;
      }
    },
    getMessage: (amount) =>
      "Coconut Field Boost\nx" +
      (amount * 0.75 + 1) +
      " pollen in coconut field",
  },

  pepperPatchBoost: {
    u: 0,
    v: 0,
    maxCooldown: 15 * 60,
    maxAmount: 4,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "PepperPatch") {
        player.redPollen *= amount * 0.75 + 1;
        player.whitePollen *= amount * 0.75 + 1;
        player.bluePollen *= amount * 0.75 + 1;
      }
    },
    getMessage: (amount) =>
      "Pepper Patch Boost\nx" + (amount * 0.75 + 1) + " pollen in pepper patch",
  },

  dandelionFieldWinds: {
    u: (128 * 6) / 2048,
    v: (128 * 6) / 2048,
    maxCooldown: 30 * 60,
    maxAmount: 15,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "DandelionField") {
        player.redPollen *= (amount - 1) * 0.03 + 1.15;
        player.whitePollen *= (amount - 1) * 0.03 + 1.15;
        player.bluePollen *= (amount - 1) * 0.03 + 1.15;
        player.instantRedConversion = MATH.applyPercentage(
          player.instantRedConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantBlueConversion = MATH.applyPercentage(
          player.instantBlueConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantWhiteConversion = MATH.applyPercentage(
          player.instantWhiteConversion,
          (amount - 1) * 0.05 + 0.1,
        );
      }
    },
    getMessage: (amount) =>
      "Dandelion Field Winds\nx" +
      ((amount - 1) * 0.03 + 1.15).toFixed(2) +
      " pollen in dandelion field" +
      "\n+" +
      ((amount - 1) * 5 + 1) +
      "% instant conversion in dandelion field",
  },

  sunflowerFieldWinds: {
    u: (128 * 6) / 2048,
    v: (128 * 6) / 2048,
    maxCooldown: 30 * 60,
    maxAmount: 15,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "SunflowerField") {
        player.redPollen *= (amount - 1) * 0.03 + 1.15;
        player.whitePollen *= (amount - 1) * 0.03 + 1.15;
        player.bluePollen *= (amount - 1) * 0.03 + 1.15;
        player.instantRedConversion = MATH.applyPercentage(
          player.instantRedConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantBlueConversion = MATH.applyPercentage(
          player.instantBlueConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantWhiteConversion = MATH.applyPercentage(
          player.instantWhiteConversion,
          (amount - 1) * 0.05 + 0.1,
        );
      }
    },
    getMessage: (amount) =>
      "Sunflower Field Winds\nx" +
      ((amount - 1) * 0.03 + 1.15).toFixed(2) +
      " pollen in sunflower field" +
      "\n+" +
      ((amount - 1) * 5 + 1) +
      "% instant conversion in sunflower field",
  },

  blueFlowerFieldWinds: {
    u: (128 * 6) / 2048,
    v: (128 * 6) / 2048,
    maxCooldown: 30 * 60,
    maxAmount: 15,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "BlueFlowerField") {
        player.redPollen *= (amount - 1) * 0.03 + 1.15;
        player.whitePollen *= (amount - 1) * 0.03 + 1.15;
        player.bluePollen *= (amount - 1) * 0.03 + 1.15;
        player.instantRedConversion = MATH.applyPercentage(
          player.instantRedConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantBlueConversion = MATH.applyPercentage(
          player.instantBlueConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantWhiteConversion = MATH.applyPercentage(
          player.instantWhiteConversion,
          (amount - 1) * 0.05 + 0.1,
        );
      }
    },
    getMessage: (amount) =>
      "Blue Flower Field Winds\nx" +
      ((amount - 1) * 0.03 + 1.15).toFixed(2) +
      " pollen in blue flower field" +
      "\n+" +
      ((amount - 1) * 5 + 1) +
      "% instant conversion in blue flower field",
  },

  mushroomFieldWinds: {
    u: (128 * 6) / 2048,
    v: (128 * 6) / 2048,
    maxCooldown: 30 * 60,
    maxAmount: 15,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "MushroomField") {
        player.redPollen *= (amount - 1) * 0.03 + 1.15;
        player.whitePollen *= (amount - 1) * 0.03 + 1.15;
        player.bluePollen *= (amount - 1) * 0.03 + 1.15;
        player.instantRedConversion = MATH.applyPercentage(
          player.instantRedConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantBlueConversion = MATH.applyPercentage(
          player.instantBlueConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantWhiteConversion = MATH.applyPercentage(
          player.instantWhiteConversion,
          (amount - 1) * 0.05 + 0.1,
        );
      }
    },
    getMessage: (amount) =>
      "Mushroom Field Winds\nx" +
      ((amount - 1) * 0.03 + 1.15).toFixed(2) +
      " pollen in mushroom field" +
      "\n+" +
      ((amount - 1) * 5 + 1) +
      "% instant conversion in mushroom field",
  },

  cloverFieldWinds: {
    u: (128 * 6) / 2048,
    v: (128 * 6) / 2048,
    maxCooldown: 30 * 60,
    maxAmount: 15,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "CloverField") {
        player.redPollen *= (amount - 1) * 0.03 + 1.15;
        player.whitePollen *= (amount - 1) * 0.03 + 1.15;
        player.bluePollen *= (amount - 1) * 0.03 + 1.15;
        player.instantRedConversion = MATH.applyPercentage(
          player.instantRedConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantBlueConversion = MATH.applyPercentage(
          player.instantBlueConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantWhiteConversion = MATH.applyPercentage(
          player.instantWhiteConversion,
          (amount - 1) * 0.05 + 0.1,
        );
      }
    },
    getMessage: (amount) =>
      "Clover Field Winds\nx" +
      ((amount - 1) * 0.03 + 1.15).toFixed(2) +
      " pollen in clover field" +
      "\n+" +
      ((amount - 1) * 5 + 1) +
      "% instant conversion in clover field",
  },

  strawberryFieldWinds: {
    u: (128 * 6) / 2048,
    v: (128 * 6) / 2048,
    maxCooldown: 30 * 60,
    maxAmount: 15,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "StrawberryField") {
        player.redPollen *= (amount - 1) * 0.03 + 1.15;
        player.whitePollen *= (amount - 1) * 0.03 + 1.15;
        player.bluePollen *= (amount - 1) * 0.03 + 1.15;
        player.instantRedConversion = MATH.applyPercentage(
          player.instantRedConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantBlueConversion = MATH.applyPercentage(
          player.instantBlueConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantWhiteConversion = MATH.applyPercentage(
          player.instantWhiteConversion,
          (amount - 1) * 0.05 + 0.1,
        );
      }
    },
    getMessage: (amount) =>
      "Strawberry Field Winds\nx" +
      ((amount - 1) * 0.03 + 1.15).toFixed(2) +
      " pollen in strawberry field" +
      "\n+" +
      ((amount - 1) * 5 + 1) +
      "% instant conversion in strawberry field",
  },

  spiderFieldWinds: {
    u: (128 * 6) / 2048,
    v: (128 * 6) / 2048,
    maxCooldown: 30 * 60,
    maxAmount: 15,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "SpiderField") {
        player.redPollen *= (amount - 1) * 0.03 + 1.15;
        player.whitePollen *= (amount - 1) * 0.03 + 1.15;
        player.bluePollen *= (amount - 1) * 0.03 + 1.15;
        player.instantRedConversion = MATH.applyPercentage(
          player.instantRedConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantBlueConversion = MATH.applyPercentage(
          player.instantBlueConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantWhiteConversion = MATH.applyPercentage(
          player.instantWhiteConversion,
          (amount - 1) * 0.05 + 0.1,
        );
      }
    },
    getMessage: (amount) =>
      "Spider Field Winds\nx" +
      ((amount - 1) * 0.03 + 1.15).toFixed(2) +
      " pollen in spider field" +
      "\n+" +
      ((amount - 1) * 5 + 1) +
      "% instant conversion in spider field",
  },

  bambooFieldWinds: {
    u: (128 * 6) / 2048,
    v: (128 * 6) / 2048,
    maxCooldown: 30 * 60,
    maxAmount: 15,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "BambooField") {
        player.redPollen *= (amount - 1) * 0.03 + 1.15;
        player.whitePollen *= (amount - 1) * 0.03 + 1.15;
        player.bluePollen *= (amount - 1) * 0.03 + 1.15;
        player.instantRedConversion = MATH.applyPercentage(
          player.instantRedConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantBlueConversion = MATH.applyPercentage(
          player.instantBlueConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantWhiteConversion = MATH.applyPercentage(
          player.instantWhiteConversion,
          (amount - 1) * 0.05 + 0.1,
        );
      }
    },
    getMessage: (amount) =>
      "Bamboo Field Winds\nx" +
      ((amount - 1) * 0.03 + 1.15).toFixed(2) +
      " pollen in bamboo field" +
      "\n+" +
      ((amount - 1) * 5 + 1) +
      "% instant conversion in bamboo field",
  },

  pineapplePatchWinds: {
    u: (128 * 6) / 2048,
    v: (128 * 6) / 2048,
    maxCooldown: 30 * 60,
    maxAmount: 15,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "PineapplePatch") {
        player.redPollen *= (amount - 1) * 0.03 + 1.15;
        player.whitePollen *= (amount - 1) * 0.03 + 1.15;
        player.bluePollen *= (amount - 1) * 0.03 + 1.15;
        player.instantRedConversion = MATH.applyPercentage(
          player.instantRedConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantBlueConversion = MATH.applyPercentage(
          player.instantBlueConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantWhiteConversion = MATH.applyPercentage(
          player.instantWhiteConversion,
          (amount - 1) * 0.05 + 0.1,
        );
      }
    },
    getMessage: (amount) =>
      "Pineapple Patch Winds\nx" +
      ((amount - 1) * 0.03 + 1.15).toFixed(2) +
      " pollen in pineapple patch" +
      "\n+" +
      ((amount - 1) * 5 + 1) +
      "% instant conversion in pineapple patch",
  },

  stumpFieldWinds: {
    u: (128 * 6) / 2048,
    v: (128 * 6) / 2048,
    maxCooldown: 30 * 60,
    maxAmount: 15,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "StumpField") {
        player.redPollen *= (amount - 1) * 0.03 + 1.15;
        player.whitePollen *= (amount - 1) * 0.03 + 1.15;
        player.bluePollen *= (amount - 1) * 0.03 + 1.15;
        player.instantRedConversion = MATH.applyPercentage(
          player.instantRedConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantBlueConversion = MATH.applyPercentage(
          player.instantBlueConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantWhiteConversion = MATH.applyPercentage(
          player.instantWhiteConversion,
          (amount - 1) * 0.05 + 0.1,
        );
      }
    },
    getMessage: (amount) =>
      "Stump Field Winds\nx" +
      ((amount - 1) * 0.03 + 1.15).toFixed(2) +
      " pollen in stump field" +
      "\n+" +
      ((amount - 1) * 5 + 1) +
      "% instant conversion in stump field",
  },

  cactusFieldWinds: {
    u: (128 * 6) / 2048,
    v: (128 * 6) / 2048,
    maxCooldown: 30 * 60,
    maxAmount: 15,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "CactusField") {
        player.redPollen *= (amount - 1) * 0.03 + 1.15;
        player.whitePollen *= (amount - 1) * 0.03 + 1.15;
        player.bluePollen *= (amount - 1) * 0.03 + 1.15;
        player.instantRedConversion = MATH.applyPercentage(
          player.instantRedConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantBlueConversion = MATH.applyPercentage(
          player.instantBlueConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantWhiteConversion = MATH.applyPercentage(
          player.instantWhiteConversion,
          (amount - 1) * 0.05 + 0.1,
        );
      }
    },
    getMessage: (amount) =>
      "Cactus Field Winds\nx" +
      ((amount - 1) * 0.03 + 1.15).toFixed(2) +
      " pollen in cactus field" +
      "\n+" +
      ((amount - 1) * 5 + 1) +
      "% instant conversion in cactus field",
  },

  pumpkinPatchWinds: {
    u: (128 * 6) / 2048,
    v: (128 * 6) / 2048,
    maxCooldown: 30 * 60,
    maxAmount: 15,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "PumpkinPatch") {
        player.redPollen *= (amount - 1) * 0.03 + 1.15;
        player.whitePollen *= (amount - 1) * 0.03 + 1.15;
        player.bluePollen *= (amount - 1) * 0.03 + 1.15;
        player.instantRedConversion = MATH.applyPercentage(
          player.instantRedConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantBlueConversion = MATH.applyPercentage(
          player.instantBlueConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantWhiteConversion = MATH.applyPercentage(
          player.instantWhiteConversion,
          (amount - 1) * 0.05 + 0.1,
        );
      }
    },
    getMessage: (amount) =>
      "Pumpkin Patch Winds\nx" +
      ((amount - 1) * 0.03 + 1.15).toFixed(2) +
      " pollen in pumpkin patch" +
      "\n+" +
      ((amount - 1) * 5 + 1) +
      "% instant conversion in pumpkin patch",
  },

  pineTreeForestWinds: {
    u: (128 * 6) / 2048,
    v: (128 * 6) / 2048,
    maxCooldown: 30 * 60,
    maxAmount: 15,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "PineTreeForest") {
        player.redPollen *= (amount - 1) * 0.03 + 1.15;
        player.whitePollen *= (amount - 1) * 0.03 + 1.15;
        player.bluePollen *= (amount - 1) * 0.03 + 1.15;
        player.instantRedConversion = MATH.applyPercentage(
          player.instantRedConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantBlueConversion = MATH.applyPercentage(
          player.instantBlueConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantWhiteConversion = MATH.applyPercentage(
          player.instantWhiteConversion,
          (amount - 1) * 0.05 + 0.1,
        );
      }
    },
    getMessage: (amount) =>
      "Pine Tree Forest Winds\nx" +
      ((amount - 1) * 0.03 + 1.15).toFixed(2) +
      " pollen in pine tree forest" +
      "\n+" +
      ((amount - 1) * 5 + 1) +
      "% instant conversion in pine tree forest",
  },

  roseFieldWinds: {
    u: (128 * 6) / 2048,
    v: (128 * 6) / 2048,
    maxCooldown: 30 * 60,
    maxAmount: 15,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "RoseField") {
        player.redPollen *= (amount - 1) * 0.03 + 1.15;
        player.whitePollen *= (amount - 1) * 0.03 + 1.15;
        player.bluePollen *= (amount - 1) * 0.03 + 1.15;
        player.instantRedConversion = MATH.applyPercentage(
          player.instantRedConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantBlueConversion = MATH.applyPercentage(
          player.instantBlueConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantWhiteConversion = MATH.applyPercentage(
          player.instantWhiteConversion,
          (amount - 1) * 0.05 + 0.1,
        );
      }
    },
    getMessage: (amount) =>
      "Rose Field Winds\nx" +
      ((amount - 1) * 0.03 + 1.15).toFixed(2) +
      " pollen in rose field" +
      "\n+" +
      ((amount - 1) * 5 + 1) +
      "% instant conversion in rose field",
  },

  mountainTopFieldWinds: {
    u: (128 * 6) / 2048,
    v: (128 * 6) / 2048,
    maxCooldown: 30 * 60,
    maxAmount: 15,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "MountainTopField") {
        player.redPollen *= (amount - 1) * 0.03 + 1.15;
        player.whitePollen *= (amount - 1) * 0.03 + 1.15;
        player.bluePollen *= (amount - 1) * 0.03 + 1.15;
        player.instantRedConversion = MATH.applyPercentage(
          player.instantRedConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantBlueConversion = MATH.applyPercentage(
          player.instantBlueConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantWhiteConversion = MATH.applyPercentage(
          player.instantWhiteConversion,
          (amount - 1) * 0.05 + 0.1,
        );
      }
    },
    getMessage: (amount) =>
      "Mountain Top Field Winds\nx" +
      ((amount - 1) * 0.03 + 1.15).toFixed(2) +
      " pollen in mountain top field" +
      "\n+" +
      ((amount - 1) * 5 + 1) +
      "% instant conversion in mountain top field",
  },

  coconutFieldWinds: {
    u: (128 * 6) / 2048,
    v: (128 * 6) / 2048,
    maxCooldown: 30 * 60,
    maxAmount: 15,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "CoconutField") {
        player.redPollen *= (amount - 1) * 0.03 + 1.15;
        player.whitePollen *= (amount - 1) * 0.03 + 1.15;
        player.bluePollen *= (amount - 1) * 0.03 + 1.15;
        player.instantRedConversion = MATH.applyPercentage(
          player.instantRedConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantBlueConversion = MATH.applyPercentage(
          player.instantBlueConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantWhiteConversion = MATH.applyPercentage(
          player.instantWhiteConversion,
          (amount - 1) * 0.05 + 0.1,
        );
      }
    },
    getMessage: (amount) =>
      "Coconut Field Winds\nx" +
      ((amount - 1) * 0.03 + 1.15).toFixed(2) +
      " pollen in coconut field" +
      "\n+" +
      ((amount - 1) * 5 + 1) +
      "% instant conversion in coconut field",
  },

  pepperPatchWinds: {
    u: (128 * 6) / 2048,
    v: (128 * 6) / 2048,
    maxCooldown: 30 * 60,
    maxAmount: 15,
    tokenLife: 4,
    update: (amount, player) => {
      if (player.fieldIn === "PepperPatch") {
        player.redPollen *= (amount - 1) * 0.03 + 1.15;
        player.whitePollen *= (amount - 1) * 0.03 + 1.15;
        player.bluePollen *= (amount - 1) * 0.03 + 1.15;
        player.instantRedConversion = MATH.applyPercentage(
          player.instantRedConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantBlueConversion = MATH.applyPercentage(
          player.instantBlueConversion,
          (amount - 1) * 0.05 + 0.1,
        );
        player.instantWhiteConversion = MATH.applyPercentage(
          player.instantWhiteConversion,
          (amount - 1) * 0.05 + 0.1,
        );
      }
    },
    getMessage: (amount) =>
      "Pepper Patch Winds\nx" +
      ((amount - 1) * 0.03 + 1.15).toFixed(2) +
      " pollen in pepper patch" +
      "\n+" +
      ((amount - 1) * 5 + 1) +
      "% instant conversion in pepper patch",
  },

  haste: {
    desc: "Grants x1.1 walkspeed for 25s. Stacks up to 10x, for a maximum of x2 walkspeed.",
    trialCooldown: 15,
    trialRate: 0.5,
    statsToAddTo: ["hasteTokens"],
    u: 0,
    v: 0,
    maxCooldown: 25,
    maxAmount: 10,
    tokenLife: 4,

    update: (amount, player) => {
      player.walkSpeed *= player.roboChallenge
        ? amount * 0.02 + 1
        : amount * 0.075 + 1;
      player.hasteStacks = amount;
    },

    getMessage: (amount, player) => {
      return (
        "Haste\nx" +
        (player.roboChallenge ? amount * 0.02 + 1 : amount * 0.075 + 1).toFixed(
          1,
        ) +
        " walkspeed" +
        (player.roboChallenge ? "\n\n(nerfed due to Robo Challenge!)" : "")
      );
      // CHQ: getMessage previously closed over the global `player` too —
      // now takes it explicitly. Every call site that renders a hover
      // message (see stubbedOldIndex.js's hoverText mousemove handler)
      // must pass the player instance in, e.g.
      // effects[i].getMessage(player.effects[index].amount, player)
    },
  },

  haste_: {
    maxCooldown: 60,
    maxAmount: 1,

    update: (amount, player) => {
      player.walkSpeed *= 1.5;
    },

    getMessage: (amount) => "Haste+\nx1.5 walkspeed",
  },

  focus: {
    desc: "Grants +3% critical chance for 20s. Stacks up to 10x, for a maximum of +30% critical chance.<br><br>Critical chance increases the chance of a critical hit, multiplying pollen collected or damage dealt by your critical power(x2 without any extra buffs).",
    trialCooldown: 20,
    trialRate: 0.5,
    statsToAddTo: ["focusTokens", "battleTokens"],
    u: 128 / 2048,
    v: 0,
    maxCooldown: 20,
    maxAmount: 10,
    tokenLife: 4,

    update: (amount, player) => {
      player.criticalChance += 0.03 * amount;
    },

    getMessage: (amount) => "Focus\n" + amount * 3 + "% critical chance",
  },

  melody: {
    desc: "Grants +100% critical power for 30s.",
    trialCooldown: 35,
    trialRate: 0.35,
    statsToAddTo: ["melodyTokens", "battleTokens"],
    u: 256 / 2048,
    v: 0,
    maxCooldown: 30,
    maxAmount: 1,
    tokenLife: 8,

    update: (amount, player) => {
      player.criticalPower += 1;
    },

    getMessage: () => "Melody\n+100% critical power",
  },

  link: {
    desc: "Collects all ability tokens and certain types of loot tokens.",
    trialCooldown: 20,
    trialRate: 0.75,
    statsToAddTo: ["battleTokens", "linkTokens"],
    u: (128 * 3) / 2048,
    v: 0,
    canBeLinked: false,
    tokenLife: 4,

    func: function (params, gameState) {
      const { objects } = gameState;

      for (const i in objects.tokens) {
        if (
          objects.tokens[i].canBeLinked &&
          !(objects.tokens[i] instanceof DupedToken)
        ) {
          objects.tokens[i].collect();
        }
      }
    },
    backupFunc: function (params, gameState) {
      const { objects } = gameState;

      for (const i in objects.tokens) {
        if (
          objects.tokens[i].canBeLinked &&
          !(objects.tokens[i] instanceof DupedToken)
        ) {
          objects.tokens[i].collect();
        }
      }
    },
  },

  bombCombo: {
    u: (128 * 4) / 2048,
    v: 0,
    maxCooldown: 5,
    maxAmount: 10,
    tokenLife: 4,

    update: (amount, player) => {
      player.redBombPollen *= amount * 0.2 + 1;
      player.whiteBombPollen *= amount * 0.2 + 1;
      player.blueBombPollen *= amount * 0.2 + 1;
    },

    getMessage: (amount) =>
      "Bomb Combo\nx" + (amount * 0.2 + 1).toFixed(1) + " bomb power",
  },

  whiteBomb: {
    desc: "Collects 7 pollen from 29 nearby flowers. Pollen is multipled by +10% per bee lvl.",
    trialCooldown: 15,
    trialRate: 0.3,
    statsToAddTo: ["bombTokens"],
    u: (128 * 4) / 2048,
    v: 0,
    tokenLife: 4,

    func: function (params, gameState) {
      const { player, fieldInfo, objects } = gameState;

      if (player.fieldIn === params.field) {
        const b = (params.bee.level - 1) * 0.1 + 1;

        collectPollen(
          {
            x: params.x,
            z: params.z,
            pattern: [
              [-2, 0],
              [-1, -1],
              [-1, 0],
              [-1, 1],
              [0, -2],
              [0, -1],
              [0, 0],
              [0, 1],
              [0, 2],
              [1, -1],
              [1, 0],
              [1, 1],
              [2, 0],
            ],
            amount: 7,
            stackOffset: 0.4 + Math.random() * 0.5,
            multiplier: b * player.whiteBombPollen,
            instantConversion: player.instantBombConversion,
          },
          gameState,
        );

        objects.explosions.push(
          new Explosion({
            col: [1, 1, 1],
            pos: [
              fieldInfo[params.field].x + params.x,
              fieldInfo[params.field].y + 0.5,
              fieldInfo[params.field].z + params.z,
            ],
            life: 0.3,
            size: 4,
            speed: 0.35,
            aftershock: 0.05,
          }),
        );
      }

      player.addEffect("bombCombo");
    },
  },

  redBomb: {
    desc: "Collects 10 red pollen from 29 nearby flowers. Pollen is multipled by +10% per bee lvl.",
    trialCooldown: 15,
    trialRate: 0.3,
    statsToAddTo: ["redBombTokens", "redAbilityTokens", "bombTokens"],
    u: (128 * 5) / 2048,
    v: 0,
    tokenLife: 4,

    func: function (params, gameState) {
      const { player, fieldInfo, objects } = gameState;

      if (player.fieldIn === params.field) {
        const b = (params.bee.level - 1) * 0.1 + 1;

        collectPollen(
          {
            x: params.x,
            z: params.z,
            pattern: [
              [-2, 0],
              [-1, -1],
              [-1, 0],
              [-1, 1],
              [0, -2],
              [0, -1],
              [0, 0],
              [0, 1],
              [0, 2],
              [1, -1],
              [1, 0],
              [1, 1],
              [2, 0],
            ],
            amount: {
              r: 10,
              w: player.redBombSync ? 7.5 : 0,
              b: player.redBombSync && player.blueBombSync ? 5 : 0,
            },
            stackOffset: 0.4 + Math.random() * 0.5,
            multiplier: b * player.redBombPollen,
            instantConversion: player.instantBombConversion,
          },
          gameState,
        );

        objects.explosions.push(
          new Explosion({
            col: [1, 0, 0],
            pos: [
              fieldInfo[params.field].x + params.x,
              fieldInfo[params.field].y + 0.5,
              fieldInfo[params.field].z + params.z,
            ],
            life: 0.3,
            size: 4,
            speed: 0.35,
            aftershock: 0.05,
          }),
        );
      }

      player.addEffect("bombCombo");
    },
  },

  blueBomb: {
    desc: "Collects 10 blue pollen from 29 nearby flowers. Pollen is multipled by +10% per bee lvl.",
    trialCooldown: 15,
    trialRate: 0.3,
    statsToAddTo: ["blueBombTokens", "blueAbilityTokens", "bombTokens"],
    u: (128 * 6) / 2048,
    v: 0,
    tokenLife: 4,

    func: function (params, gameState) {
      const { player, fieldInfo, objects } = gameState;

      if (player.fieldIn === params.field) {
        const b = (params.bee.level - 1) * 0.1 + 1;

        collectPollen(
          {
            x: params.x,
            z: params.z,
            pattern: [
              [-2, 0],
              [-1, -1],
              [-1, 0],
              [-1, 1],
              [0, -2],
              [0, -1],
              [0, 0],
              [0, 1],
              [0, 2],
              [1, -1],
              [1, 0],
              [1, 1],
              [2, 0],
            ],
            amount: {
              r: player.blueBombSync && player.redBombSync ? 5 : 0,
              w: player.blueBombSync ? 7.5 : 0,
              b: 10,
            },
            stackOffset: 0.4 + Math.random() * 0.5,
            multiplier: b * player.blueBombPollen,
            instantConversion: player.instantBombConversion,
          },
          gameState,
        );

        objects.explosions.push(
          new Explosion({
            col: [0, 0, 1],
            pos: [
              fieldInfo[params.field].x + params.x,
              fieldInfo[params.field].y + 0.5,
              fieldInfo[params.field].z + params.z,
            ],
            life: 0.3,
            size: 4,
            speed: 0.35,
            aftershock: 0.05,
          }),
        );
      }

      player.addEffect("bombCombo");
    },
  },

  whiteBomb_: {
    desc: "Collects 10 pollen from 49 nearby flowers. Pollen is multipled by +15% per bee lvl.",
    trialCooldown: 15,
    trialRate: 0.4,
    statsToAddTo: ["bombTokens"],
    u: (128 * 7) / 2048,
    v: 0,
    tokenLife: 4,

    func: function (params, gameState) {
      const { player, fieldInfo, objects } = gameState;

      if (player.fieldIn === params.field) {
        const b = (params.bee.level - 1) * 0.15 + 1;

        collectPollen(
          {
            x: params.x,
            z: params.z,
            pattern: [
              [-3, 0],
              [-2, -2],
              [-2, -1],
              [-2, 0],
              [-2, 1],
              [-2, 2],
              [-1, -2],
              [-1, -1],
              [-1, 0],
              [-1, 1],
              [-1, 2],
              [0, -3],
              [0, -2],
              [0, -1],
              [0, 0],
              [0, 1],
              [0, 2],
              [0, 3],
              [1, -2],
              [1, -1],
              [1, 0],
              [1, 1],
              [1, 2],
              [2, -2],
              [2, -1],
              [2, 0],
              [2, 1],
              [2, 2],
              [3, 0],
            ],
            amount: 10,
            stackHeight: 0.4 + Math.random() * 0.5,
            multiplier: b * player.whiteBombPollen,
            instantConversion: player.instantBombConversion,
          },
          gameState,
        );

        objects.explosions.push(
          new Explosion({
            col: [1, 1, 1],
            pos: [
              fieldInfo[params.field].x + params.x,
              fieldInfo[params.field].y + 0.5,
              fieldInfo[params.field].z + params.z,
            ],
            life: 0.3,
            size: 4,
            speed: 0.35,
            aftershock: 0.05,
          }),
        );
      }

      player.addEffect("bombCombo");
    },
  },

  redBomb_: {
    desc: "Collects 12.5 red pollen from 49 nearby flowers. Pollen is multipled by +20% per bee lvl.",
    trialCooldown: 20,
    trialRate: 0.3,
    statsToAddTo: ["redBombTokens", "redAbilityTokens", "bombTokens"],
    u: 0,
    v: 128 / 2048,
    tokenLife: 4,

    func: function (params, gameState) {
      const { player, fieldInfo, objects } = gameState;

      if (player.fieldIn === params.field) {
        const b = (params.bee.level - 1) * 0.2 + 1;

        collectPollen(
          {
            x: params.x,
            z: params.z,
            pattern: [
              [-3, 0],
              [-2, -2],
              [-2, -1],
              [-2, 0],
              [-2, 1],
              [-2, 2],
              [-1, -2],
              [-1, -1],
              [-1, 0],
              [-1, 1],
              [-1, 2],
              [0, -3],
              [0, -2],
              [0, -1],
              [0, 0],
              [0, 1],
              [0, 2],
              [0, 3],
              [1, -2],
              [1, -1],
              [1, 0],
              [1, 1],
              [1, 2],
              [2, -2],
              [2, -1],
              [2, 0],
              [2, 1],
              [2, 2],
              [3, 0],
            ],
            amount: {
              r: 12.5,
              w: player.redBombSync ? 10 : 0,
              b: player.redBombSync && player.blueBombSync ? 7.5 : 0,
            },
            stackHeight: 0.4 + Math.random() * 0.5,
            multiplier: b * player.redBombPollen,
            instantConversion: player.instantBombConversion,
          },
          gameState,
        );

        objects.explosions.push(
          new Explosion({
            col: [1, 0, 0],
            pos: [
              fieldInfo[params.field].x + params.x,
              fieldInfo[params.field].y + 0.5,
              fieldInfo[params.field].z + params.z,
            ],
            life: 0.3,
            size: 4,
            speed: 0.35,
            aftershock: 0.05,
          }),
        );
      }

      player.addEffect("bombCombo");
    },
  },

  blueBomb_: {
    desc: "Collects 12.5 blue pollen from 49 nearby flowers. Pollen is multipled by +20% per bee lvl.",
    trialCooldown: 20,
    trialRate: 0.3,
    statsToAddTo: ["blueBombTokens", "blueAbilityTokens", "bombTokens"],
    u: 128 / 2048,
    v: 128 / 2048,
    tokenLife: 4,

    func: function (params, gameState) {
      const { player, fieldInfo, objects } = gameState;

      if (player.fieldIn === params.field) {
        const b = (params.bee.level - 1) * 0.2 + 1;

        collectPollen(
          {
            x: params.x,
            z: params.z,
            pattern: [
              [-3, 0],
              [-2, -2],
              [-2, -1],
              [-2, 0],
              [-2, 1],
              [-2, 2],
              [-1, -2],
              [-1, -1],
              [-1, 0],
              [-1, 1],
              [-1, 2],
              [0, -3],
              [0, -2],
              [0, -1],
              [0, 0],
              [0, 1],
              [0, 2],
              [0, 3],
              [1, -2],
              [1, -1],
              [1, 0],
              [1, 1],
              [1, 2],
              [2, -2],
              [2, -1],
              [2, 0],
              [2, 1],
              [2, 2],
              [3, 0],
            ],
            amount: {
              b: 12.5,
              w: player.blueBombSync ? 10 : 0,
              r: player.blueBombSync && player.redBombSync ? 7.5 : 0,
            },
            stackHeight: 0.4 + Math.random() * 0.5,
            multiplier: b * player.blueBombPollen,
            instantConversion: player.instantBombConversion,
          },
          gameState,
        );

        objects.explosions.push(
          new Explosion({
            col: [0, 0, 1],
            pos: [
              fieldInfo[params.field].x + params.x,
              fieldInfo[params.field].y + 0.5,
              fieldInfo[params.field].z + params.z,
            ],
            life: 0.3,
            size: 4,
            speed: 0.35,
            aftershock: 0.05,
          }),
        );
      }

      player.addEffect("bombCombo");
    },
  },

  blueBoost: {
    desc: "Grants x1.1 blue pollen for 25s. Stacks up to 10x, for a maximum of x2 blue pollen.",
    trialCooldown: 20,
    trialRate: 0.4,
    statsToAddTo: [
      "blueBoostTokens",
      "blueAbilityTokens",
      "boostTokens",
      "markOrBoostTokens",
    ],
    u: (128 * 2) / 2048,
    v: 128 / 2048,
    maxCooldown: 25,
    maxAmount: 10,
    tokenLife: 4,

    update: (amount, player) => {
      player.bluePollen *= amount * 0.1 + 1;
    },

    getMessage: (amount) =>
      "Blue Boost\nx" + (amount * 0.1 + 1).toFixed(1) + " blue pollen",
  },

  redBoost: {
    desc: "Grants x1.1 red pollen for 25s. Stacks up to 10x, for a maximum of x2 red pollen.",
    trialCooldown: 20,
    trialRate: 0.4,
    statsToAddTo: [
      "redBoostTokens",
      "redAbilityTokens",
      "boostTokens",
      "markOrBoostTokens",
    ],
    u: (128 * 3) / 2048,
    v: 128 / 2048,
    maxCooldown: 25,
    maxAmount: 10,
    tokenLife: 4,

    update: (amount, player) => {
      player.redPollen *= amount * 0.1 + 1;
    },

    getMessage: (amount) =>
      "Red Boost\nx" + (amount * 0.1 + 1).toFixed(1) + " red pollen",
  },

  whiteBoost: {
    desc: "Grants x1.1 white pollen for 25s. Stacks up to 10x, for a maximum of x2 white pollen.",
    trialCooldown: 15,
    trialRate: 0.5,
    statsToAddTo: ["boostTokens", "markOrBoostTokens"],
    u: (128 * 4) / 2048,
    v: 128 / 2048,
    maxCooldown: 25,
    maxAmount: 10,
    tokenLife: 4,

    update: (amount, player) => {
      player.whitePollen *= amount * 0.1 + 1;
    },

    getMessage: (amount) =>
      "White Boost\nx" + (amount * 0.1 + 1).toFixed(1) + " white pollen",
  },

  babyLove: {
    desc: "Grants x1.5 pollen and +50% loot luck for 30s.",
    trialCooldown: 30,
    trialRate: 0.4,
    u: (128 * 1) / 2048,
    v: (256 * 4) / 2048,
    maxCooldown: 30,
    maxAmount: 1,
    tokenLife: 8,

    update: (amount, player) => {
      player.redPollen *= 1.5;
      player.whitePollen *= 1.5;
      player.bluePollen *= 1.5;
      player.lootLuck *= 1.5;
    },

    getMessage: () => "Baby Love\nx1.5 pollen\nx1.5 loot luck",
  },

  inspire: {
    trialCooldown: 60,
    trialRate: 0.0075,
    statsToAddTo: ["inspireTokens"],
    u: (128 * 2) / 2048,
    v: (256 * 4) / 2048,
    maxCooldown: 5,
    maxAmount: 50,
    tokenLife: 4,

    update: (amount, player) => {
      player.redPollen *= amount * 0.25 + 1;
      player.whitePollen *= amount * 0.25 + 1;
      player.bluePollen *= amount * 0.25 + 1;
    },

    getMessage: (amount) =>
      "Inspire\nx" + (amount * 0.25 + 1).toFixed(2) + " pollen",
  },

  rage: {
    desc: "Grants +1 bee attack for 30s. Stacks up to 3x, for a maximum of +3 bee attack.",
    trialCooldown: 25,
    trialRate: 0.8,
    statsToAddTo: ["rageTokens", "battleTokens", "redAbilityTokens"],
    u: (128 * 6) / 2048,
    v: (256 * 2) / 2048,
    maxCooldown: 30,
    maxAmount: 3,
    tokenLife: 24,

    update: (amount, player) => {
      player.whiteBeeAttack += amount;
      player.blueBeeAttack += amount;
      player.redBeeAttack += amount;
    },

    getMessage: (amount) => "Rage\n+" + amount + " bee attack",
  },

  flameHeat: {
    u: (128 * 5) / 2048,
    v: 128 / 2048,
    maxCooldown: 20,
    tokenLife: 4,
    amountFromCooldown: true,

    update: (amount, player) => {
      player.redPollen *= amount * 0.75 + 1;
      player.beeAttack *= amount * 0.2 + 1;
      player.flameHeatStack = amount + 1;
      player.flameHeatStackApplied = amount * 0.5 + 1;
    },

    getMessage: (amount) =>
      "Flame Heat\nx" +
      (amount * 0.75 + 1).toFixed(2) +
      "  red pollen\nx" +
      (amount * 0.2 + 1).toFixed(2) +
      " bee attack",
  },

  darkHeat: {
    u: (128 * 5) / 2048,
    v: 128 / 2048,
    maxCooldown: 0,
    tokenLife: 4,
    maxAmount: 100,

    update: (amount, player) => {
      player.superCritPower *= amount * 0.06 + 1;
      player.instantRedConversion = MATH.applyPercentage(
        player.instantRedConversion,
        amount * 0.0025,
      );
      player.beeAttack *= amount * 0.02 + 1;
    },

    getMessage: (amount) =>
      "Dark Heat\nx" +
      (amount * 0.06 + 1).toFixed(2) +
      " super-crit power\n+" +
      ((amount * 0.25) | 0) +
      "% instant red conversion\nx" +
      (amount * 0.02 + 1) +
      " bee attack",
  },

  pollenMarkToken: {
    desc: "Marks a random spot on the field with a radius of 5 flowers for 7s(+0.2s per bee lvl).<br><br>Standing in the mark grants x1.15 pollen. Stacks up to 3x, for a maximum of x1.45 pollen.",
    trialCooldown: 20,
    trialRate: 0.4,
    statsToAddTo: ["markTokens", "markOrBoostTokens"],
    u: (128 * 6) / 2048,
    v: 128 / 2048,
    tokenLife: 8,

    func: function (params, gameState) {
      const { player, fieldInfo, objects } = gameState;

      if (player.fieldIn === params.field) {
        objects.marks.push(
          new Mark(
            params.field,
            (MATH.random(0.2, 0.8) * fieldInfo[params.field].width) | 0,
            (MATH.random(0.2, 0.8) * fieldInfo[params.field].length) | 0,
            "pollenMark",
            params.bee.level,
          ),
        );
      }
    },
  },

  honeyMarkToken: {
    desc: "Marks a random spot on the field with a radius of 5 flowers for 7s(+0.2s per bee lvl).<br><br>Standing in the mark converts 3x the average convert amount of all your bees, and grants x1.25 convert rate. Stacks up to 3x.",
    trialCooldown: 17.5,
    trialRate: 0.5,
    statsToAddTo: ["markTokens", "markOrBoostTokens"],
    u: (128 * 7) / 2048,
    v: 128 / 2048,
    tokenLife: 8,

    func: function (params, gameState) {
      const { fieldInfo, objects } = gameState;

      objects.marks.push(
        new Mark(
          params.field,
          (MATH.random(0.2, 0.8) * fieldInfo[params.field].width) | 0,
          (MATH.random(0.2, 0.8) * fieldInfo[params.field].length) | 0,
          "honeyMark",
          params.bee.level,
        ),
      );
    },
  },

  preciseMarkToken: {
    trialCooldown: 30,
    trialRate: 0.5,
    statsToAddTo: ["markTokens", "markOrBoostTokens"],
    u: (128 * 0) / 2048,
    v: (128 * 8) / 2048,
    tokenLife: 8,

    func: function (params, gameState) {},
  },

  pollenMark: {
    u: 0,
    v: 0,
    maxCooldown: 0,
    tokenLife: 4,
    maxAmount: 3,

    update: (amount, player) => {
      const a = amount * 0.15 + 1;
      player.whitePollen *= a;
      player.redPollen *= a;
      player.bluePollen *= a;
    },

    getMessage: (amount) => "Pollen Mark\nx" + (amount * 0.15 + 1) + " pollen",
  },

  honeyMark: {
    u: 0,
    v: 0,
    maxCooldown: 0,
    tokenLife: 4,
    maxAmount: 3,

    update: (amount, player) => {
      player.convertRate *= amount * 0.25 + 1;
    },

    getMessage: (amount) =>
      "Honey Mark\nConverts 3x the average of all your bee's convert amount of pollen.\nx" +
      (amount * 0.25 + 1) +
      " convert rate",
  },

  preciseMark: {
    u: 0,
    v: 0,
    maxCooldown: 0,
    tokenLife: 4,
    maxAmount: 3,

    update: (amount, player) => {
      player.criticalChance += amount * 0.07;
      player.superCritChance += amount * 0.07;
    },

    getMessage: (amount) =>
      "Precise Mark\n+" +
      amount * 7 +
      "% critical chance\n+" +
      amount * 7 +
      "% super-crit chance",
  },

  inferno: {
    desc: "Summons 4 flames and 2 temporary Fire Bees that last for 15s(+1s per lvl). The Fire Bees are gifted if this bee is gifted.<br><br>Flames last for 3s, collecting 10R/4W/1B pollen from 9 nearby flowers every second. Pollen collected is multiplied by 4% per red bee(8% is gifted). Flames also deal 15 damage to mobs every second. Standing in flames grant Flame Heat, lasting for 20s, and giving up to x2 red pollen and x1.2 bee attack.",
    trialCooldown: 20,
    trialRate: 0.5,
    statsToAddTo: ["redAbilityTokens", "battleTokens"],
    u: 0,
    v: 256 / 2048,
    tokenLife: 4,

    func: function (params, gameState) {
      const { player, fieldInfo, objects } = gameState;

      if (player.fieldIn === params.field) {
        const f = fieldInfo[params.field];

        if (
          params.x >= 0 &&
          params.x < f.width &&
          params.z - 1 >= 0 &&
          params.z - 1 < f.length
        ) {
          objects.flames.push(new Flame(params.field, params.x, params.z - 1));
        }
        if (
          params.x >= 0 &&
          params.x < f.width &&
          params.z + 1 >= 0 &&
          params.z + 1 < f.length
        ) {
          objects.flames.push(new Flame(params.field, params.x, params.z + 1));
        }
        if (
          params.x - 1 >= 0 &&
          params.x - 1 < f.width &&
          params.z >= 0 &&
          params.z < f.length
        ) {
          objects.flames.push(new Flame(params.field, params.x - 1, params.z));
        }
        if (
          params.x + 1 >= 0 &&
          params.x + 1 < f.width &&
          params.z >= 0 &&
          params.z < f.length
        ) {
          objects.flames.push(new Flame(params.field, params.x + 1, params.z));
        }

        objects.tempBees.push(
          new TempBee(
            [f.x + params.x, f.y + 0.5, f.z + params.z],
            "fire",
            Math.max(params.bee.level - 2, 1),
            15 + params.bee.level,
            params.bee.gifted,
          ),
        );
        objects.tempBees.push(
          new TempBee(
            [f.x + params.x, f.y + 0.5, f.z + params.z],
            "fire",
            Math.max(params.bee.level - 2, 1),
            15 + params.bee.level,
            params.bee.gifted,
          ),
        );

        objects.explosions.push(
          new Explosion({
            col: [1, 0.5, 0],
            pos: [f.x + params.x, f.y + 0.5, f.z + params.z],
            life: 0.5,
            size: 5,
            speed: 0.25,
            aftershock: 0.005,
          }),
        );
      }
    },
    backupFunc: function (params, gameState) {
      const { objects } = gameState;

      objects.tempBees.push(
        new TempBee(
          params.pos,
          "fire",
          Math.max(params.bee.level - 2, 1),
          15 + params.bee.level,
          params.bee.gifted,
        ),
      );

      objects.flames.push(
        new Flame(params.pos[0] - 1, params.pos[1], params.pos[2], true),
      );
      objects.flames.push(
        new Flame(params.pos[0] + 1, params.pos[1], params.pos[2], true),
      );
      objects.flames.push(
        new Flame(params.pos[0], params.pos[1], params.pos[2] + 1, true),
      );
      objects.flames.push(
        new Flame(params.pos[0], params.pos[1], params.pos[2] - 1, true),
      );
    },
  },

  flameFuel: {
    desc: "For 15s, tosses oil onto new flames, increasing it's lifespan by x1.5 and makes it convert 2% of your hive's convert total of pollen into honey.",
    trialCooldown: 30,
    trialRate: 0.3,
    u: 128 / 2048,
    v: 256 / 2048,
    maxCooldown: 15,
    maxAmount: 1,
    tokenLife: 4,

    update: (amount, player) => {
      player.flameFuel = true;
    },

    getMessage: () => "Flame Fuel\nx1.5 flame life",
  },

  markSurge: {
    desc: "Makes all active marks surge, collecting pollen and increasing it's lifespan by +1s(+0.1s per bee lvl). Marks can only surge 5 times.<br><br>Marks collect 7(13 if the mark is a Precise Mark) pollen from all flowers inside their radius. Pollen collected is multiplied by +10% per bee lvl.<br><br>• If the mark is a Honey Mark, it instantly converts all collected pollen.<br><br>• If the mark is a Precise Mark, it will always critical hit.",
    trialCooldown: 20,
    trialRate: 0.25,
    u: 256 / 2048,
    v: 256 / 2048,
    tokenLife: 4,

    func: function (params, gameState) {
      const { objects } = gameState;

      for (const i in objects.marks) {
        objects.marks[i].surge((i / objects.marks.length) * 0.5);
      }
    },
  },

  triangulate: {
    desc: "Draws a triangle between the token, the bee, and you. The bee will travel away from both points, maximizing the triangle's area. After 3s, all tokens inside the triangle is collected, pollen is collected, and marks inside the triangle surge.<br><br>10(+2 per bee lvl) pollen is collected from each flower inside the triangle.<br><br>• If the triangle contains a mark, it gains x1.5 pollen.<br><br>• If the triangle contains a Pollen Mark, it gains x2 white pollen.<br><br>• If the triangle contains a Honey Mark, it gains +50% instant conversion.<br><br>• If the triangle contains a Precise Mark, it always critical hits.",
    trialCooldown: 20,
    trialRate: 0.25,
    u: (128 * 7) / 2048,
    v: (256 * 2) / 2048,
    tokenLife: 4,

    func: function (params, gameState) {
      const { player, fieldInfo, objects } = gameState;

      if (player.fieldIn === params.field) {
        const f = fieldInfo[params.field];

        params.bee.startTriangulate([
          f.x + params.x,
          f.y + 0.75,
          f.z + params.z,
        ]);
        objects.triangulates.push(
          new Triangulate(params.bee, [
            f.x + params.x,
            f.y + 0.75,
            f.z + params.z,
          ]),
        );
      }

      gameState.player.addEffect("bombCombo");
    },
  },

  pollenHaze: {
    desc: "Summons a haze over the field, lasting for 30s. Every 0.07s, a flower is pollinated. If the flower is already at it's maximum pollination, it is replenished.<br><br>When a flower is pollinated, it moves up a tier. Flowers can be at the single, double, triple, large, or star tier. Pollen from the flower is multiplied based on it's tier, and higher tier flowers deplete slower. Over time, flowers naturally downgrade to it's original tier.",
    trialCooldown: 150,
    trialRate: 1,
    u: 0,
    v: (256 * 2.5) / 2048,
    tokenLife: 8,

    func: function (params, gameState) {
      const { player, fieldInfo, objects } = gameState;

      if (player.fieldIn === params.field) {
        const f = fieldInfo[params.field];

        if (!f.haze.start) {
          objects.explosions.push(
            new Explosion({
              col: [1, 1, 0],
              pos: [
                (f.width - 1) * 0.5 + f.x,
                f.y + 0.75,
                (f.length - 1) * 0.5 + f.z,
              ],
              life: 30,
              size: (f.width + f.length) * 0.5 * 1.5,
              speed: 0.1,
              aftershock: 0,
              maxAlpha: 0.15,
              backface: true,
              primitive: "cylinder_explosions",
              height: 8 / ((f.width + f.length) * 0.5 * 1.5),
            }),
          );
        }

        f.haze = { start: gameState.TIME, delay: gameState.TIME };
      }
    },
  },

  fuzzBomb: {
    desc: "Summons 2(+1 per 5 bee lvls) fuzz bombs rolling around the field, lasting for 5s(+0.25s per bee lvl). Touching them collects 15W/10R/10B pollen from 25 nearby flowers and pollinates them. If the flower is already at it's maximum pollination, it is replenished.<br><br>When a flower is pollinated, it moves up a tier. Flowers can be at the single, double, triple, large, or star tier. Pollen from the flower is multiplied based on it's tier, and higher tier flowers deplete slower. Over time, flowers naturally downgrade to it's original tier.",
    trialCooldown: 25,
    trialRate: 0.5,
    u: 128 / 2048,
    v: (256 * 2.5) / 2048,
    tokenLife: 4,

    func: function (params, gameState) {
      const { player, objects } = gameState;

      if (player.fieldIn === params.field) {
        for (let i = 0; i < 2 + ((params.bee.level * 0.2) | 0); i++) {
          objects.fuzzBombs.push(new FuzzBomb(params.field, params.bee.level));
        }
      }
    },
  },

  precision: {
    u: (128 * 5) / 2048,
    v: (256 * 2) / 2048,
    maxCooldown: 60,
    tokenLife: 4,
    maxAmount: 10,

    update: (amount, player) => {
      player.superCritChance += amount * 0.02;
    },

    getMessage: (amount) => "Precision\n+" + amount * 2 + "% super-crit chance",
  },

  summonFrog: {
    desc: "Summons a frog on the field, lasting for 25s(+1s per bee lvl). If the bee is gifted, this has a 10%(+2% per bee lvl) chance to spawn a gifted frog instead.<br><br>Frogs hop around the field, creating bubbles every 2nd and 3rd jump. Frogs also collect nearby tokens, and creates another bubble when they do.<br><br>Gifted frogs have a higher chance to collect tokens can do so from further away.<br><br>Bubbles last for 10s. When popped, they collect 10B/6W/2R pollen and replenish 33 flowers. Pollen collected is multiplied by 10% per gifted blue bee type.",
    trialCooldown: 30,
    trialRate: 0.33,
    statsToAddTo: ["blueAbilityTokens", "battleTokens"],
    u: (128 * 3) / 2048,
    v: 256 / 2048,
    tokenLife: 4,

    func: function (params, gameState) {
      const { player, objects } = gameState;

      if (params.field === player.fieldIn) {
        objects.mobs.push(
          new Frog(params.field, params.x, params.z, params.bee),
        );
      }
    },
  },

  inflateBalloons: {
    desc: "Summons a balloon on the field, lasting for 20s(+1s per bee lvl), and with a capacity scaling off of the bee's lvl and the player's capacity. This also inflates existing balloons by 1%(+0.1% per bee lvl) of their capacity.<br><br>Ballons hover around the field, absorbing and storing pollen collected under them. If the pollen is blue, it is multiplied by 25%, otherwise, by 10%.<br><br>Standing under balloons grant Balloon Aura, giving x1.02 pollen and honey from tokens. Stacks up to 10x, for a maximum of x1.2 pollen and honey from tokens.<br><br>After filling up, ballons float back to the hive, filling up the hive balloon. Converting the hive balloon grants the Balloon Blessing buff, boosting capacity and honey at hive. If the new Balloon Blessing is higher than the previous one, it replaces the old buff, otherwise, it refreshes it. The hive balloon deflates over time, depending on your capacity relative to it.<br><br>Balloons can be inflated a maximum of 4(+1 per 4 bee lvls)(+4 if the field contains at least 50% blue flowers)(+2 if the field contains at least 50% white flowers) times.<br><br>If the bee is gifted, balloons have a 10%(+1% per bee lvl) to become golden. Golden balloons have x1.35 more capacity, turn bubbles into golden bubbles, and are more effective with Tidal Surge.<br><br>Golden bubbles collect x1.5 pollen, has a 25% chance to spawn a honey token worth 50% of the collected pollen. Also contributes 2x as much to Pop Star, Bubble Bloat, Tide Power, and 3x as much to Tidal Surge.",
    trialCooldown: 30,
    trialRate: 0.25,
    statsToAddTo: ["blueAbilityTokens"],
    u: (128 * 4) / 2048,
    v: 256 / 2048,
    tokenLife: 4,

    func: function (params, gameState) {
      const { player, objects } = gameState;

      if (params.field === player.fieldIn) {
        for (const i in objects.balloons) {
          const b = objects.balloons[i];

          if (b.state === "float" && b.inflateCounter > 0) {
            b.inflateCounter--;
            b.pollen += b.cap * (0.01 + params.bee.level * 0.001);

            objects.explosions.push(
              new ReverseExplosion({
                col: b.golden ? [0.9, 0.9, 0] : [0, 0, 0.8],
                pos: b.pos,
                life: 0.75,
                size: b.displaySize + 1,
                alpha: 0.9,
                height: 1,
                primitive: "explosions",
                transformHeight: true,
              }),
            );
          }
        }

        objects.balloons.push(
          new Balloon(
            params.field,
            params.x,
            params.z,
            params.bee.gifted && Math.random() < 0.1 + params.bee.level * 0.01,
            params.bee.level - 1,
          ),
        );
      }
    },
  },

  surpriseParty: {
    desc: "Makes all active balloons on the field create random ability tokens and summons a golden balloon.<br><br>Golden balloons have x1.35 more capacity, turn bubbles into golden bubbles, and are more effective with Tidal Surge.<br><br>Golden bubbles collect x1.5 pollen, has a 25% chance to spawn a honey token worth 50% of the collected pollen. Also contributes 2x as much to Pop Star, Bubble Bloat, Tide Power, and 3x as much to Tidal Surge.",
    trialCooldown: 150,
    trialRate: 0.05,
    statsToAddTo: ["blueAbilityTokens"],
    u: (128 * 5) / 2048,
    v: 256 / 2048,
    tokenLife: 4,

    func: function (params, gameState) {
      const { player, objects } = gameState;

      if (params.field === player.fieldIn) {
        for (let i = objects.balloons.length; i--; ) {
          const b = objects.balloons[i];

          if (b.state === "float") {
            const types = [
              "focus",
              "melody",
              "haste",
              "whiteBomb",
              "link",
              "blueBomb",
              "whiteBomb_",
              "blueBomb_",
              "whiteBoost",
              "blueBoost",
              "pollenMarkToken",
              "honeyMarkToken",
            ];
            const type = types[(Math.random() * types.length) | 0];

            objects.tokens.push(
              new Token(
                effectsConfig[type].tokenLife,
                [b.pos[0], Math.round(params.bee.pos) + 0.5, b.pos[2]],
                type,
                { field: b.field, x: b.x, z: b.z, bee: params.bee },
              ),
            );
            objects.explosions.push(
              new ReverseExplosion({
                col: [0, 1, 0.4],
                pos: b.pos,
                life: 0.75,
                size: b.displaySize + 1,
                alpha: 0.9,
                height: 1,
                primitive: "explosions",
                transformHeight: true,
              }),
            );
          }
        }

        objects.balloons.push(
          new Balloon(params.field, params.x, params.z, true, params.bee.level),
        );
      }
    },
  },

  balloonAura: {
    u: 0,
    v: 0,
    maxCooldown: 0,
    tokenLife: 4,
    maxAmount: 10,

    update: (amount, player) => {
      const a = amount * 0.02 + 1;
      player.bluePollen *= a;
      player.redPollen *= a;
      player.whitePollen *= a;
      player.honeyFromTokens *= a;
    },

    getMessage: (amount) =>
      "Balloon Aura\nx" +
      (amount * 0.02 + 1) +
      " pollen\nx" +
      (amount * 0.02 + 1) +
      " honey from tokens",
  },

  balloonBlessing: {
    u: 0,
    v: 0,
    maxCooldown: 60 * 60,
    tokenLife: 4,
    maxAmount: 10000,

    update: (amount, player) => {
      player.capacity *= amount * 0.02 + 1;
      player.honeyAtHive *= amount * 0.015 + 1;
      player.buoyantBeeAttack *= Math.min(amount * 0.02 + 1, 3);
    },

    getMessage: (amount) =>
      "Balloon Blessing\nx" +
      (amount * 0.02 + 1).toFixed(2) +
      " capacity\nx" +
      (amount * 0.015 + 1).toFixed(3) +
      " honey at hive\nx" +
      Math.min(amount * 0.02 + 1, 3).toFixed(2) +
      " buoyant bee attack",
  },

  gummyBlob: {
    desc: "Drops a blob of goo onto the field, covering nearby flowers with a radius of 2(4 if the bee is gifted) and replenishing them.",
    trialCooldown: 10,
    trialRate: 0.6,
    u: (128 * 6) / 2048,
    v: 256 / 2048,
    tokenLife: 8,

    func: function (params, gameState) {
      const { player, fieldInfo, objects } = gameState;

      player.stats.gummyMorph += 3;

      if (params.field === player.fieldIn) {
        const r = params.bee.gifted ? 4 : 2;

        // CHQ: TODO — old per-cell goo/replenish walk. Needs a real
        // FieldManager method (e.g. fieldManager.gooifyRadius(field, x, z, r))
        // since updateFlower/per-cell flower addressing doesn't exist anymore.
        gameState.fieldManager?.gooifyRadius?.(
          params.field,
          params.x,
          params.z,
          r,
        );

        objects.explosions.push(
          new Explosion({
            col: [1, 0.2, 1],
            pos: [
              fieldInfo[params.field].x + params.x,
              fieldInfo[params.field].y + 0.5,
              fieldInfo[params.field].z + params.z,
            ],
            life: 0.75,
            size: r,
            speed: 0.5,
            aftershock: 0.005,
            height: 0.3,
          }),
        );
      }
    },
  },

  gummyBarrage: {
    desc: "Drops several blobs of goo onto the field, covering nearby flowers and replenishing them.",
    trialCooldown: 15,
    trialRate: 0.6,
    u: (128 * 7) / 2048,
    v: 256 / 2048,
    tokenLife: 8,

    func: function (params, gameState) {
      const { player, fieldInfo, objects } = gameState;

      player.stats.gummyMorph += 3;

      if (params.field === player.fieldIn) {
        for (let i = 0, l = MATH.random(2, 5) | 0; i < l; i++) {
          const r = MATH.random(2, 5) | 0;
          const ox = (Math.random() * fieldInfo[params.field].width) | 0;
          const oz = (Math.random() * fieldInfo[params.field].length) | 0;

          // CHQ: TODO — see gummyBlob note above.
          gameState.fieldManager?.gooifyRadius?.(params.field, ox, oz, r);

          objects.explosions.push(
            new Explosion({
              col: [1, 0.2, 1],
              pos: [
                fieldInfo[params.field].x + ox,
                fieldInfo[params.field].y + 0.5,
                fieldInfo[params.field].z + oz,
              ],
              life: 0.75,
              size: r * 1.5,
              speed: 0.5,
              aftershock: 0.005,
              height: 0.3,
            }),
          );
        }
      }
    },
  },

  targetPractice: {
    desc: "Causes the bee to fly up, projecting 3 targets onto the field for 4s. Running over a target activates it. After 4s, the bee shoots the targets.<br><br>• Unactivated targets create a red boost token when shot<br><br>• If an activated target is shot, it will create a focus token and collect 50%(+5% per bee lvl) of the bee's attack from 49 flowers. The shot can gain up to 50% instant conversion and x3 pollen based on your Flame Heat.<br><br>• If all 3 targets are shot, all ability tokens will be collected and 1 of the targets will summon a red boost, focus, and precision token. Precision grants +2% super-crit chance and stacks up to 10x, giving a maximum of +20% super-crit chance.<br><br>• If the player stands under a target as it is shot, all ability tokens are collected and Flame Heat is consumed to convert 50% of the hive's convert total plus 15 times the bee's convert amount. The amount of pollen converted scales up to x10 with Flame Heat.<br><br>• If the bee is gifted, 1 of the targets are highlighted in purple. Activating this target but not all 3 will summon a Precise Mark for 15s(+0.2 per bee lvl) with a radius of 7 flowers. Standing in the Precise Mark grants +7% critical and super-crit chance, stacking up to 3x, for a maximum of +21% critical and super-crit chance.<br><br>Super-crit chance increases the chance of a super-crit happening if the hit is a critical hit, multiplying pollen collected or damage dealt by your critical power and super-crit power(x2 super-crit power without any extra buffs, x4 in total).",
    trialCooldown: 22.5,
    trialRate: 0.25,
    statsToAddTo: ["redAbilityTokens", "battleTokens"],
    u: (128 * 4) / 2048,
    v: (256 * 2) / 2048,
    tokenLife: 8,

    func: function (params, gameState) {
      const { player } = gameState;

      if (
        params.field === player.fieldIn &&
        player.fieldIn &&
        !player.attacked.length &&
        params.bee.state !== "shootTargetPractice" &&
        params.bee.state !== "moveToTargetPractice"
      ) {
        params.bee.startTargetPractice();
      } else {
        player.addEffect("precision");
        player.addEffect("focus");
        player.stats.focusTokens++;
        player.addEffect("redBoost");
        player.stats.redBoostTokens++;
      }
    },
  },

  glueBuff: {
    u: 0,
    v: 0,
    maxCooldown: 10 * 60,
    maxAmount: 1,
    tokenLife: 4,

    update: (amount, player) => {
      player.pollenFromTools *= 1.25;
      player.pollenFromBees *= 1.25;
    },

    getMessage: () => "Glue\nx1.25 pollen from bees\nx1.25 pollen from tools",
  },

  oilBuff: {
    u: 0,
    v: 0,
    maxCooldown: 10 * 60,
    maxAmount: 1,
    tokenLife: 4,

    update: (amount, player) => {
      player.walkSpeed *= 1.05;
      player.beeSpeed *= 1.05;
    },

    getMessage: () => "Oil\nx1.05 bee speed\nx1.05 walkspeed",
  },

  enzymesBuff: {
    u: 0,
    v: 0,
    maxCooldown: 10 * 60,
    maxAmount: 1,
    tokenLife: 4,

    update: (amount, player) => {
      player.convertRate *= 1.5;
      player.instantRedConversion = MATH.applyPercentage(
        player.instantRedConversion,
        0.12,
      );
      player.instantWhiteConversion = MATH.applyPercentage(
        player.instantWhiteConversion,
        0.12,
      );
      player.instantBlueConversion = MATH.applyPercentage(
        player.instantBlueConversion,
        0.12,
      );
    },

    getMessage: () => "Enzymes\nx1.5 convert rate\n+12% instant conversion",
  },

  redExtractBuff: {
    u: 0,
    v: 0,
    maxCooldown: 10 * 60,
    maxAmount: 1,
    tokenLife: 4,

    update: (amount, player) => {
      player.redPollen *= 1.25;
    },

    getMessage: () => "Red Extract\nx1.25 red pollen",
  },

  blueExtractBuff: {
    u: 0,
    v: 0,
    maxCooldown: 10 * 60,
    maxAmount: 1,
    tokenLife: 4,

    update: (amount, player) => {
      player.bluePollen *= 1.25;
    },

    getMessage: () => "Blue Extract\nx1.25 blue pollen",
  },

  tropicalDrinkBuff: {
    u: 0,
    v: 0,
    maxCooldown: 10 * 60,
    maxAmount: 1,
    tokenLife: 4,

    update: (amount, player) => {
      player.whitePollen *= 1.25;
      player.criticalChance += 0.05;
    },

    getMessage: () => "Tropical Drink\nx1.25 white pollen\n+5% critical chance",
  },

  purplePotionBuff: {
    u: 0,
    v: 0,
    maxCooldown: 10 * 60,
    maxAmount: 1,
    tokenLife: 4,

    update: (amount, player) => {
      player.capacity *= 1.25;
      player.redPollen *= 1.5;
      player.bluePollen *= 1.5;
      player.pollenFromTools *= 1.3;
      player.pollenFromBees *= 1.3;
    },

    getMessage: () =>
      "Purple Potion\nx1.25 capacity\nx1.5 pollen\nx1.3 pollen from tools\nx1.3 pollen from bees",
  },

  superSmoothieBuff: {
    u: 0,
    v: 0,
    maxCooldown: 20 * 60,
    maxAmount: 1,
    tokenLife: 4,

    update: (amount, player) => {
      player.capacity *= 1.5;
      player.whitePollen *= 1.6;
      player.redPollen *= 1.6;
      player.bluePollen *= 1.6;
      player.pollenFromBees *= 1.4;
      player.pollenFromTools *= 1.4;
      player.convertRate *= 2;
      player.honeyAtHive *= 1.1;
      player.instantRedConversion = MATH.applyPercentage(
        player.instantRedConversion,
        0.17,
      );
      player.instantWhiteConversion = MATH.applyPercentage(
        player.instantWhiteConversion,
        0.17,
      );
      player.instantBlueConversion = MATH.applyPercentage(
        player.instantBlueConversion,
        0.17,
      );
      player.walkSpeed *= 1.05;
      player.beeSpeed *= 1.1;
      player.criticalChance += 0.07;
      player.superCritChance += 0.01;
    },

    getMessage: () =>
      "Super Smoothie\nx1.5 capacity\nx1.6 pollen\nx1.4 pollen from bees\nx1.4 pollen from tools\nx2 convert rate\nx1.1 honey at hive\n+17% instant conversion\n+7% critical chance\nx1.05 walkspeed\nx1.1 bee speed\n+1% super-crit chance",
  },

  stingerBuff: {
    u: 0,
    v: 0,
    maxCooldown: 45,
    maxAmount: 1,

    update: (amount, player) => {
      player.beeAttack *= 1.5;
    },

    getMessage: () => "Stinger\nx1.5 bee attack",
  },

  popStarAura: {
    maxCooldown: 45,
    maxAmount: 1,

    update: (amount, player) => {
      player.bluePollen *= Math.min(player.popStarSize * 0.0125 + 2, 5);
      player.instantBlueConversion = MATH.applyPercentage(
        player.instantBlueConversion,
        0.05,
      );
      player.bubblePollen *= 1.25;
    },

    getMessage: (amount, player) =>
      "Pop Star Aura\nx" +
      Math.min(player.popStarSize * 0.0125 + 2, 5) +
      " blue pollen\n+5% instant blue conversion\nx1.25 bubble pollen",
  },

  scorchingStarAura: {
    maxCooldown: 45,
    maxAmount: 1,

    update: (amount, player) => {
      player.redPollen *= Math.min(player.scorchingStarSize * 0.00035 + 2, 5);
      player.convertRate *= Math.min(player.scorchingStarSize * 0.00035 + 2, 5);
      player.beeAttack *= Math.min(player.scorchingStarSize * 0.00015 + 1, 1.5);
      player.instantRedConversion = MATH.applyPercentage(
        player.instantRedConversion,
        0.2,
      );
    },

    getMessage: (amount, player) =>
      "Scorching Star Aura\nx" +
      Math.min(player.scorchingStarSize * 0.00035 + 2, 5).toFixed(2) +
      " red pollen\nx" +
      Math.min(player.scorchingStarSize * 0.00035 + 2, 5).toFixed(2) +
      " convert rate\nx" +
      Math.min(player.scorchingStarSize * 0.00015 + 1, 1.5).toFixed(2) +
      " bee attack\n+20% instant red conversion",
  },

  gummyStarAura: {
    maxCooldown: 45,
    maxAmount: 1,

    update: (amount, player) => {
      player.goo *= Math.min(player.gummyStarSize * 0.0000000003 + 1, 2);
      player.whitePollen *= Math.min(
        player.gummyStarSize * 0.0000000002 + 1,
        2,
      );
      player.instantWhiteConversion = MATH.applyPercentage(
        player.instantWhiteConversion,
        0.2,
      );
    },

    getMessage: (amount, player) =>
      "Gummy Star Aura\nx" +
      Math.min(player.gummyStarSize * 0.0000000003 + 1, 2).toFixed(2) +
      " goo\nx" +
      Math.min(player.gummyStarSize * 0.0000000002 + 1, 2).toFixed(2) +
      " white pollen\n+20% instant white conversion",
  },

  bubbleBloat: {
    u: (128 * 5) / 2048,
    v: 128 / 2048,
    maxCooldown: 60 * 60,
    tokenLife: 4,
    amountFromCooldown: true,

    update: (amount, player) => {
      player.convertRateAtHive *= (amount * 6 + 1).toFixed(2);
      player.blueFieldCapacity *= (amount * 5 + 1).toFixed(2);
    },

    getMessage: (amount) =>
      "Bubble Bloat\nx" +
      (amount * 6 + 1).toFixed(2) +
      " convert rate at hive\nx" +
      (amount * 5 + 1).toFixed(2) +
      " blue field capacity",
  },

  gummyBall: {
    u: (128 * 5) / 2048,
    v: 128 / 2048,
    maxCooldown: 180,
    tokenLife: 4,
    amountFromCooldown: true,

    // CHQ: this `update` is the one exception that needs gameState —
    // the original reached into `objects.mobs` and `player.fieldIn` to
    // spawn a GummyBall mob mid-effect-tick. Signature widened to
    // (amount, player, gameState); every caller of the effect-tick loop
    // (wherever `effects[type].update(amount, player)` is invoked) needs
    // to pass gameState as a third arg for this one effect.
    update: (amount, player, gameState) => {
      player.gummyBallSize *= amount * 1.5 + 1;
      player.whitePollen *= amount * 0.15 + 1;

      if (amount >= 0.99 && player.fieldIn) {
        player.addEffect("gummyBall", -amount);
        gameState.objects.mobs.push(new GummyBall());
      }
    },

    getMessage: (amount) =>
      "Gummyball\nx" +
      (amount * 1.5 + 1).toFixed(2) +
      " gummyball size\nx" +
      (amount * 0.2 + 1).toFixed(2) +
      " white pollen",
  },

  gummyBallCombo: {
    u: 0,
    v: 0,
    maxCooldown: 10,
    maxAmount: 1000,
    tokenLife: 4,

    update: (amount, player) => {
      player.goo *= MATH.lerp(1, 2, amount * 0.001);
      player.whitePollen *= 1.1;
    },

    getMessage: (amount) =>
      "Gummyball Combo\nx" +
      MATH.lerp(1, 2, amount * 0.001).toFixed(2) +
      " goo\nx1.1 white pollen",
  },

  guidingStarAura: {
    u: 0,
    v: 0,
    maxCooldown: 0,
    tokenLife: 4,
    maxAmount: 1,

    update: (amount, player) => {
      player.whitePollen *= 2;
      player.redPollen *= 2;
      player.bluePollen *= 2;
      player.capacity *= 2;
    },

    getMessage: () => "Guiding Star Aura\nx2 pollen\nx2 capacity",
  },

  popStarPassive: {
    isPassive: true,
    maxCooldown: 60,
    triggerVal: 30,
    triggerType: "blueBombTokens",
    currentVal: 0,
    currentCooldown: 0,
    startVal: 0,

    activate(gameState) {
      gameState.objects.mobs.push(new PopStar());
    },

    getMessage: () =>
      "Pop Star\nEvery 30 blue bomb tokens summons a Pop Star, lasting for 45s, and applies 1m of bubble bloat. It grows for every bubble popped, x1.25 bubble pollen, 20% instant blue conversion, and up to x5 blue pollen. Upon summoning, it also applies 30s of Bubble Bloat. Popping a bubble while the star is active gives 1s(2s if golden) of Bubble Bloat, up to 1h. Bubble Bloat gives up to x6 convert rate and x6 blue field capacity. When the Pop Star disappears, it spawns 1 bubble for every 10 of the star's size, with an extra 5. Cooldown: 1m",
  },

  scorchingStarPassive: {
    isPassive: true,
    maxCooldown: 60,
    triggerVal: 15,
    triggerType: "redBoostTokens",
    currentVal: 0,
    currentCooldown: 0,
    startVal: 0,

    activate(gameState) {
      gameState.objects.mobs.push(new ScorchingStar());
    },

    getMessage: () =>
      "Scorching Star\nEvery 15 red boost tokens summons a Scorching Star, lasting for 45s. It grows by 75(100 if dark) every second for every flame nearby. It grants up to x5 red pollen, x5 convert rate, x1.5 bee attack, and +20% instant red conversion. Cooldown: 1m",
  },

  gummyStarPassive: {
    isPassive: true,
    maxCooldown: 60,
    triggerVal: 25,
    triggerType: "gummyStar",
    currentVal: 0,
    currentCooldown: 0,
    startVal: 0,

    activate(gameState) {
      gameState.objects.mobs.push(new GummyStar());
    },

    getMessage: () =>
      "Gummy Star\nEvery gumdrop used or after 20 gumdrops has a 9% chance to summon a Gummy Star, lasting for 45s. It grows based on how much goo you collect, giving up to x2 goo and x2 white pollen, while always giving +15% instant white conversion and +15% instant goo conversion. After disappearing, it spreads 20(+the amount of digits in the star's size) honey tokens, with a total value of approximately 1,000(+7.5% of the star's size). Cooldown: 1m",
  },

  guidingStarPassive: {
    isPassive: true,
    maxCooldown: 60 * 5,
    triggerVal: 250,
    triggerType: "boostTokens",
    currentVal: 0,
    currentCooldown: 0,
    startVal: 0,

    activate(gameState) {
      const { player, objects, fieldInfo } = gameState;
      let f = [];

      for (const i in fieldInfo) f.push(i);

      for (const i in objects.mobs) {
        const o = objects.mobs[i];
        if (o.guidingstarinstance && f.indexOf(o.field) > -1) {
          f.splice(f.indexOf(o.field), 1);
        }
      }

      if (f.length) {
        const chosen = f[(Math.random() * f.length) | 0];
        objects.mobs.push(new GuidingStar(chosen));
        player.addMessage(
          "⭐Guiding Star on " + MATH.doGrammar(chosen) + "!⭐",
        );
      }
    },

    getMessage: () =>
      "Guiding Star\nEvery 250th boost token summons a guiding star over a random field, granting x2.5 capacity and pollen for 10m. Cooldown: 5m",
  },

  starShowerPassive: {
    isPassive: true,
    maxCooldown: 25,
    triggerVal: 35,
    triggerType: "markOrBoostTokens",
    currentVal: 0,
    currentCooldown: 0,
    startVal: 0,

    activate(gameState) {
      const { player, objects } = gameState;
      if (player.fieldIn) {
        objects.mobs.push(new StarShower(player.fieldIn));
      }
    },

    getMessage: () =>
      "Every 35 mark or boost tokens summons 10 falling stars on the field. Falling stars collect 30 pollen from 5 flowers and instantly converts it. Catching a falling star converts 10% of your convert total from your bag, and grants a stack of inspire. Cooldown: 25s",
  },

  starSawPassive: {
    isPassive: true,
    maxCooldown: 40,
    triggerVal: 2,
    triggerType: "stingerUsed",
    currentVal: 0,
    currentCooldown: 0,
    startVal: 0,

    activate(gameState) {
      const { player, objects, items } = gameState;
      items.stinger.amount++;
      player.updateInventory();
      player.addMessage("+1 Stinger (from Star Saw Refund)");
      objects.mobs.push(new StarSaw());
    },

    getMessage: () =>
      "Every 2nd stinger used is refunded and summons a star saw for 45s. The star circles you, damaging mobs by 30% of your attack total, popping bubbles, fuzz bombs, collecting tokens, and collecting and converting 5(+0.05 per attack total) pollen from 5 flowers every 0.1s. The star saw also converts pollen from your backpack equal to the amount it collects. Cooldown: 40s",
  },

  petalStormPassive: {
    isPassive: true,
    maxCooldown: 30,
    triggerVal: 30,
    triggerType: "boostTokens",
    currentVal: 0,
    currentCooldown: 0,
    startVal: 0,

    activate(gameState) {
      const { player, objects } = gameState;

      for (let i = 0; i < 30; i++) {
        window.setTimeout(
          function () {
            objects.mobs.push(
              new PetalShuriken(
                [
                  player.body.position.x,
                  player.body.position.y + 0.25,
                  player.body.position.z,
                ],
                [Math.cos(i * 0.75), 0, Math.sin(i * 0.75)],
              ),
            );
          },
          1000 * i * 0.15,
        );
      }
    },

    getMessage: () =>
      "Every 30th boost token shoots 30 petal shurikens in all directions. Petal shurikens collects tokens and causes bees to convert pollen.",
  },

  tidePower: {
    u: 0,
    v: 0,
    maxCooldown: 20,
    maxAmount: 500,

    update: (amount, player) => {
      player.collectorSpeed *= amount * 0.00175 + 1;
      player.tidePower *= amount * 0.0025 + 1;

      if (amount >= 500) {
        player.addEffect("tidalSurge", 1);
        player.addEffect("tidePower", false, false, 0);
        player.addEffect("tideBlessing", 25 / (4 * 60 * 60));
      }
    },

    getMessage: (amount) =>
      "Tide Power\nx" +
      (amount * 0.00175 + 1).toFixed(3) +
      " collector speed\nx" +
      (amount * 0.0025 + 1).toFixed(3) +
      " wave size",
  },

  tidalSurge: {
    u: (128 * 5) / 2048,
    v: 128 / 2048,
    maxCooldown: 10,
    tokenLife: 4,
    amountFromCooldown: true,

    update: (amount, player) => {
      player.collectorSpeed = 3;
      player.tidalSurge = true;
      player.addEffect("tidePower", false, false, 0);
    },

    getMessage: () => "Tidal Surge\nx5 collector speed",
  },

  tideBlessing: {
    u: (128 * 5) / 2048,
    v: 128 / 2048,
    maxCooldown: 4 * 60 * 60,
    tokenLife: 4,
    amountFromCooldown: true,

    update: (amount, player) => {
      player.bluePollen *= amount * 0.15 + 1;
      player.honeyFromTokens *= amount * 0.15 + 1;
      player.convertRateAtHive *= amount * 0.15 + 1;
      player.pollenFromTools *= amount * 0.15 + 1;
      player.pollenFromBees *= amount * 0.15 + 1;
    },

    getMessage: (amount) =>
      "Tidal Blessing\nx" +
      (amount * 0.15 + 1).toFixed(2) +
      " blue pollen\nx" +
      (amount * 0.15 + 1).toFixed(2) +
      " convert rate at hive\nx" +
      (amount * 0.15 + 1).toFixed(2) +
      " honey from tokens\nx" +
      (amount * 0.15 + 1).toFixed(2) +
      " pollen from tools\nx" +
      (amount * 0.15 + 1).toFixed(2) +
      " pollen from bees",
  },

  coconutShield: {
    u: (128 * 6) / 2048,
    v: (256 * 2) / 2048,
    maxCooldown: 10,
    maxAmount: 1,

    update: (amount, player) => {
      player.beeAttack *= 1.25;
      player.defense = 1;
    },

    getMessage: () => "Coconut Shield\n+100% defense\nx1.25 bee attack",
  },

  coconutSurge: {
    u: (128 * 6) / 2048,
    v: (256 * 2) / 2048,
    maxCooldown: 2,
    maxAmount: 1,

    update: (amount, player) => {
      player.walkSpeed *= 1.15;
      player.beeSpeed *= 1.5;
    },

    getMessage: () => "Coconut Surge\nx1.15 walkspeed\nx1.5 bee speed",
  },

  conversionBoost: {
    u: (128 * 6) / 2048,
    v: (256 * 2) / 2048,
    maxCooldown: 30 * 60,
    maxAmount: 1,

    update: (amount, player) => {
      player.convertRate *= 2;
    },

    getMessage: () => "Conversion Boost\nx2 convert rate",
  },

  gummyMorph: {
    u: (128 * 6) / 2048,
    v: (256 * 2) / 2048,
    maxCooldown: 10,
    maxAmount: 1,

    update: (amount, player) => {
      player.goo *= 1.75;
      player.instantRedConversion = 1;
      player.instantWhiteConversion = 1;
      player.instantBlueConversion = 1;
      player.walkSpeed *= 1.1;
      player.jumpPower *= 1.2;
    },

    getMessage: () =>
      "Gummy Morph\nx1.75 goo\n+100% instant conversion\nx1.1 walkspeed\nx1.2 jump power",
  },

  focusPulserPassive: {
    isPassive: true,
    maxCooldown: 20,
    triggerVal: 25,
    triggerType: "focusTokens",
    currentVal: 0,
    currentCooldown: 0,
    startVal: 0,

    activate(gameState) {
      gameState.objects.mobs.push(new Pulse("red"));
    },

    getMessage: () =>
      "Focus Pulser\nEvery 25 focus tokens collected activates a red pulse, hopping to every red bee twice, collecting pollen. Pollen collection increases with each hop. Cooldown: 20s",
  },

  hastePulserPassive: {
    isPassive: true,
    maxCooldown: 20,
    triggerVal: 25,
    triggerType: "hasteTokens",
    currentVal: 0,
    currentCooldown: 0,
    startVal: 0,

    activate(gameState) {
      gameState.objects.mobs.push(new Pulse("blue"));
    },

    getMessage: () =>
      "Haste Pulser\nEvery 25 haste tokens collected activates a blue pulse, hopping to every blue bee twice, collecting pollen. Pollen collection increases with each hop. Cooldown: 20s",
  },

  inspireCoconutsPassive: {
    isPassive: true,
    maxCooldown: 0.5,
    triggerVal: 5,
    triggerType: "inspireTokens",
    currentVal: 0,
    currentCooldown: 0,
    startVal: 0,

    activate(gameState) {
      const { player, objects, fieldInfo } = gameState;

      if (player.fieldIn) {
        const f = fieldInfo[player.fieldIn];
        for (let i = 0; i < 5; i++) {
          objects.mobs.push(
            new Coconut(
              (Math.random() * f.width) | 0,
              (Math.random() * f.length) | 0,
              i * 0.4,
            ),
          );
        }
      }
    },

    getMessage: () =>
      "Inspire Coconuts\nEvery 5 inspire tokens collected summons 5 falling coconuts which collect pollen when the land. Standing under the coconut instantly converts the player's convert total into honey tokens.",
  },

  emergencyCoconutShieldPassive: {
    isPassive: true,
    maxCooldown: 60,
    triggerVal: 1,
    triggerType: "coconutShield",
    currentVal: 0,
    currentCooldown: 0,
    startVal: 0,

    activate(gameState) {
      const { player, objects, fieldInfo } = gameState;

      if (player.fieldIn) {
        const f = fieldInfo[player.fieldIn];
        for (let i = 0; i < 5; i++) {
          objects.mobs.push(
            new Coconut(
              (Math.random() * f.width) | 0,
              (Math.random() * f.length) | 0,
              i * 0.4,
            ),
          );
        }
      }

      player.addEffect("coconutShield");
    },

    getMessage: () =>
      "Emergency Coconut Shield\nTaking damage from a monster will activate a shield, granting 100% defense, x1.25 bee attack and will drop 5 falling coconuts if in a field. Cooldown: 1m",
  },

  coconutHastePassive: {
    isPassive: true,
    maxCooldown: 1,
    triggerVal: 1,
    triggerType: "fallingCoconuts",
    currentVal: 0,
    currentCooldown: 0,
    startVal: 0,

    activate(gameState) {
      const { player } = gameState;
      player.addEffect("haste");
      player.addEffect("coconutSurge");
    },

    getMessage: () =>
      'Coconut Haste\nCatching a falling coconut will apply a stack of "Haste" and grant "Coconut Surge", giving x1.2 walkspeed and x1.5 bee speed for 2s.',
  },

  xFlamePassive: {
    isPassive: true,
    maxCooldown: 25,
    triggerVal: 20,
    triggerType: "battleTokens",
    currentVal: 0,
    currentCooldown: 0,
    startVal: 0,

    activate(gameState) {
      const { player, objects, fieldInfo } = gameState;
      const dirs = [
        [-1, 1],
        [1, -1],
        [-1, -1],
        [1, 1],
      ];

      if (player.fieldIn && !player.attacked.length) {
        const f = fieldInfo[player.fieldIn];
        objects.flames.push(
          new Flame(player.fieldIn, player.flowerIn.x, player.flowerIn.z),
        );

        for (const d of dirs) {
          for (let i = 1; i < 8; i++) {
            const x = d[0] * i + player.flowerIn.x;
            const z = d[1] * i + player.flowerIn.z;
            if (x >= 0 && x < f.width && z >= 0 && z < f.length) {
              objects.flames.push(new Flame(player.fieldIn, x, z));
            }
          }
        }
      } else {
        objects.flames.push(
          new Flame(
            player.body.position.x,
            player.body.position.y,
            player.body.position.z,
            true,
          ),
        );

        for (const d of dirs) {
          for (let i = 1; i < 8; i++) {
            const x = d[0] * i;
            const z = d[1] * i;
            objects.flames.push(
              new Flame(
                player.body.position.x + x,
                player.body.position.y,
                player.body.position.z + z,
                true,
              ),
            );
          }
        }
      }
    },

    getMessage: () =>
      "X Flame\nEvery 20 battle tokens collected summons 29 flames in an X shape, lasting for 3 secs. Each flame collects 6R/3W/1B pollen from nearby flowers and deals 15 damage to nearby enemies every sec. Cooldown: 15s",
  },

  ignitePassive: {
    isPassive: true,
    maxCooldown: 0.5,
    triggerVal: 10,
    triggerType: "redAbilityTokens",
    currentVal: 0,
    currentCooldown: 0,
    startVal: 0,

    activate(gameState) {
      const { player, objects, fieldInfo } = gameState;
      const dirs = [
        [-1, 0],
        [0, -1],
        [0, 1],
        [1, 0],
      ];

      if (player.fieldIn && !player.attacked.length) {
        const f = fieldInfo[player.fieldIn];
        objects.flames.push(
          new Flame(player.fieldIn, player.flowerIn.x, player.flowerIn.z),
        );

        for (const d of dirs) {
          for (let i = 1; i < 2; i++) {
            const x = d[0] * i + player.flowerIn.x;
            const z = d[1] * i + player.flowerIn.z;
            if (x >= 0 && x < f.width && z >= 0 && z < f.length) {
              objects.flames.push(new Flame(player.fieldIn, x, z));
            }
          }
        }
      } else {
        objects.flames.push(
          new Flame(
            player.body.position.x,
            player.body.position.y,
            player.body.position.z,
            true,
          ),
        );

        for (const d of dirs) {
          for (let i = 1; i < 2; i++) {
            const x = d[0] * i;
            const z = d[1] * i;
            objects.flames.push(
              new Flame(
                player.body.position.x + x,
                player.body.position.y,
                player.body.position.z + z,
                true,
              ),
            );
          }
        }
      }
    },

    getMessage: () =>
      "Ignite\nEvery 10 red ability tokens collected summons 5 flames in a + shape, lasting for 3 secs. Each flame collects 9R/5W/2B pollen from nearby flowers and deals 15 damage to nearby enemies every sec.",
  },

  bubbleBombsPassive: {
    isPassive: true,
    maxCooldown: 0.5,
    triggerVal: 10,
    triggerType: "bombTokens",
    currentVal: 0,
    currentCooldown: 0,
    startVal: 0,

    activate(gameState) {
      const { player, objects, fieldInfo } = gameState;

      if (player.fieldIn) {
        const f = fieldInfo[player.fieldIn];
        for (let i = 0; i < 3; i++) {
          objects.bubbles.push(
            new Bubble(
              player.fieldIn,
              (Math.random() * f.width) | 0,
              (Math.random() * f.length) | 0,
            ),
          );
        }
      }
    },

    getMessage: () =>
      "Bubble Bombs\nEvery 10 blue bomb tokens collected summons 3 bubbles around the field, lasting for 10 secs. Each bubble collects 2R/6W/10B pollen from nearby flowers and replenish them when popped.",
  },

  coinScatterPassive: {
    isPassive: true,
    maxCooldown: 45,
    triggerVal: 20,
    triggerType: "markTokens",
    currentVal: 0,
    currentCooldown: 0,
    startVal: 0,

    activate(gameState) {
      const { player, objects, fieldInfo } = gameState;

      if (player.fieldIn) {
        const f = fieldInfo[player.fieldIn];
        const amc = Math.min(Math.ceil(player.convertTotal * 3), player.pollen);

        if (amc <= 0) return;

        player.pollen -= amc;

        const amountPerToken = Math.ceil(amc / 24);

        for (let i = 0; i < 24; i++) {
          objects.tokens.push(
            new LootToken(
              30,
              [
                f.x + ((Math.random() * f.width) | 0),
                f.y + 1,
                f.z + ((Math.random() * f.length) | 0),
              ],
              "honey",
              amountPerToken,
              false,
              "Coin Scatter",
            ),
          );
        }
      }
    },

    getMessage: () =>
      "Coin Scatter\nConverts 300% of the player's convert total into 24 honey tokens, which are scattered randomly in the field. Cooldown: 45s",
  },

  diamondDrainPassive: {
    isPassive: true,
    maxCooldown: 35,
    triggerVal: 35,
    triggerType: "blueAbilityTokens",
    currentVal: 0,
    currentCooldown: 0,
    startVal: 0,

    activate(gameState) {
      const { player, objects, fieldInfo } = gameState;

      if (player.fieldIn) {
        const f = fieldInfo[player.fieldIn];
        objects.mobs.push(new DrainingDiamond());

        for (let i = 0; i < 15; i++) {
          const x = (Math.random() * f.width) | 0;
          const z = (Math.random() * f.length) | 0;

          // CHQ: TODO — old per-cell pollination bump via updateFlower.
          // Needs a real FieldManager method (e.g.
          // fieldManager.pollinateFlower(field, x, z)) since the
          // per-flower `.level`/`.pollinationTimer` model doesn't exist
          // in the current flat flowers[fieldId] array yet.
          gameState.fieldManager?.pollinateFlower?.(player.fieldIn, x, z);

          for (let j = 0; j < 6; j++) {
            ParticleRenderer.add({
              x: x + f.x,
              y: f.y + 0.5,
              z: z + f.z,
              vx: MATH.random(-1, 1),
              vy: Math.random() * 2,
              vz: MATH.random(-1, 1),
              grav: -3,
              size: 100,
              col: [1, 1, MATH.random(0.6, 1)],
              life: 2.5,
              rotVel: MATH.random(-3, 3),
              alpha: 2,
            });
          }
        }
      }
    },

    getMessage: () =>
      "Diamond Drain\nEvery 35th blue ability token summons a diamond that converts your convert total of pollen into honey. Honey converted is multiplied by 2x, and the diamond pollinates 15 flowers in the field. Cooldown: 35s",
  },

  gummyMorphPassive: {
    isPassive: true,
    maxCooldown: 25,
    triggerVal: 30,
    triggerType: "gummyMorph",
    currentVal: 0,
    currentCooldown: 0,
    startVal: 0,

    activate(gameState) {
      const { player } = gameState;
      player.addEffect("gummyMorph");

      if (player.fieldIn) {
        // CHQ: TODO — replaces the old flowers[fieldIn] full-grid
        // updateFlower walk. Needs a FieldManager method, e.g.
        // fieldManager.gooifyAllFlowers(fieldId), see conversion notes.
        gameState.fieldManager?.gooifyAllFlowers?.(player.fieldIn);
      }
    },

    getMessage: () =>
      "Gummy Morph\nEvery 10 gummy bee tokens or 30 gumdrops used covers the field in goo and grants x1.75 goo, 100% instant goo conversion, +30 walkspeed and +3 jump power for 10s. Cooldown: 25s",
  },

  redPulse: {
    desc: "Activates a red pulse, hopping to every red bee twice, collecting 4(+0.5 for every hop) pollen from 25 flowers. Pollen collection increases with each hop. If the player owns a Cobalt Bee, a blue pulse is fired as well.",
    trialCooldown: 25,
    trialRate: 0.6,
    statsToAddTo: ["redAbilityTokens"],
    u: (128 * 1) / 2048,
    v: (128 * 6) / 2048,
    tokenLife: 12,

    func: function (params, gameState) {
      const { player, objects } = gameState;
      objects.mobs.push(new Pulse("red"));

      if (player.ownsCobaltBee) {
        objects.mobs.push(new Pulse("blue"));
      }
    },
  },

  bluePulse: {
    desc: "Activates a blue pulse, hopping to every red bee twice, collecting 4(+0.5 for every hop) pollen from 25 flowers. Pollen collection increases with each hop. If the player owns a Crimson Bee, a red pulse is fired as well.",
    trialCooldown: 25,
    trialRate: 0.6,
    statsToAddTo: ["blueAbilityTokens"],
    u: (128 * 2) / 2048,
    v: (128 * 6) / 2048,
    tokenLife: 12,

    func: function (params, gameState) {
      const { player, objects } = gameState;
      objects.mobs.push(new Pulse("blue"));

      if (player.ownsCrimsonBee) {
        objects.mobs.push(new Pulse("red"));
      }
    },
  },

  redBombSync: {
    desc: "Allows red bombs to collect 7.5(10 if Red Bomb+) pollen from white flowers. If blue bomb sync is active, applies to blue flowers as well, collecting 5(7.5 if Red Bomb+) blue pollen.",
    trialCooldown: 35,
    trialRate: 0.7,
    statsToAddTo: ["redAbilityTokens", "redBombTokens"],
    u: (128 * 3) / 2048,
    v: (128 * 6) / 2048,
    maxCooldown: 25,
    maxAmount: 1,
    tokenLife: 24,

    update: (amount, player) => {
      player.redBombSync = true;
    },

    getMessage: () =>
      "Red Bomb Sync\nAllows red bombs to collect from white flowers. If blue bomb sync is active, applies to blue flowers aswell.",
  },

  blueBombSync: {
    desc: "Allows blue bombs to collect 7.5(10 if Blue Bomb+) pollen from white flowers. If red bomb sync is active, applies to red flowers as well, collecting 5(7.5 if Blue Bomb+) red pollen.",
    trialCooldown: 35,
    trialRate: 0.7,
    statsToAddTo: ["blueAbilityTokens", "blueBombTokens"],
    u: (128 * 4) / 2048,
    v: (128 * 6) / 2048,
    maxCooldown: 25,
    maxAmount: 1,
    tokenLife: 24,

    update: (amount, player) => {
      player.blueBombSync = true;
    },

    getMessage: () =>
      "Blue Bomb Sync\nAllows blue bombs to collect from white flowers. If red bomb sync is active, applies to red flowers aswell.",
  },

  beamStorm: {
    desc: "Summons 25(+2 per bee lvl) beams of light, each collecting all pollen from a patch of flowers. If this bee is gifted, the pollen is instantly converted.",
    trialCooldown: 30,
    trialRate: 0.4,
    statsToAddTo: [],
    u: (128 * 5) / 2048,
    v: (128 * 6) / 2048,
    tokenLife: 12,

    func: function (params, gameState) {
      const { player, objects } = gameState;

      if (player.fieldIn) {
        player.beamStormRayData = [];

        for (let i = 0; i < 25 + params.bee.level * 2; i++) {
          objects.mobs.push(new Beam(params, i * 0.075, player.fieldIn));
        }
      }
    },
  },

  rainCloud: {
    desc: "Applies a stack of White Boost and summons a cloud in a field, lasting for 60s(+5s per bee lvl). There is a 25% chance of the cloud spawning in your current field, or else a random field is chosen.<br><br>Clouds float around the field, replenishing flowers. Standing under a cloud grants Cloud Boost, granting x1.15(x1.25 if you own a gifted windy bee) pollen for 7.5s.",
    trialCooldown: 60,
    trialRate: 0.5,
    statsToAddTo: [],
    u: (128 * 6) / 2048,
    v: (128 * 6) / 2048,
    tokenLife: 24,

    func: function (params, gameState) {
      const { player, objects, fieldInfo } = gameState;

      player.addEffect("whiteBoost");

      let f = Math.random() < 0.25 && player.fieldIn ? player.fieldIn : 0;

      if (!f) {
        const keys = [];
        for (const i in fieldInfo) keys.push(i);
        f = keys[(Math.random() * keys.length) | 0];
      }

      objects.mobs.push(
        new Cloud(
          f,
          (Math.random() * fieldInfo[f].width) | 0,
          (Math.random() * fieldInfo[f].length) | 0,
          60 + params.bee.level * 5,
        ),
      );

      player.addMessage(
        "☁️Your windy bee made a cloud in the " + MATH.doGrammar(f) + "!☁️",
      );
    },
  },

  tornado: {
    desc: "Applies a stack of White Boost and summons a tornado in the field, lasting for 7.5s(+0.5s per bee lvl)(+1s per haste stack). The tornado is improved based on the amount of haste stacks you had when it was summoned.<br><br>The tornado moves around at the speed of 1(+0.05 per bee lvl)(+0.25 per haste stack) flowers per second, picking up tokens, popping bubbles and fuzz bombs, and also collects 7 pollen from 21 flowers every 0.25s.",
    trialCooldown: 75,
    trialRate: 0.5,
    statsToAddTo: [],
    u: (128 * 7) / 2048,
    v: (128 * 6) / 2048,
    tokenLife: 24,

    func: function (params, gameState) {
      const { player, objects } = gameState;
      player.addEffect("whiteBoost");

      if (player.fieldIn) {
        objects.mobs.push(new Tornado(params.bee.level));
      }
    },
  },

  cloudBoost: {
    u: (128 * 5) / 2048,
    v: 128 / 2048,
    maxCooldown: 7.5,
    tokenLife: 4,
    amountFromCooldown: true,

    update: (amount, player) => {
      player.redPollen *= player.cloudBoostAmount;
      player.bluePollen *= player.cloudBoostAmount;
      player.whitePollen *= player.cloudBoostAmount;
    },

    getMessage: (amount, player) =>
      "Cloud Boost\nx" +
      player.cloudBoostAmount +
      "  pollen" +
      (player.cloudBoostAmount > 1.25
        ? "(you have gifted windy bee, so x1.25, not x1.15)"
        : ""),
  },

  scratch: {
    desc: "Collects 40(+1.5 per bee lvl) pollen from 12 flowers.",
    trialCooldown: 35,
    trialRate: 0.333,
    statsToAddTo: [],
    u: (128 * 4) / 2048,
    v: (128 * 7) / 2048,
    tokenLife: 12,

    func: function (params, gameState) {
      const { player, objects } = gameState;
      if (player.fieldIn) {
        objects.mobs.push(new Scratch(params.bee, params.x, params.z));
      }
    },
  },

  tabbyLove: {
    desc: 'Grants x1.04 Tabby Bee convert rate, Tabby Bee gather amount, and pollen from "Scratch". Stacks up to 250x, for a maximum of x11 Tabby Bee convert rate, Tabby Bee gather amount, and pollen from Scratch.',
    trialCooldown: 65,
    trialRate: 0.9,
    statsToAddTo: [],
    u: (128 * 5) / 2048,
    v: (128 * 7) / 2048,
    maxCooldown: Infinity,
    maxAmount: 250,
    tokenLife: 16,

    update: (amount, player) => {
      player.tabbyLoveStacks = amount * 0.04 + 1;
    },

    getMessage: (amount, player) =>
      "Tabby Love\nx" +
      player.tabbyLoveStacks +
      " Tabby Bee convert rate\nx" +
      player.tabbyLoveStacks +
      " Tabby Bee gather amount\nx" +
      player.tabbyLoveStacks +
      ' pollen from "Scratch"',
  },

  impale: {
    desc: "Summons a spike per bee lvl, attacking a random enemy. Each spike deals damage equal to 5% of the enemy's health + the bee's attack. The damage is heavily reduced is past 1,000, and can vary between x0.74 to x1.35. Multiple spikes targeting an enemy reduces damage by up to 75%.",
    trialCooldown: 35,
    trialRate: 0.8,
    statsToAddTo: ["blueAbilityTokens", "attackTokens"],
    u: (128 * 6) / 2048,
    v: (128 * 9) / 2048,
    tokenLife: 24,

    func: function (params, gameState) {
      const { objects } = gameState;
      for (let i = 0; i < params.bee.level; i++) {
        window.setTimeout(function () {
          objects.mobs.push(new Spike(params.bee));
        }, 300 * i);
      }
    },
  },

  comfortingNectar: {
    u: (128 * 5) / 2048,
    v: 128 / 2048,
    hideAmount: true,
    maxCooldown: 60 * 60 * 6,
    tokenLife: 4,
    amountFromCooldown: true,
    update: (amount, player) => {
      player.whiteConvertRate *= (amount * 0.9 + 1.1).toFixed(2);
      player.bluePollen *= (amount * 0.45 + 1.05).toFixed(2);
      player.convertRateAtHive *= (amount * 0.9 + 1.1).toFixed(2);
      player.honeyPerPollen *= (amount * 0.04 + 1.01).toFixed(2);
    },
    getMessage: (amount) =>
      "Comforting Nectar\nx" +
      (amount * 0.9 + 1.1).toFixed(2) +
      " white bee convert rate\nx" +
      (amount * 0.45 + 1.05).toFixed(2) +
      " blue pollen\nx" +
      (amount * 0.9 + 1.1).toFixed(2) +
      " convert rate at hive\nx" +
      (amount * 0.04 + 1.01).toFixed(2) +
      " honey per pollen",
  },

  invigoratingNectar: {
    u: (128 * 5) / 2048,
    v: 128 / 2048,
    hideAmount: true,
    maxCooldown: 60 * 60 * 6,
    tokenLife: 4,
    amountFromCooldown: true,
    update: (amount, player) => {
      player.convertRate *= (amount * 0.45 + 1.05).toFixed(2);
      player.redPollen *= (amount * 0.45 + 1.05).toFixed(2);
      player.convertRateAtHive *= (amount * 0.09 + 1.01).toFixed(2);
      player.honeyPerPollen *= (amount * 0.04 + 1.01).toFixed(2);
    },
    getMessage: (amount) =>
      "Invigorating Nectar\nx" +
      (amount * 0.45 + 1.05).toFixed(2) +
      " convert rate\nx" +
      (amount * 0.45 + 1.05).toFixed(2) +
      " red pollen\nx" +
      (amount * 0.09 + 1.01).toFixed(2) +
      " bee attack\nx" +
      (amount * 0.04 + 1.01).toFixed(2) +
      " honey per pollen",
  },

  motivatingNectar: {
    u: (128 * 5) / 2048,
    v: 128 / 2048,
    hideAmount: true,
    maxCooldown: 60 * 60 * 6,
    tokenLife: 4,
    amountFromCooldown: true,
    update: (amount, player) => {
      player.convertRate *= (amount * 0.45 + 1.05).toFixed(2);
      player.bluePollen *= (amount * 0.45 + 1.05).toFixed(2);
      player.redBeeAbilityRate *= (amount * 0.04 + 1.01).toFixed(2);
      player.whiteBeeAbilityRate *= (amount * 0.04 + 1.01).toFixed(2);
      player.blueBeeAbilityRate *= (amount * 0.04 + 1.01).toFixed(2);
      player.honeyPerPollen *= (amount * 0.04 + 1.01).toFixed(2);
    },
    getMessage: (amount) =>
      "Motivating Nectar\nx" +
      (amount * 0.45 + 1.05).toFixed(2) +
      " convert rate\nx" +
      (amount * 0.45 + 1.05).toFixed(2) +
      " blue pollen\nx" +
      (amount * 0.04 + 1.01).toFixed(2) +
      " bee ability rate\nx" +
      (amount * 0.04 + 1.01).toFixed(2) +
      " honey per pollen",
  },

  refreshingNectar: {
    u: (128 * 5) / 2048,
    v: 128 / 2048,
    hideAmount: true,
    maxCooldown: 60 * 60 * 6,
    tokenLife: 4,
    amountFromCooldown: true,
    update: (amount, player) => {
      player.blueConvertRate *= (amount * 0.9 + 1.1).toFixed(2);
      player.redPollen *= (amount * 0.45 + 1.05).toFixed(2);
      player.beeEnergy *= (amount * 0.45 + 1.05).toFixed(2);
      player.honeyPerPollen *= (amount * 0.04 + 1.01).toFixed(2);
    },
    getMessage: (amount) =>
      "Refreshing Nectar\nx" +
      (amount * 0.9 + 1.1).toFixed(2) +
      " blue bee convert rate\nx" +
      (amount * 0.45 + 1.05).toFixed(2) +
      " red pollen\nx" +
      (amount * 0.45 + 1.05).toFixed(2) +
      " bee energy\nx" +
      (amount * 0.04 + 1.01).toFixed(2) +
      " honey per pollen",
  },

  satisfyingNectar: {
    u: (128 * 5) / 2048,
    v: 128 / 2048,
    hideAmount: true,
    maxCooldown: 60 * 60 * 6,
    tokenLife: 4,
    amountFromCooldown: true,
    update: (amount, player) => {
      player.redConvertRate *= (amount * 0.9 + 1.1).toFixed(2);
      player.whitePollen *= (amount * 0.9 + 1.1).toFixed(2);
      player.honeyAtHive *= (amount * 0.45 + 1.05).toFixed(2);
      player.honeyPerPollen *= (amount * 0.04 + 1.01).toFixed(2);
    },
    getMessage: (amount) =>
      "Satisfying Nectar\nx" +
      (amount * 0.9 + 1.1).toFixed(2) +
      " red bee convert rate\nx" +
      (amount * 0.9 + 1.1).toFixed(2) +
      " white pollen\nx" +
      (amount * 0.45 + 1.05).toFixed(2) +
      " honey at hive\nx" +
      (amount * 0.04 + 1.01).toFixed(2) +
      " honey per pollen",
  },

  corruption: {
    u: 0,
    v: 0,
    maxCooldown: 0,
    tokenLife: 4,
    maxAmount: 100,

    update: (amount, player) => {
      player.abilityDuplicationChance += amount * 0.001 + 0.05;
    },

    getMessage: (amount) =>
      "Corruption\n+" +
      ((amount * 0.1 + 5) | 0) +
      "% ability duplication chance",
  },

  glitch: {
    desc: "Corrupts a random field 15x(+0.5x per bee lvl)(+ up to 15x depending on the bee's drives). Corruption stacks up to 100x, and standing in corrupted fields grant 5% to 15% ability dupication chance.<br><br>Ability dupication chance allows ability tokens to be duped, being reposition somewhere else on the field, lasting for x2(+0.1x per bee lvl) the original token's lifespan.<br><br>Standing under duped tokens for 1s will activate them. There is a 10%(+0.1% per glitched drive) that the duped token will become a ☺ token. ☺ tokens activate all duped tokens, add 3x corruption to the field, and collect x3 the bee's gather amount of pollen, instantly converting 50%. The pollen is multiplied by 25% for each duped token collected.",
    trialCooldown: 120,
    trialRate: 0.35,
    u: (128 * 7) / 2048,
    v: (128 * 9) / 2048,
    tokenLife: 8,

    func: function (params, gameState) {
      const { player, objects, fieldInfo } = gameState;
      const f = fieldInfo[params.field];

      f.corruption = Math.min(
        f.corruption +
          15 +
          params.bee.level * 0.5 +
          (((f.generalColorComp.r * player.extraInfo.drives.red) / 50 +
            (f.generalColorComp.w * player.extraInfo.drives.white) / 50 +
            (f.generalColorComp.b * player.extraInfo.drives.blue) / 50 +
            player.extraInfo.drives.glitched / 50) *
            15) /
            4,
        100,
      );

      objects.mobs.push(new GlitchEffect(params.field, 5));
    },
  },

  mindHack: {
    desc: "Stuns 3(+1 every 4 bee lvls) random nearby enemies for 3s(+0.1s per bee lvl). Stunned enemies take x1.25 damage.",
    trialCooldown: 25,
    trialRate: 0.4,
    u: (128 * 0) / 2048,
    v: (128 * 10) / 2048,
    tokenLife: 16,

    func: function (params, gameState) {
      const { player } = gameState;
      const m = [];

      for (const i in player.attacked) m.push(player.attacked[i]);

      for (let i = 0; i < 3 + params.bee.level * 0.25 && m.length; i++) {
        const r = (Math.random() * m.length) | 0;
        m[r].mindHacked = 3 + params.bee.level * 0.1;
        m.splice(r, 1);
      }
    },
  },

  mapCorruption: {
    desc: "Corrupts a random field you're not in by 30x(+2x per bee lvl)(+ up to 15x depending on the bee's drives and the field's color).",
    trialCooldown: 100,
    trialRate: 0.25,
    u: (128 * 1) / 2048,
    v: (128 * 10) / 2048,
    tokenLife: 8,

    func: function (params, gameState) {
      const { player, objects, fieldInfo } = gameState;
      const keys = [];

      for (const i in fieldInfo) keys.push(i);
      keys.splice(keys.indexOf(params.field), 1);

      const f = keys[(Math.random() * keys.length) | 0];
      const target = fieldInfo[f];

      target.corruption = Math.min(
        target.corruption +
          30 +
          params.bee.level * 2 +
          (((target.generalColorComp.r * player.extraInfo.drives.red) / 50 +
            (target.generalColorComp.w * player.extraInfo.drives.white) / 50 +
            (target.generalColorComp.b * player.extraInfo.drives.blue) / 50 +
            player.extraInfo.drives.glitched / 50) *
            15) /
            4,
        100,
      );

      objects.mobs.push(new GlitchEffect(f, 5));

      player.addMessage(
        "Your Digital Bee corrupted the" + MATH.doGrammar(f) + "!",
        [255 * 0.5, 0, 200 * 0.5],
      );
    },
  },

  smiley: {
    trialCooldown: 0,
    trialRate: 0,
    u: (128 * 2) / 2048,
    v: (128 * 10) / 2048,
    tokenLife: 12,

    func: function (params, gameState) {
      const { objects, fieldInfo } = gameState;
      let tokensCollected = 0;

      for (const i in objects.tokens) {
        if (objects.tokens[i] instanceof DupedToken) {
          objects.tokens[i].collect();
          tokensCollected++;
        }
      }

      if (params.field) {
        const f = fieldInfo[params.field];
        f.corruption = Math.min(f.corruption + 3, 100);

        collectPollen(
          {
            x: params.x,
            z: params.z,
            pattern: [
              [-4, 0],
              [-4, 1],
              [-4, 2],
              [-3, 3],
              [-2, 4],
              [-1, 4],
              [0, 4],
              [1, 4],
              [2, 4],
              [3, 3],
              [4, 2],
              [4, 1],
              [4, 0],
              [4, -1],
              [4, -2],
              [3, -3],
              [2, -4],
              [1, -4],
              [0, -4],
              [-1, -4],
              [-2, -4],
              [-3, -3],
              [-4, -2],
              [-4, -1],
              [-1, -1],
              [1, -1],
              [2, 1],
              [1, 2],
              [0, 2],
              [-1, 2],
              [-2, 1],
            ],
            amount: params.bee.gatherAmount * 3,
            stackOffset: 0.4 + Math.random() * 0.5,
            multiplier: tokensCollected * 0.25 + 1,
            instantConversion: 0.5,
            field: params.field,
          },
          gameState,
        );

        objects.mobs.push(new GlitchEffect(params.field, 2));
      }
    },
  },

  redJellyBean: {
    u: (128 * 4) / 2048,
    v: (128 * 11) / 2048,
    maxCooldown: 60,
    maxAmount: 3,
    tokenLife: 16,
    update: (amount, player) => {
      player.redPollen *= 0.075 * amount + 1.1;
    },
    getMessage: (amount) =>
      "Red Jelly Bean\nx" + (0.075 * amount + 1.1).toFixed(2) + " red pollen",
  },

  whiteJellyBean: {
    u: (128 * 5) / 2048,
    v: (128 * 11) / 2048,
    maxCooldown: 60,
    maxAmount: 3,
    tokenLife: 16,
    update: (amount, player) => {
      player.whitePollen *= 0.075 * amount + 1.1;
    },
    getMessage: (amount) =>
      "White Jelly Bean\nx" +
      (0.075 * amount + 1.1).toFixed(2) +
      " white pollen",
  },

  blueJellyBean: {
    u: (128 * 6) / 2048,
    v: (128 * 11) / 2048,
    maxCooldown: 60,
    maxAmount: 3,
    tokenLife: 16,
    update: (amount, player) => {
      player.bluePollen *= 0.075 * amount + 1.1;
    },
    getMessage: (amount) =>
      "Blue Jelly Bean\nx" + (0.075 * amount + 1.1).toFixed(2) + " blue pollen",
  },

  pinkJellyBean: {
    u: (128 * 7) / 2048,
    v: (128 * 11) / 2048,
    maxCooldown: 60,
    maxAmount: 3,
    tokenLife: 16,
    update: (amount, player) => {
      player.pollenFromBees *= 0.075 * amount + 1.1;
    },
    getMessage: (amount) =>
      "Pink Jelly Bean\nx" +
      (0.075 * amount + 1.1).toFixed(2) +
      " pollen from bees",
  },

  brownJellyBean: {
    u: (128 * 0) / 2048,
    v: (128 * 12) / 2048,
    maxCooldown: 60,
    maxAmount: 3,
    tokenLife: 16,
    update: (amount, player) => {
      player.pollenFromTools *= 0.075 * amount + 1.1;
    },
    getMessage: (amount) =>
      "Brown Jelly Bean\nx" +
      (0.075 * amount + 1.1).toFixed(2) +
      " pollen from tools",
  },

  greenJellyBean: {
    u: (128 * 1) / 2048,
    v: (128 * 12) / 2048,
    maxCooldown: 60,
    maxAmount: 3,
    tokenLife: 16,
    update: (amount, player) => {
      player.criticalChance += 0.01 * amount + 0.03;
    },
    getMessage: (amount) =>
      "Green Jelly Bean\n+" + (amount + 3) + "% critical chance",
  },

  blackJellyBean: {
    u: (128 * 2) / 2048,
    v: (128 * 12) / 2048,
    maxCooldown: 60,
    maxAmount: 3,
    tokenLife: 16,
    update: (amount, player) => {
      player.whiteBombPollen *= 0.075 * amount + 1.1;
      player.redBombPollen *= 0.075 * amount + 1.1;
      player.blueBombPollen *= 0.075 * amount + 1.1;
    },
    getMessage: (amount) =>
      "Black Jelly Bean\nx" +
      (0.075 * amount + 1.1).toFixed(2) +
      " bomb pollen",
  },

  yellowJellyBean: {
    u: (128 * 3) / 2048,
    v: (128 * 12) / 2048,
    maxCooldown: 60,
    maxAmount: 3,
    tokenLife: 16,
    update: (amount, player) => {
      player.instantWhiteConversion = MATH.applyPercentage(
        player.instantWhiteConversion,
        0.05 * amount + 0.1,
      );
      player.instantRedConversion = MATH.applyPercentage(
        player.instantRedConversion,
        0.05 * amount + 0.1,
      );
      player.instantBlueConversion = MATH.applyPercentage(
        player.instantBlueConversion,
        0.05 * amount + 0.1,
      );
    },
    getMessage: (amount) =>
      "Yellow Jelly Bean\n+" + (5 * amount + 10) + "% instant conversion",
  },

  roboChallengeBuff: {
    u: 0,
    v: 0,
    maxCooldown: 1.5 * 60,
    tokenLife: 4,
    maxAmount: 1,

    update: "",
    getMessage: "",
  },

  redDriveBuff: {
    u: 0,
    v: 0,
    maxCooldown: 1.5 * 60,
    tokenLife: 4,
    maxAmount: 1,
    update: (amount, player) => {
      player.redPollen *= 1.25;
      player.redFieldCapacity *= 1.25;
      player.redBeeAttack++;
    },
    getMessage: () =>
      "Red Drive\nx1.25 red pollen\nx1.25 red field capacity\n+1 red bee attack",
  },

  blueDriveBuff: {
    u: 0,
    v: 0,
    maxCooldown: 1.5 * 60,
    tokenLife: 4,
    maxAmount: 1,
    update: (amount, player) => {
      player.bluePollen *= 1.25;
      player.blueFieldCapacity *= 1.25;
      player.blueBeeAttack++;
    },
    getMessage: () =>
      "Blue Drive\nx1.25 blue pollen\nx1.25 blue field capacity\n+1 blue bee attack",
  },

  whiteDriveBuff: {
    u: 0,
    v: 0,
    maxCooldown: 1.5 * 60,
    tokenLife: 4,
    maxAmount: 1,
    update: (amount, player) => {
      player.whitePollen *= 1.25;
      player.whiteFieldCapacity *= 1.25;
      player.whiteBeeAttack++;
    },
    getMessage: () =>
      "White Drive\nx1.25 white pollen\nx1.25 white field capacity\n+1 white bee attack",
  },

  glitchedDriveBuff: {
    u: 0,
    v: 0,
    maxCooldown: 1.5 * 60,
    tokenLife: 4,
    maxAmount: 1,
    update: (amount, player) => {
      player.redPollen *= 1.25;
      player.bluePollen *= 1.25;
      player.whitePollen *= 1.25;
      player.capacity *= 1.25;
      player.whiteBeeAttack++;
      player.blueBeeAttack++;
      player.redBeeAttack++;
    },
    getMessage: () =>
      "Glitched Drive\nx1.25 pollen\nx1.25 capacity\n+1 bee attack",
  },

  antChallenge: {
    u: 0,
    v: 0,
    maxCooldown: 5 * 60,
    tokenLife: 4,
    maxAmount: 1,
    update: (amount, player) => {
      player.instantRedConversion = 1;
      player.instantWhiteConversion = 1;
      player.instantBlueConversion = 1;
    },
    getMessage: () => "Ant Challenge\n+100% instant conversion",
  },

  bearMorph: {
    u: 0,
    v: 0,
    maxCooldown: 30,
    maxAmount: 1,
    update: (amount, player) => {
      player.redPollen *= 1.25;
      player.bluePollen *= 1.25;
      player.whitePollen *= 1.25;
      player.walkSpeed *= 1.1;
      player.jumpPower *= 1.2;
    },
    getMessage: () =>
      "Bear Morph\nx1.25 pollen\nx1.1 walkspeed\nx1.2 jump power",
  },

  bearMorph_: {
    u: 0,
    v: 0,
    maxCooldown: 30,
    maxAmount: 1,
    update: (amount, player) => {
      player.redPollen *= 1.25;
      player.bluePollen *= 1.25;
      player.whitePollen *= 1.25;
      player.pollenFromBees *= 1.25;
      player.pollenFromTools *= 1.25;
      player.convertRate *= 1.5;
      player.walkSpeed *= 1.1;
      player.jumpPower *= 1.2;
    },
    getMessage: () =>
      "Bear Morph+\nx1.25 pollen\nx1.5 convert rate\nx1.25 pollen from bees\nx1.25 pollen from tools\nx1.1 walkspeed\nx1.2 jump power",
  },

  bearMorphToken: {
    desc: "Grants x1.25 pollen, x1.1 walkspeed, and x1.2 jump power for 10s. If the bee is gifted, this has a 20%(+1% per lvl) to grant an additional x1.5 convert rate, x1.25 pollen from bees, and x1.25 pollen from tools.",
    trialCooldown: 120,
    trialRate: 0.25,
    u: (128 * 3) / 2048,
    v: (128 * 13) / 2048,
    tokenLife: 16,

    func: function (params, gameState) {
      const { player } = gameState;
      if (Math.random() < 0.2 + params.bee.level * 0.01) {
        player.addEffect("bearMorph_");
      } else {
        player.addEffect("bearMorph");
      }
    },
  },

  fetch: {
    desc: "Summons a ball and starts a game of fetch. When you kick the ball, puppy bee will kick it back. The ball collects 5(+0.5 per lvl) pollen from 1 flower, picks up tokens, and more while it rolls. Every 4th hit will reward treats, with the amount of treats doubling every time. Treat rewards are stopped at 128.",
    trialCooldown: 70,
    trialRate: 0.15,
    u: (128 * 4) / 2048,
    v: (128 * 13) / 2048,
    tokenLife: 8,

    func: function (params, gameState) {
      const { objects, fieldInfo } = gameState;
      const f = fieldInfo[params.field];
      const ball = new FetchBall(
        [f.x + params.x, f.y + 1, f.z + params.z],
        params.bee,
      );

      objects.mobs.push(ball);
      params.bee.fetchBall = ball;
    },
  },

  puppyLove: {
    desc: "Grants all bees in the hive 75(+20 per lvl) bond.",
    trialCooldown: 30,
    trialRate: 0.2,
    u: (128 * 5) / 2048,
    v: (128 * 13) / 2048,
    tokenLife: 8,

    func: function (params, gameState) {
      const { player, objects, fieldInfo, textRenderer } = gameState;
      const f = fieldInfo[params.field];

      objects.explosions.push(
        new Explosion({
          col: [1, 1, 1],
          pos: [f.x + params.x, f.y + 0.5, f.z + params.z],
          life: 0.5,
          size: 6,
          speed: 0.25,
          aftershock: 0.05,
        }),
      );

      for (const y in player.hive) {
        for (const x in player.hive[y]) {
          if (player.hive[y][x].type) {
            const bond = 75 + params.bee.level * 20;
            const beePos = player.hive[y][x].bee.pos.slice();

            player.hive[y][x].bond += bond;

            textRenderer.add(
              bond + "",
              [beePos[0], beePos[1] + 1, beePos[2]],
              COLORS.bondArr,
              0,
              "+",
              1.5,
            );
          }
        }
      }
    },
  },

  festiveCheer: {
    u: (128 * 6) / 2048,
    v: (128 * 13) / 2048,
    maxCooldown: 10,
    maxAmount: 1,

    update: (amount, player) => {
      player.convertRate *= 2;
      player.instantRedConversion = MATH.applyPercentage(
        player.instantRedConversion,
        1,
      );
      player.instantWhiteConversion = MATH.applyPercentage(
        player.instantWhiteConversion,
        1,
      );
      player.instantBlueConversion = MATH.applyPercentage(
        player.instantBlueConversion,
        1,
      );
    },

    getMessage: () =>
      "Festive Cheer\n+100% instant conversion\nx2 convert rate",
  },

  festiveGifts: {
    desc: "Creates a ring of 7(+1 per 4 lvls) gifts and grants Festive Cheer. Festive Cheer applies +100% instant conversion and x2 convert rate for 10s. Gifts given can include<br><br>• Common Gifts: honey, red boost tokens, treats, fruits, royal jelly, gumdrops.<br><br>• Rare Gifts: tickets, extracts, micro-converters, and magic beans.<br><br>• If the bee is gifted, these additional gifts maybe rewarded: glitter, oil, enzymes, and field dice.",
    trialCooldown: 100,
    trialRate: 0.05,
    u: (128 * 6) / 2048,
    v: (128 * 13) / 2048,
    tokenLife: 8,

    func: function (params, gameState) {
      const { player, objects, fieldInfo } = gameState;

      player.addEffect("festiveCheer");
      player.addMessage(
        "🎁 Festive Bee created festive gifts! 🎁",
        COLORS.redArr,
      );

      const amountOfTokens = (7 + params.bee.level * 0.25) | 0;
      const radius = amountOfTokens * 0.2 + 1.75;

      let dropTable = [
        "redBoost",
        "redBoost",
        "redBoost",
        "treat",
        "treat",
        "strawberry",
        "blueberry",
        "sunflowerSeed",
        "pineapple",
        "honey",
        "honey",
        "gumdrops",
        "royalJelly",
      ];

      dropTable = [
        ...dropTable,
        ...dropTable,
        ...dropTable,
        "ticket",
        "redExtract",
        "blueExtract",
        "microConverter",
        "magicBean",
      ];

      if (params.bee.gifted) {
        dropTable = [
          ...dropTable,
          ...dropTable,
          ...dropTable,
          "glitter",
          "oil",
          "enzymes",
          "fieldDice",
          "starJelly",
        ];
      }

      const f = fieldInfo[params.field];
      const x = f.x + params.x;
      const y = f.y + 1;
      const z = f.z + params.z;

      for (
        let i = 0, inc = MATH.TWO_PI / amountOfTokens;
        i < MATH.TWO_PI;
        i += inc
      ) {
        const ty = dropTable[(Math.random() * dropTable.length) | 0];

        if (ty === "redBoost") {
          objects.tokens.push(
            new Token(
              30,
              [x + Math.cos(i) * radius, y, z + Math.sin(i) * radius],
              "redBoost",
              {},
              true,
            ),
          );
        } else {
          objects.tokens.push(
            new LootToken(
              30,
              [x + Math.cos(i) * radius, y, z + Math.sin(i) * radius],
              ty,
              ty === "honey"
                ? (Math.random() * params.bee.level + params.bee.level) *
                    params.bee.level *
                    50 +
                    2500
                : 1,
              true,
              MATH.doGrammar(params.bee.type),
              // CHQ: original used `this.type` here, which pointed at
              // `undefined` inside a plain function expression (no bound
              // `this`) — almost certainly a pre-existing bug. Left as
              // `params.bee.type` (the bee that triggered the gift),
              // which is what the label is presumably meant to show.
            ),
          );
        }
      }
    },
  },
};
