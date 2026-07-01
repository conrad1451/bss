import { beeInfo } from "../../data/bees";

class PetalShuriken {
  constructor(pos, vel) {
    this.pos = [...pos, 0];
    this.vel = vel;
    this.life = 1.5;

    vec3.scale(vel, vel, 10);

    this.hitBees = [];
  }

  die(index) {
    objects.mobs.splice(index, 1);
  }

  update() {
    this.life -= dt;

    this.pos[0] += this.vel[0] * dt;
    this.pos[2] += this.vel[2] * dt;
    this.pos[3] += dt * 10;

    for (let i in objects.bees) {
      let b = objects.bees[i];

      if (
        this.hitBees.indexOf(i) < 0 &&
        Math.abs(b.pos[0] - this.pos[0]) +
          Math.abs(b.pos[1] - this.pos[1]) +
          Math.abs(b.pos[2] - this.pos[2]) <
          1
      ) {
        objects.explosions.push(
          new Explosion({
            col: Math.random() < 0.5 ? [1, 0.9, 0] : [1, 0, 0.825],
            pos: this.pos.slice(),
            life: 0.5,
            size: 1.2,
            speed: 0.35,
            aftershock: 0.005,
          }),
        );

        this.hitBees.push(i);

        let amountToConvert = Math.ceil(
          Math.min(
            player.pollen,
            10000 +
              b.convertAmount *
                7.5 *
                player[beeInfo[b.type].color + "ConvertRate"],
          ),
        );

        player.pollen -= amountToConvert;
        player.honey += Math.ceil(amountToConvert * player.honeyPerPollen);

        if (amountToConvert)
          textRenderer.add(
            Math.ceil(amountToConvert * player.honeyPerPollen) + "",
            [b.pos[0], b.pos[1] + 0.75, b.pos[2]],
            COLORS.honey,
            1,
            "⇆",
          );
      }
    }

    for (let i in objects.bubbles) {
      let b = objects.bubbles[i];

      if (vec3.sqrDist(this.pos, b.pos) <= 4.5) {
        b.pop();
      }
    }

    for (let i in objects.fuzzBombs) {
      let b = objects.fuzzBombs[i];

      if (vec3.sqrDist(this.pos, b.pos) <= 3.5) {
        b.pop();
      }
    }

    for (let i in objects.tokens) {
      let b = objects.tokens[i];

      if (
        vec3.sqrDist(this.pos, b.pos) <= 3.5 &&
        !(objects.tokens[i] instanceof DupedToken)
      ) {
        b.collect();
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, meshes.petalShuriken.vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes.petalShuriken.indexBuffer);
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
    gl.uniform2f(glCache.mob_instanceInfo2, 1, this.life * 1.75);
    gl.drawElements(
      gl.TRIANGLES,
      meshes.petalShuriken.indexAmount,
      gl.UNSIGNED_SHORT,
      0,
    );

    return this.life <= 0;
  }
}
