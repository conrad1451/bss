class JellyBean {
  constructor(field, vel, type) {
    this.field = field;
    this.vel = vel;
    this.type = type;
    this.y = fieldInfo[this.field].y;
    this.pos = [player.body.position.x, this.y + 0.5, player.body.position.z];

    switch (this.type.replace("JellyBean", "")) {
      case "red":
        this.col = [0.85, 0, 0];
        break;
      case "white":
        this.col = [0.9, 0.9, 0.9];
        break;
      case "blue":
        this.col = [0, 0.5, 0.9];
        break;
      case "pink":
        this.col = [0.9, 0.45, 0.9];
        break;
      case "brown":
        this.col = [0.3, 0.2, 0.1];
        break;
      case "green":
        this.col = [0, 0.5, 0];
        break;
      case "black":
        this.col = [0.075, 0.075, 0.075];
        break;
      case "yellow":
        this.col = [0.95, 0.9, 0.1];
        break;
    }

    vec3.scale(this.col, this.col, player.isNight);
  }

  die(index) {
    if (
      this.pos[0] > fieldInfo[this.field].x &&
      this.pos[0] < fieldInfo[this.field].x + fieldInfo[this.field].width - 1 &&
      this.pos[2] > fieldInfo[this.field].z &&
      this.pos[2] < fieldInfo[this.field].z + fieldInfo[this.field].length - 1
    ) {
      objects.tokens.push(
        new Token(
          effects[this.type].tokenLife,
          [this.pos[0], this.pos[1] + 1.1, this.pos[2]],
          this.type,
        ),
      );
    }

    objects.mobs.splice(index, 1);
  }

  update() {
    this.vel[1] -= dt * 16;

    vec3.scaleAndAdd(this.pos, this.pos, this.vel, dt);

    meshes.explosions.instanceData.push(...this.pos, ...this.col, 1, 0.35, 1);

    return this.pos[1] <= this.y;
  }
}
