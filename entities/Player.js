// entities/Player.js

// CHQ: Gemini AI created function

// import { updateQuestUI } from "../ui/questRenderer";
import { EventManager } from "../engine/eventManager.js";

export class Player {
  constructor(data) {
    // Attach all the data properties
    Object.assign(this, data);

    // Fallback initializations to prevent undefined array iterations
    this.effects = this.effects || [];
    this.fieldBoosts = this.fieldBoosts || {};
    this.pollenInBag = this.pollenInBag || 0;
    this.capacity = this.capacity || 100;
    this.honey = this.honey || 0;
  }

  // CHQ: Claude AI added implementation for updatePhysics and
  //      updated signature to include reference to gamestate.user
  updatePhysics(dt, user) {
    // updatePhysics(dt) {

    const keys = this.user?.keys || {};
    const speed = 10;

    // Get yaw from player (set by mouse/arrow keys in input.js)
    const yaw = this.yaw || 0;

    // Direction vectors based on yaw
    const forwardX = Math.sin(yaw);
    const forwardZ = -Math.cos(yaw);
    const rightX = Math.cos(yaw);
    const rightZ = Math.sin(yaw);

    let moveX = 0;
    let moveZ = 0;

    if (keys["w"] || keys["arrowup"]) {
      moveX += forwardX;
      moveZ += forwardZ;
    }
    if (keys["s"] || keys["arrowdown"]) {
      moveX -= forwardX;
      moveZ -= forwardZ;
    }
    if (keys["a"] || keys["arrowleft"]) {
      moveX -= rightX;
      moveZ -= rightZ;
    }
    if (keys["d"] || keys["arrowright"]) {
      moveX += rightX;
      moveZ += rightZ;
    }

    // Normalize diagonal movement
    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (len > 0) {
      this.pos[0] += (moveX / len) * speed * dt;
      this.pos[2] += (moveZ / len) * speed * dt;
    }

    // Basic gravity + ground clamp
    this.velocity[1] += -9.81 * dt;
    this.pos[1] += this.velocity[1] * dt;
    if (this.pos[1] <= 5) {
      this.pos[1] = 5;
      this.velocity[1] = 0;
    }
  }

  updateCamera(dt) {
    /* camera logic */
  }

  updateFields(dt) {
    /* field logic */
  }

  updateFields2 = function () {
    player.fieldIn = null;

    for (let i in fieldInfo) {
      fieldInfo[i].degration = Math.max(
        fieldInfo[i].degration - dt * 0.00027777777,
        0,
      );
      fieldInfo[i].corruption = MATH.constrain(
        fieldInfo[i].corruption - dt * 0.6,
        0,
        100,
      );

      updateFlower(
        i,
        MATH.random(0, fieldInfo[i].width) | 0,
        MATH.random(0, fieldInfo[i].length) | 0,
        function (f) {
          f.height += 0.05;
          f.goo = Math.max(f.goo - 0.25, 0);
          f.pollinationTimer -= 0.075;

          if (f.pollinationTimer <= 0) {
            f.pollinationTimer = 1;
            f.level = Math.max(f.ogLevel, f.level - 1);
          }

          if (
            TIME - fieldInfo[i].haze.start < 30 &&
            TIME - fieldInfo[i].haze.delay > 0.07
          ) {
            fieldInfo[i].haze.delay = TIME;

            if (f.level < 5) {
              f.level++;
              f.pollinationTimer = 1;
            } else {
              f.height = 1;
            }

            for (let j = 0; j < 6; j++) {
              ParticleRenderer.add({
                x: f.x + fieldInfo[i].x,
                y: fieldInfo[i].y + 0.5,
                z: f.z + fieldInfo[i].z,
                vx: MATH.random(-1, 1),
                vy: Math.random() * 2,
                vz: MATH.random(-1, 1),
                grav: -3,
                size: 100,
                col: [1, 1, MATH.random(0.6, 1)],
                life: 1,
                rotVel: MATH.random(-3, 3),
                alpha: 2,
              });
            }
          } else {
            if (TIME - fieldInfo[i].haze.start > 30) {
              fieldInfo[i].haze = {};
            }
          }
        },
        true,
        true,
        true,
      );

      if (!player.fieldIn) {
        let x = Math.round(player.body.position.x - fieldInfo[i].x),
          z = Math.round(player.body.position.z - fieldInfo[i].z);

        if (
          x >= 0 &&
          x < fieldInfo[i].width &&
          z >= 0 &&
          z < fieldInfo[i].length &&
          Math.abs(player.body.position.y - fieldInfo[i].y) < 3
        ) {
          player.fieldIn = i;
          player.flowerIn.x = x;
          player.flowerIn.z = z;

          if (fieldInfo[i].corruption | 0)
            player.addEffect(
              "corruption",
              false,
              false,
              fieldInfo[i].corruption | 0,
            );
        }
      }
    }

    if (player.fieldIn) {
      if (
        player._flowerIn.x !== player.flowerIn.x ||
        player._flowerIn.z !== player.flowerIn.z
      ) {
        collectPollen({
          x: player.flowerIn.x,
          z: player.flowerIn.z,
          pattern: [[0, 0]],
          amount: player.movementCollection,
          stackOffset: 0.4,
          yOffset: 1,
          gooTrail: out.currentGear.boots === "gummyBoots",
        });
        player._flowerIn = { ...player.flowerIn };
      }

      leavesTimer -= dt;

      if (leavesTimer <= 0) {
        leavesTimer = 45;

        let tt = "treat";

        if (player.fieldIn === "SunflowerField" && Math.random() < 0.85)
          tt = "sunflowerSeed";
        if (player.fieldIn === "PineapplePatch" && Math.random() < 0.85)
          tt = "pineapple";
        if (player.fieldIn === "CoconutField" && Math.random() < 0.4)
          tt = "coconut";

        if (
          fieldInfo[player.fieldIn].generalColorComp.r > 0.5 &&
          Math.random() < 0.85
        )
          tt = "strawberry";
        if (
          fieldInfo[player.fieldIn].generalColorComp.b > 0.5 &&
          Math.random() < 0.85
        )
          tt = "blueberry";

        objects.tokens.push(
          new LootToken(
            8,
            [
              fieldInfo[player.fieldIn].x +
                ((Math.random() * fieldInfo[player.fieldIn].width) | 0),
              fieldInfo[player.fieldIn].y + 1,
              fieldInfo[player.fieldIn].z +
                ((Math.random() * fieldInfo[player.fieldIn].length) | 0),
            ],
            tt,
            1,
            false,
            "Leaves",
          ),
        );
      }
    }

    out.toolCooldown -= dt;

    if (gear.tool[out.currentGear.tool].particles)
      gear.tool[out.currentGear.tool].particles();

    if ((user.keys.j || user.mousePressed) && out.toolCooldown <= 0) {
      out.toolUses++;

      let arr = [];

      if (out.fieldIn) {
        let p = [],
          a = out.playerAngle;

        if (gear.tool[out.currentGear.tool].computeDirection === undefined) {
          for (let i in gear.tool[out.currentGear.tool].collectPattern) {
            p.push(gear.tool[out.currentGear.tool].collectPattern[i].slice());
          }

          if (Math.abs(a) > MATH.PI_SUB_QUATER) {
          } else if (Math.abs(a) < MATH.QUATER_PI) {
            for (let i in p) {
              p[i][1] = -p[i][1];
            }
          } else if (MATH.HALF_PI - a > MATH.QUATER_PI) {
            for (let i in p) {
              p[i] = [p[i][1], -p[i][0]];
            }
          } else if (MATH.HALF_PI - a < MATH.QUATER_PI) {
            for (let i in p) {
              p[i] = [-p[i][1], p[i][0]];
            }
          }
        } else {
          p = gear.tool[out.currentGear.tool].collectPattern;
        }

        arr = p.slice();

        collectPollen({
          x: player.flowerIn.x,
          z: player.flowerIn.z,
          pattern: p,
          amount: gear.tool[out.currentGear.tool].collectAmount,
          yOffset: 1.5,
          stackHeight: 0.75,
          isGummyBaller: out.currentGear.tool === "gummyBaller",
          multiplier: player.pollenFromTools,
        });
      }

      if (gear.tool[out.currentGear.tool].ability)
        gear.tool[out.currentGear.tool].ability(arr);

      out.toolCooldown =
        gear.tool[out.currentGear.tool].cooldown / player.collectorSpeed;
      out.toolRot = 0;
    }

    for (let i in out.sprinklers) {
      out.sprinklers[i].update();
    }

    for (let i = objects.flames.length; i--; ) {
      if (objects.flames[i].update()) {
        objects.flames[i].die(i);
      }
    }
  };

