class FetchBall {
  constructor(pos, bee) {
    this.bee = bee;
    this.life = 12.5;
    this.turn = 0;
    this.timer = 0;
    this.playerDelay = 0;
    this.treat = { hits: 4, amount: 1 };

    this.body = new CANNON.Body({
      shape: new CANNON.Sphere(0.5),
      mass: 3,
      position: new CANNON.Vec3(...pos),
      collisionFilterGroup: DYNAMIC_PHYSICS_GROUP,
      collisionFilterMask: STATIC_PHYSICS_GROUP | PLAYER_PHYSICS_GROUP,
    });

    let DIS = this;

    this.body.addEventListener("collide", function (e) {
      DIS.body.velocity.scale(5);

      if (e.body.collisionFilterGroup === PLAYER_PHYSICS_GROUP) {
        DIS.kick(-e.contact.ni.x, -e.contact.ni.z);
      }
    });

    world.addBody(this.body);
  }

  kick(vx, vz) {
    this.life = 5;
    this.body.velocity.set(vx * 6, 0, vz * 6);
    this.turn = this.turn ? 0 : 1;
    this.playerDelay = 0.25;

    this.treat.hits -= 0.5;

    if (this.treat.hits <= 0 && this.treat.amount < 128) {
      this.treat.hits = 4;
      objects.tokens.push(
        new LootToken(
          30,
          [this.body.position.x, this.body.position.y, this.body.position.z],
          "treat",
          this.treat.amount,
        ),
      );

      this.treat.amount = this.treat.amount * 2;
    }
  }

  die(index) {
    this.bee.fetchBall = undefined;

    world.removeBody(this.body);
    objects.mobs.splice(index, 1);
  }

  update() {
    this.body.velocity.x /= dt * 0.3 + 1;
    this.body.velocity.z /= dt * 0.3 + 1;

    this.life -= dt;
    this.playerDelay -= dt;
    this.timer -= dt;

    this.body.collisionFilterMask =
      this.turn || this.playerDelay > 0
        ? STATIC_PHYSICS_GROUP
        : STATIC_PHYSICS_GROUP | PLAYER_PHYSICS_GROUP;

    meshes.explosions.instanceData.push(
      this.body.position.x,
      this.body.position.y,
      this.body.position.z,
      0.8,
      0.9 - this.turn * 0.3,
      0.1,
      this.life,
      1,
      1,
    );

    let arr = [
      this.body.position.x,
      this.body.position.y,
      this.body.position.z,
    ];

    for (let i in objects.bubbles) {
      let b = objects.bubbles[i];

      if (vec3.sqrDist(arr, b.pos) <= 4.5) {
        b.pop();
      }
    }

    for (let i in objects.fuzzBombs) {
      let b = objects.fuzzBombs[i];

      if (vec3.sqrDist(arr, b.pos) <= 3.5) {
        b.pop();
      }
    }

    for (let i in objects.tokens) {
      let b = objects.tokens[i];

      if (
        vec3.sqrDist(arr, b.pos) <= 3.5 &&
        !(objects.tokens[i] instanceof DupedToken)
      ) {
        b.collect();
      }
    }

    if (this.timer <= 0) {
      this.timer = 0.2;

      for (let i in fieldInfo) {
        collectPollen({
          x: Math.round(arr[0] - fieldInfo[i].x),
          z: Math.round(arr[2] - fieldInfo[i].z),
          pattern: [[0, 0]],
          amount: 5 + this.bee.level * 0.5,
          yOffset: 0.2,
          field: i,
        });
      }
    }

    return this.life <= 0;
  }
}
