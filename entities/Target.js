class Target {
  constructor(field, x, z, type, bee) {
    this.bee = bee;
    this.field = field;
    this.x = x;
    this.z = z;
    this.type = type;
    this.pos = [
      fieldInfo[this.field].x + this.x,
      fieldInfo[this.field].y,
      fieldInfo[this.field].z + this.z,
    ];
    this.col = this.type === 3 && bee.gifted ? [0.9, 0, 0.9] : [1, 0.7, 0];

    this.trail = new TrailRenderer.Trail({
      length: 2,
      size: 0.04,
      color: [1, 0, 0, 1],
    });
  }

  die(index) {
    this.trail.splice = true;

    objects.explosions.push(
      new ReverseExplosion({
        col: this.activated ? [0, 1, 0] : [1, 0, 0],
        pos: this.pos,
        life: 0.5,
        size: 3,
        alpha: 1,
        height: 3,
      }),
    );

    if (
      vec3.sqrDist(this.pos, [
        player.body.position.x,
        player.body.position.y,
        player.body.position.z,
      ]) <= 4.5
    ) {
      let amountToConvert = Math.min(
        player.convertTotal * 0.5 +
          15 *
            this.bee.convertAmount *
            player.convertRate *
            player[beeInfo[this.bee.type].color + "ConvertRate"] *
            (player.flameHeatStack * 10),
        player.pollen,
      );

      player.pollen -= amountToConvert;

      if (player.extraInfo.enablePollenText)
        textRenderer.add(
          Math.ceil(amountToConvert * 0.5),
          [
            player.body.position.x,
            player.body.position.y + Math.random() * 2 + 0.5,
            player.body.position.z,
          ],
          COLORS.honey,
          0,
          "+",
        );

      let hpt = amountToConvert / 5;

      for (let i = 0; i < MATH.TWO_PI; i += MATH.TWO_PI / 5) {
        objects.tokens.push(
          new LootToken(
            30,
            [
              this.pos[0] + Math.cos(i),
              fieldInfo[this.field].y + 1,
              this.pos[2] + Math.sin(i),
            ],
            "honey",
            Math.ceil(hpt),
            true,
            "Target Practice",
          ),
        );
      }

      player.addEffect("flameHeat", -1);
    }

    objects.targets.splice(index, 1);
  }

  update() {
    this.trail.addPos(this.pos);
    this.trail.addPos(this.bee.pos);
    this.trail.color = [...this.col, 0.75];

    if (
      vec3.sqrDist(this.pos, [
        player.body.position.x,
        player.body.position.y,
        player.body.position.z,
      ]) <= 4
    ) {
      this.col = [0, 1, 0];
      this.activated = true;
    }

    meshes.cylinder_explosions.instanceData.push(
      this.pos[0],
      this.pos[1],
      this.pos[2],
      this.col[0],
      this.col[1],
      this.col[2],
      0.5,
      1.75,
      0.75,
    );

    return this.splice;
  }
}
