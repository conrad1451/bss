class Scratch {
  constructor(bee, x, z, goldenRake) {
    this.mesh = goldenRake ? "goldenRakeScratch" : "scratch";
    this.bee = bee;
    this.life = 1;
    this.field = player.fieldIn;
    this.x = x;
    this.z = z;
    this.pos = [
      fieldInfo[this.field].x + this.x,
      fieldInfo[this.field].y + 1,
      fieldInfo[this.field].z + this.z,
      0,
    ];
    this.targetZ = this.pos[2] + (this.mesh === "scratch" ? -4 : -7);
  }

  die(index) {
    objects.mobs.splice(index, 1);
  }

  update() {
    this.life -= dt;

    if (this.life < 0.8)
      this.pos[2] += (this.targetZ - this.pos[2]) * dt * 12.5;

    if (this.life <= 0.35 && !this.collectedPollen) {
      if (this.mesh === "scratch") {
        collectPollen({
          x: this.x,
          z: this.z,
          field: this.field,
          pattern: [
            [-2, 0],
            [-2, 1],
            [-2, -1],
            [-2, -2],
            [0, 0],
            [0, 1],
            [0, -1],
            [0, -2],
            [2, 0],
            [2, 1],
            [2, -1],
            [2, -2],
          ],
          amount: 40 + this.bee.level * 1.5,
          multiplier: player.tabbyLoveStacks,
        });
      } else {
        collectPollen({
          x: this.x,
          z: this.z,
          field: this.field,
          pattern: [
            [-3, -1],
            [-3, -2],
            [-3, -3],
            [-3, -4],
            [-3, -5],
            [-3, -6],
            [-3, -7],
            [3, -1],
            [3, -2],
            [3, -3],
            [3, -4],
            [3, -5],
            [3, -6],
            [3, -7],
            [-1, -1],
            [-1, -2],
            [-1, -3],
            [-1, -4],
            [-1, -5],
            [-1, -6],
            [-1, -7],
            [1, -1],
            [1, -2],
            [1, -3],
            [1, -4],
            [1, -5],
            [1, -6],
            [1, -7],
          ],
          amount: 7,
        });
      }

      this.collectedPollen = true;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, meshes[this.mesh].vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes[this.mesh].indexBuffer);
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
    gl.uniform2f(glCache.mob_instanceInfo2, 0.65, 1);
    gl.drawElements(
      gl.TRIANGLES,
      meshes[this.mesh].indexAmount,
      gl.UNSIGNED_SHORT,
      0,
    );

    return this.life <= 0;
  }
}
//
// class DarkScoopingTrail {
