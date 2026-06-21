class FireflyPatch {
  constructor() {
    window.setTimeout(
      () => {
        this.flyBack = true;
        window.setTimeout(() => (this.splice = true), 20 * 1000);
      },
      1.75 * 60 * 1000,
    );

    this.fireflies = [];
    this.cycle = 3;

    this.field = [
      "SpiderField",
      "StrawberryField",
      "RoseField",
      "CactusField",
      "BambooField",
      "PineapplePatch",
    ][(Math.random() * 6) | 0];
    this.x = MATH.random(0.4, 0.6) * fieldInfo[this.field].width;
    this.z = MATH.random(0.4, 0.6) * fieldInfo[this.field].length;

    let x = fieldInfo[this.field].x + this.x,
      z = fieldInfo[this.field].z + this.z,
      r = MATH.random(3, 5);

    for (let i = 0; i < 8; i++) {
      let t = Math.random() * MATH.TWO_PI;

      this.fireflies.push({
        pos: [-60, 20, -30],
        toPos: [
          (Math.sin(t) * r + x) | 0,
          fieldInfo[this.field].y + 0.75,
          (Math.cos(t) * r + z) | 0,
        ],
        vel: [0, 0, 0],
        state: "moveToFlower",
      });
    }
  }

  die(index) {
    objects.mobs.splice(index, 1);
  }

  update() {
    let isAllWaitingAir = this.fireflies.length;

    for (let i in this.fireflies) {
      let f = this.fireflies[i];

      if (this.flyBack) {
        vec3.sub(f.vel, [-60, 20, -30], f.pos);
        vec3.normalize(f.vel, f.vel);

        vec3.scaleAndAdd(f.pos, f.pos, f.vel, dt * 4);
      } else {
        switch (f.state) {
          case "moveToFlower":
            vec3.sub(f.vel, f.toPos, f.pos);
            vec3.normalize(f.vel, f.vel);

            vec3.scaleAndAdd(f.pos, f.pos, f.vel, dt * 4);

            if (
              Math.abs(f.toPos[0] - f.pos[0]) +
                Math.abs(f.toPos[1] - f.pos[1]) +
                Math.abs(f.toPos[2] - f.pos[2]) <
              0.5
            ) {
              f.state = "waitSquish";
              f.pos = f.toPos.slice();
              vec3.sub(
                f.vel,
                [
                  fieldInfo[this.field].x + this.x,
                  fieldInfo[this.field].y + 0.75,
                  fieldInfo[this.field].z + this.z,
                ],
                f.pos,
              );
            }

            break;

          case "waitSquish":
            if (
              Math.abs(player.body.position.x - f.pos[0]) +
                Math.abs(player.body.position.y - f.pos[1]) +
                Math.abs(player.body.position.z - f.pos[2]) <
              4
            ) {
              f.state = "flyUp";
              f.toPos[1] += 5;

              let tt = "treat";

              if (Math.random() < 0.35)
                tt = Math.random() < 0.5 ? "pineapple" : "sunflowerSeed";

              if (
                fieldInfo[this.field].generalColorComp.r > 0.5 &&
                Math.random() < 0.4
              )
                tt = "strawberry";
              if (
                fieldInfo[this.field].generalColorComp.b > 0.5 &&
                Math.random() < 0.4
              )
                tt = "blueberry";

              if (Math.random() < 0.06)
                tt = Math.random() < 0.5 ? "gumdrops" : "royalJelly";

              objects.tokens.push(
                new LootToken(
                  30,
                  [f.pos[0], fieldInfo[this.field].y + 1, f.pos[2]],
                  tt,
                  1,
                  false,
                  "Fireflies",
                ),
              );
            }

            break;

          case "flyUp":
            vec3.sub(f.vel, f.toPos, f.pos);
            vec3.normalize(f.vel, f.vel);

            vec3.scaleAndAdd(f.pos, f.pos, f.vel, dt * 4);

            if (
              Math.abs(f.toPos[0] - f.pos[0]) +
                Math.abs(f.toPos[1] - f.pos[1]) +
                Math.abs(f.toPos[2] - f.pos[2]) <
              0.5
            ) {
              f.state = "waitAir";
              f.pos = f.toPos.slice();
              vec3.sub(
                f.vel,
                [
                  fieldInfo[this.field].x + this.x,
                  fieldInfo[this.field].y + 0.75,
                  fieldInfo[this.field].z + this.z,
                ],
                f.pos,
              );
            }

            break;

          case "waitAir":
            isAllWaitingAir--;

            break;
        }
      }

      meshes.bees.instanceData.push(
        f.pos[0],
        f.pos[1],
        f.pos[2],
        1,
        f.vel[0],
        f.vel[1],
        f.vel[2],
        BEE_FLY,
        0.875,
        0.625,
        0,
      );
      textRenderer.addDecalRaw(
        ...f.pos,
        0,
        0,
        ...textRenderer.decalUV.glow,
        1,
        1,
        0.2,
        2.5,
        2.5,
        0,
      );
      textRenderer.addDecalRaw(
        ...f.pos,
        0,
        0,
        ...textRenderer.decalUV.lightrays,
        1,
        1,
        0.2,
        3,
        3,
        TIME + i * 0.5,
      );
      meshes.explosions.instanceData.push(...f.pos, 1, 1, 0.2, 0.2, 0.95, 1);
    }

    if (!isAllWaitingAir) {
      let tt = "starTreat";
      //let tt='moonCharm'

      if (Math.random() < 0.07)
        tt = Math.random() < 0.1 ? "starJelly" : "glitter";

      objects.tokens.push(
        new LootToken(
          30,
          [
            fieldInfo[this.field].x + this.x,
            fieldInfo[this.field].y + 1,
            fieldInfo[this.field].z + this.z,
          ],
          tt,
          1,
          false,
          "Fireflies",
        ),
      );

      objects.explosions.push(
        new Explosion({
          col: [0, 1, 1],
          pos: [
            fieldInfo[this.field].x + this.x,
            fieldInfo[this.field].y + 1,
            fieldInfo[this.field].z + this.z,
          ],
          life: 0.75,
          size: 6,
          speed: 0.2,
          aftershock: 0.05,
        }),
      );

      this.cycle--;

      if (this.cycle <= 0) {
        let _f = [
          "SpiderField",
          "StrawberryField",
          "RoseField",
          "CactusField",
          "BambooField",
          "PineapplePatch",
        ];

        _f.splice(_f.indexOf(this.field), 1);

        this.field = _f[(Math.random() * 5) | 0];
        this.cycle = 3;
      }

      this.x = MATH.random(0.4, 0.6) * fieldInfo[this.field].width;
      this.z = MATH.random(0.4, 0.6) * fieldInfo[this.field].length;

      let x = fieldInfo[this.field].x + this.x,
        z = fieldInfo[this.field].z + this.z,
        r = MATH.random(3, 5);

      for (let i in this.fireflies) {
        let f = this.fireflies[i],
          t = Math.random() * MATH.TWO_PI;

        f.toPos = [
          (Math.sin(t) * r + x) | 0,
          fieldInfo[this.field].y + 0.75,
          (Math.cos(t) * r + z) | 0,
        ];
        f.state = "moveToFlower";
      }
    }

    return this.splice;
  }
}
