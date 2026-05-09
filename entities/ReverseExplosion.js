// entities/ReverseExplosion.js
import { MATH } from "../utils/math.js";

export class ReverseExplosion {
  constructor(params) {
    this.transformHeight = params.transformHeight;
    this.primitive = params.primitive || "cylinder_explosions";
    this.lifespan = 1 / params.life;
    this.params = params;
    this.size = params.size;
    this.params.height = this.params.height || 1;
    this.backface = params.backface === undefined ? false : params.backface;
  }

  die(index) {
    objects.explosions.splice(index, 1);
  }

  update() {
    this.params.life -= dt;
    let s = this.params.life * this.lifespan * this.size;

    meshes[this.primitive].instanceData.push(
      this.params.pos[0],
      this.params.pos[1],
      this.params.pos[2],
      this.params.col[0],
      this.params.col[1],
      this.params.col[2],
      this.params.life * this.lifespan * this.params.alpha,
      this.backface ? -s : s,
      this.transformHeight ? this.params.height : this.params.height / s,
    );

    return this.params.life <= 0;
  }
}