  /**
   * Data-driven changes that depend on time progression.
   * Notice: All direct DOM manipulation has been extracted!
   */
  updateUI(dt, gameState) {
    // Guard clause: If engine ticks before gameState finishes loading fully
    if (!gameState) return;

    const now = Date.now();
    let effectsChanged = false;

    // Process temporary active buffs/effects over time
    this.effects = this.effects.filter((effect) => {
      const timeLeft = effect.endTime - now;

      if (timeLeft <= 0) {
        // 1. Revert the stat multiplier cleanly
        if (this.fieldBoosts[effect.target] !== undefined) {
          this.fieldBoosts[effect.target] -= effect.multiplier;
        }
        effectsChanged = true;
        return false; // Automatically filters/splices this effect out of the array
      }
      return true; // Keep the active effect
    });

    // If an effect expired, broadcast the state change to update menus/bars asynchronously
    if (effectsChanged) {
      EventManager.emit("EFFECTS_UPDATED", {
        effects: [...this.effects],
        fieldBoosts: { ...this.fieldBoosts },
      });
    } else if (this.effects.length > 0) {
      // If effects are active, broadcast their current durations for smooth clock countdown overlays
      EventManager.emit("EFFECT_TICK", { effects: this.effects });
    }

    // Optional: Only trigger heavy UI state updates occasionally, not every frame
    // Safely check frame counts using an inline fallback if frameCount isn't set yet
    const currentFrame = gameState.frameCount || 0;
    if (currentFrame % 10 === 0) {
      EventManager.emit("QUEST_TICK", gameState);
    }
  }

  /**
   * Call this mutator method whenever the player collects pollen in fields.
   */
  addPollen(amount, colorType) {
    const oldPollen = this.pollenInBag;
    this.pollenInBag = Math.min(this.capacity, this.pollenInBag + amount);

    if (this.pollenInBag !== oldPollen) {
      EventManager.emit("POLLEN_CHANGED", {
        pollenInBag: this.pollenInBag,
        capacity: this.capacity,
        delta: this.pollenInBag - oldPollen,
      });
    }
  }

  /**
   * Call this mutator method when converting pollen to honey at the hive.
   */
  addHoney(amount) {
    this.honey += amount;
    EventManager.emit("HONEY_CHANGED", {
      honey: this.honey,
      delta: amount,
    });
  }
}
