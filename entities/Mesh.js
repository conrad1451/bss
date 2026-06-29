// entities/Mesh.js
import { MATH } from "../utils/math.js";
import { beeInfo } from "../data/bees.js";

// CHQ: Claude AI (Haiku) applied JSDocs
//      (except for setMeshFromFunction, which was applied by Gemini AI)

/**
 * Represents a 3D mesh for rendering with WebGL.
 * Manages vertex data, index buffers, and transformation matrices.
 * Supports both static and dynamic mesh types with different vertex attribute layouts.
 */
export class Mesh {
  /**
   * Creates a new Mesh instance.
   * @constructor
   * @param {boolean} [isStatic=true] - Whether the mesh is static (STATIC_DRAW) or dynamic (DYNAMIC_DRAW)
   * @param {number[]} [verts=[]] - Array of vertex data (positions, colors, UVs/normals)
   * @param {number[]} [index=[]] - Array of triangle indices
   *
   * @property {boolean} isStatic - Determines buffer update strategy and vertex layout
   * @property {Object} mesh - Container for mesh data and WebGL buffers
   * @property {Object} mesh.data - Raw vertex and index data
   * @property {Float32Array} mesh.data.verts - Vertex attribute data
   * @property {Uint16Array} mesh.data.index - Triangle indices
   * @property {Object} mesh.buffers - WebGL buffer objects
   * @property {WebGLBuffer} mesh.buffers.verts - Vertex attribute buffer
   * @property {WebGLBuffer} mesh.buffers.index - Element index buffer
   * @property {number} mesh.indexAmount - Number of indices in the mesh
   * @property {number} meshGlobalID - Unique identifier for this mesh instance
   * @property {number[]} matrix - 4x4 transformation matrix (column-major order)
   * @property {number[]} ogMatrix - Original/initial transformation matrix
   */
  constructor(isStatic = true, verts, index) {
    this.isStatic = isStatic;
    this.setMesh(verts || [], index || []);
    this.meshGlobalID = globalMeshID++;
    this.matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    this.ogMatrix = this.matrix.slice();
  }

  /**
   * Sets or updates the mesh geometry data and creates WebGL buffers.
   * Converts input arrays to typed arrays and allocates GPU buffers.
   *
   * @param {number[]} verts - Array of vertex attributes (3 floats for position, 4 for color, 3 for UV/normal)
   * @param {number[]} index - Array of triangle indices (3 per triangle)
   */
  setMesh(verts, index) {
    this.mesh = {
      data: {
        verts: new Float32Array(verts),
        index: new Uint16Array(index),
      },
      buffers: {
        verts: gl.createBuffer(),
        index: gl.createBuffer(),
      },

      indexAmount: index.length,
    };
  }

  /**
   * Dynamically constructs and updates the mesh geometry from a
   * user-defined generator function. Handles lifecycle cleanup of
   * static physics bodies associated with this mesh, provides
   * localized procedural drawing methods (like `addBox`,
   * `addCylinder`, etc.) to the callback function, processes
   * CPU-side geometry generation (vertex positions, color shading,
   * normals/UVs), and rebuilds the underling WebGL mesh buffers.
   *
   * @param {function} func - A procedural generator callback function. It receives localized drawing primitives as arguments or references scoped variables to construct the geometry.
   * @returns {void}
   */
  setMeshFromFunction(func) {
    let verts = [],
      index = [],
      addBox,
      addHiveSlot,
      addCylinder,
      addSphere,
      applyFinalRotation,
      addGiftedRing,
      addStar,
      addLimbBox,
      addLimbCylinder,
      DIS = this;

    if (this.isStatic) {
      for (let i = world.bodies.length; i--; ) {
        if (
          world.bodies[i].collisionFilterGroup === STATIC_PHYSICS_GROUP &&
          world.bodies[i].parentMeshGlobalID === this.meshGlobalID
        ) {
          world.removeBody(world.bodies[i]);
        }
      }

      addBox = function (
        x,
        y,
        z,
        w,
        h,
        l,
        rot,
        _col,
        physics = true,
        textures = true,
        mesh = true,
      ) {
        let col = (
          _col === true
            ? [0, 0.8, 0, 0.6]
            : typeof _col === "string"
              ? [1, 0, 0, 0.6]
              : _col
        ).slice();

        rot = rot || [0, 0, 0];

        let rotation = quat.fromEuler([], rot[0], rot[1], rot[2]);
        let model = mat4.fromRotationTranslation([], rotation, [x, y, z, 1]),
          a = col[3] || 1;

        col[0] *= 1.2;
        col[1] *= 1.2;
        col[2] *= 1.2;

        if (physics) {
          let B = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(w * 0.5, h * 0.5, l * 0.5)),
            mass: 0,
            position: new CANNON.Vec3(x, y, z),
            quaternion: new CANNON.Quaternion(...rotation),
            collisionFilterGroup: STATIC_PHYSICS_GROUP,
            collisionFilterMask: PLAYER_PHYSICS_GROUP | DYNAMIC_PHYSICS_GROUP,
          });

          if (typeof _col === "string") B.isBannedGate = _col;

          B.parentMeshGlobalID = DIS.meshGlobalID;
          world.addBody(B);
        }

        let v = [
          [-0.5 * w, 0.5 * h, -0.5 * l],
          [-0.5 * w, 0.5 * h, 0.5 * l],
          [0.5 * w, 0.5 * h, 0.5 * l],
          [0.5 * w, 0.5 * h, -0.5 * l],
          [-0.5 * w, -0.5 * h, -0.5 * l],
          [-0.5 * w, -0.5 * h, 0.5 * l],
          [0.5 * w, -0.5 * h, 0.5 * l],
          [0.5 * w, -0.5 * h, -0.5 * l],
        ];

        let shade = [];

        let normals = [
          [0, 1, 0],
          [0, 0, 1],
          [0, 0, -1],
          [1, 0, 0],
          [-1, 0, 0],
          [0, -1, 0],
        ];

        for (let i = 0, _l = v.length; i < _l; i++) {
          vec3.transformMat4(v[i], v[i], model);

          if (i < 6) {
            vec3.transformQuat(normals[i], normals[i], rotation);
            let n = normals[i];
            let d =
              n[0] * lightDir[0] + n[1] * lightDir[1] + n[2] * lightDir[2];
            shade[i] = d * 0.8 + 0.65;
          }
        }

        let vl = verts.length / 10;

        if (!textures) {
          w = 0;
          h = 0;
          l = 0;
        }

        if (!mesh) {
          return;
        }

        verts.push(
          v[0][0],
          v[0][1],
          v[0][2],
          col[0] * shade[0],
          col[1] * shade[0],
          col[2] * shade[0],
          a,
          w,
          l,
          0,
          v[1][0],
          v[1][1],
          v[1][2],
          col[0] * shade[0],
          col[1] * shade[0],
          col[2] * shade[0],
          a,
          w,
          0,
          0,
          v[2][0],
          v[2][1],
          v[2][2],
          col[0] * shade[0],
          col[1] * shade[0],
          col[2] * shade[0],
          a,
          0,
          0,
          0,
          v[3][0],
          v[3][1],
          v[3][2],
          col[0] * shade[0],
          col[1] * shade[0],
          col[2] * shade[0],
          a,
          0,
          l,
          0,

          v[1][0],
          v[1][1],
          v[1][2],
          col[0] * shade[1],
          col[1] * shade[1],
          col[2] * shade[1],
          a,
          0,
          0,
          0,
          v[2][0],
          v[2][1],
          v[2][2],
          col[0] * shade[1],
          col[1] * shade[1],
          col[2] * shade[1],
          a,
          w,
          0,
          0,
          v[5][0],
          v[5][1],
          v[5][2],
          col[0] * shade[1],
          col[1] * shade[1],
          col[2] * shade[1],
          a,
          0,
          h,
          0,
          v[6][0],
          v[6][1],
          v[6][2],
          col[0] * shade[1],
          col[1] * shade[1],
          col[2] * shade[1],
          a,
          w,
          h,
          0,

          v[0][0],
          v[0][1],
          v[0][2],
          col[0] * shade[2],
          col[1] * shade[2],
          col[2] * shade[2],
          a,
          w,
          h,
          0,
          v[3][0],
          v[3][1],
          v[3][2],
          col[0] * shade[2],
          col[1] * shade[2],
          col[2] * shade[2],
          a,
          0,
          h,
          0,
          v[4][0],
          v[4][1],
          v[4][2],
          col[0] * shade[2],
          col[1] * shade[2],
          col[2] * shade[2],
          a,
          w,
          0,
          0,
          v[7][0],
          v[7][1],
          v[7][2],
          col[0] * shade[2],
          col[1] * shade[2],
          col[2] * shade[2],
          a,
          0,
          0,
          0,

          v[2][0],
          v[2][1],
          v[2][2],
          col[0] * shade[3],
          col[1] * shade[3],
          col[2] * shade[3],
          a,
          0,
          0,
          0,
          v[3][0],
          v[3][1],
          v[3][2],
          col[0] * shade[3],
          col[1] * shade[3],
          col[2] * shade[3],
          a,
          l,
          0,
          0,
          v[6][0],
          v[6][1],
          v[6][2],
          col[0] * shade[3],
          col[1] * shade[3],
          col[2] * shade[3],
          a,
          0,
          h,
          0,
          v[7][0],
          v[7][1],
          v[7][2],
          col[0] * shade[3],
          col[1] * shade[3],
          col[2] * shade[3],
          a,
          l,
          h,
          0,

          v[0][0],
          v[0][1],
          v[0][2],
          col[0] * shade[4],
          col[1] * shade[4],
          col[2] * shade[4],
          a,
          0,
          0,
          0,
          v[1][0],
          v[1][1],
          v[1][2],
          col[0] * shade[4],
          col[1] * shade[4],
          col[2] * shade[4],
          a,
          l,
          0,
          0,
          v[4][0],
          v[4][1],
          v[4][2],
          col[0] * shade[4],
          col[1] * shade[4],
          col[2] * shade[4],
          a,
          0,
          h,
          0,
          v[5][0],
          v[5][1],
          v[5][2],
          col[0] * shade[4],
          col[1] * shade[4],
          col[2] * shade[4],
          a,
          l,
          h,
          0,

          v[4][0],
          v[4][1],
          v[4][2],
          col[0] * shade[5],
          col[1] * shade[5],
          col[2] * shade[5],
          a,
          0,
          l,
          0,
          v[5][0],
          v[5][1],
          v[5][2],
          col[0] * shade[5],
          col[1] * shade[5],
          col[2] * shade[5],
          a,
          0,
          0,
          0,
          v[6][0],
          v[6][1],
          v[6][2],
          col[0] * shade[5],
          col[1] * shade[5],
          col[2] * shade[5],
          a,
          w,
          0,
          0,
          v[7][0],
          v[7][1],
          v[7][2],
          col[0] * shade[5],
          col[1] * shade[5],
          col[2] * shade[5],
          a,
          w,
          l,
          0,
        );

        index.push(
          0 + vl,
          1 + vl,
          2 + vl,
          0 + vl,
          2 + vl,
          3 + vl,
          5 + vl,
          6 + vl,
          7 + vl,
          6 + vl,
          5 + vl,
          4 + vl,
          8 + vl,
          9 + vl,
          10 + vl,
          11 + vl,
          10 + vl,
          9 + vl,
          14 + vl,
          13 + vl,
          12 + vl,
          13 + vl,
          14 + vl,
          15 + vl,
          18 + vl,
          17 + vl,
          16 + vl,
          17 + vl,
          18 + vl,
          19 + vl,
          22 + vl,
          21 + vl,
          20 + vl,
          23 + vl,
          22 + vl,
          20 + vl,
        );
      };

      addHiveSlot = function (x, y, z, w, h, type, gifted) {
        let t = 128 / 2048,
          _x = beeInfo[type || "basic"].u,
          _y = beeInfo[type || "basic"].v + (gifted ? 768 / 2048 : 0),
          isNull = type === null ? 1 : 0,
          [r, g, b] = COLORS.honey_normalized;

        r *= 0.5;
        g *= 0.5;
        b *= 0.5;

        let vl = verts.length / 10;

        verts.push(
          x - w,
          y - h,
          z,
          r,
          g,
          b,
          1,
          _x,
          t + _y,
          isNull,
          x + w,
          y - h,
          z,
          r,
          g,
          b,
          1,
          t + _x,
          t + _y,
          isNull,
          x + w,
          y + h,
          z,
          r,
          g,
          b,
          1,
          t + _x,
          _y,
          isNull,
          x - w,
          y + h,
          z,
          r,
          g,
          b,
          1,
          _x,
          _y,
          isNull,
        );

        index.push(vl, vl + 1, vl + 2, vl + 2, vl + 3, vl);
      };

      addGiftedRing = function (x, y, z, w, h) {
        addBox(x, y, z, w * 2, h * 2, 0.25, false, [100, 100, 0], false, false);
      };

      addStar = function (
        x,
        y,
        z,
        innerRad,
        outerRad,
        thickness,
        depth,
        r,
        g,
        b,
        la = 0.75,
        lb = 0.25,
        rx = 0,
        ry = 0,
        rz = 0,
      ) {
        let rotQuat = quat.fromEuler([], rx, ry, rz);

        innerRad *= 0.8;
        let _verts = [],
          _index = [],
          pos = [],
          vs = [],
          ix = [],
          j = 0,
          vl = verts.length / 10;

        for (let i = 0; i < MATH.TWO_PI; i += MATH.TWO_PI / 10) {
          let r = j++ % 2 === 0 ? outerRad : innerRad;

          pos.push([Math.sin(i) * r, Math.cos(i) * r, -thickness]);
        }

        j = 0;

        for (let i = 0; i < MATH.TWO_PI; i += MATH.TWO_PI / 10) {
          let r = j++ % 2 === 0 ? outerRad : innerRad;

          pos.push([Math.sin(i) * r, Math.cos(i) * r, thickness]);
        }

        pos.push([0, 0, -depth], [0, 0, depth]);

        vs.push(
          0,
          1,
          20,
          1,
          2,
          20,
          2,
          3,
          20,
          3,
          4,
          20,
          4,
          5,
          20,
          5,
          6,
          20,
          6,
          7,
          20,
          7,
          8,
          20,
          8,
          9,
          20,
          9,
          0,
          20,
          11,
          10,
          21,
          12,
          11,
          21,
          13,
          12,
          21,
          14,
          13,
          21,
          15,
          14,
          21,
          16,
          15,
          21,
          17,
          16,
          21,
          18,
          17,
          21,
          19,
          18,
          21,
          10,
          19,
          21,
          9,
          10,
          0,
        );

        ix.push(
          2,
          1,
          0,
          5,
          4,
          3,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23,
          24,
          25,
          26,
          27,
          28,
          29,
          30,
          31,
          32,
          33,
          34,
          35,
          36,
          37,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          46,
          47,
          48,
          49,
          50,
          51,
          52,
          53,
          54,
          55,
          56,
          57,
          58,
          59,
          60,
          61,
          62,
        );

        for (let i = 0; i < 10; i++) {
          vs.push(0 + i, 10 + i, 1 + i, 11 + i, 1 + i, 10 + i);
          ix.push(i * 6, i * 6 + 1, i * 6 + 2, i * 6 + 3, i * 6 + 4, i * 6 + 5);
        }

        for (let i = 63; i < ix.length; i++) {
          ix[i] += 63;
        }

        for (let i = 0; i < pos.length; i++) {
          vec3.transformQuat(pos[i], pos[i], rotQuat);
          vec3.add(pos[i], pos[i], [x, y, z]);
        }

        for (let i in vs) {
          vs[i] = pos[vs[i]];
        }

        _index = ix;

        let findNorm = (a, b, c) => {
          a = vs[a];
          b = vs[b];
          c = vs[c];

          let n = vec3.cross(
            [],
            [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
            [a[0] - c[0], a[1] - c[1], a[2] - c[2]],
          );

          return vec3.normalize(n, n);
        };

        for (let i = 0; i < _index.length; i += 3) {
          let i1 = _index[i],
            i2 = _index[i + 1],
            i3 = _index[i + 2],
            shade =
              vec3.dot([0.035, 0.175, 0.053], findNorm(i1, i2, i3)) * la + lb;

          verts.push(
            ...vs[i1],
            r * shade,
            g * shade,
            b * shade,
            1,
            0,
            0,
            0,
            ...vs[i2],
            r * shade,
            g * shade,
            b * shade,
            1,
            0,
            0,
            0,
            ...vs[i3],
            r * shade,
            g * shade,
            b * shade,
            1,
            0,
            0,
            0,
          );
        }

        for (let i in _index) {
          _index[i] += vl;
        }

        index.push(..._index);
      };

      addCylinder = function (
        x,
        y,
        z,
        rad,
        hei,
        sides,
        r,
        g,
        b,
        a,
        rx,
        ry,
        rz,
        r2,
        shading = true,
      ) {
        let rad2 = r2 ?? rad,
          vl = verts.length / 10,
          _verts = [],
          _index = [];

        for (let t = 0, inc = MATH.TWO_PI / sides; t <= MATH.TWO_PI; t += inc) {
          let t1 = t - inc * 0.5,
            t2 = t + inc * 0.5,
            s = shading ? Math.sin(t1) * 0.1 + 0.9 : 1;
          _verts.push(
            Math.cos(t1) * rad,
            Math.sin(t1) * rad,
            hei * 0.5,
            r * s,
            g * s,
            b * s,
            a,
            0,
            0,
            0,
            Math.cos(t1) * rad2,
            Math.sin(t1) * rad2,
            -hei * 0.5,
            r * s,
            g * s,
            b * s,
            a,
            0,
            0,
            0,
            Math.cos(t2) * rad,
            Math.sin(t2) * rad,
            hei * 0.5,
            r * s,
            g * s,
            b * s,
            a,
            0,
            0,
            0,
            Math.cos(t2) * rad2,
            Math.sin(t2) * rad2,
            -hei * 0.5,
            r * s,
            g * s,
            b * s,
            a,
            0,
            0,
            0,
          );

          let _vl = _verts.length / 10;
          _index.push(_vl, _vl + 1, _vl + 2, _vl + 3, _vl + 2, _vl + 1);
        }

        let _v = _verts.length / 10;

        for (let t = 0, inc = MATH.TWO_PI / sides; t <= MATH.TWO_PI; t += inc) {
          let t1 = t - inc * 0.5,
            t2 = t + inc * 0.5;
          _verts.push(
            Math.cos(t1) * rad,
            Math.sin(t1) * rad,
            hei * 0.5,
            r * 0.9,
            g * 0.9,
            b * 0.9,
            a,
            0,
            0,
            0,
            Math.cos(t2) * rad,
            Math.sin(t2) * rad,
            hei * 0.5,
            r * 0.9,
            g * 0.9,
            b * 0.9,
            a,
            0,
            0,
            0,
          );
        }
        for (let l = _verts.length / 10, i = _v; i < l; i++) {
          _index.push(_v, i, i + 2);
        }
        _v = _verts.length / 10;
        for (let t = 0, inc = MATH.TWO_PI / sides; t <= MATH.TWO_PI; t += inc) {
          let t1 = t - inc * 0.5,
            t2 = t + inc * 0.5;
          _verts.push(
            Math.cos(t1) * rad2,
            Math.sin(t1) * rad2,
            -hei * 0.5,
            r * 0.7,
            g * 0.7,
            b * 0.7,
            a,
            0,
            0,
            0,
            Math.cos(t2) * rad2,
            Math.sin(t2) * rad2,
            -hei * 0.5,
            r * 0.7,
            g * 0.7,
            b * 0.7,
            a,
            0,
            0,
            0,
          );
        }
        for (let l = _verts.length / 10, i = _v; i < l; i++) {
          _index.push(i, i - 1, _v);
        }

        for (let i in _index) {
          _index[i] += vl;
        }

        index.push(..._index);

        let rotQuat = quat.fromEuler([], rx, ry, rz);

        for (let i = 0; i < _verts.length; i += 10) {
          if (rx) {
            let rotated = vec3.transformQuat(
              [],
              [_verts[i], _verts[i + 1], _verts[i + 2]],
              rotQuat,
            );
            _verts[i] = rotated[0] + x;
            _verts[i + 1] = rotated[1] + y;
            _verts[i + 2] = rotated[2] + z;

            rotated = vec3.transformQuat(
              rotated,
              [_verts[i + 7], _verts[i + 8], _verts[i + 9]],
              rotQuat,
            );

            _verts[i + 7] = rotated[0];
            _verts[i + 8] = rotated[1];
            _verts[i + 9] = rotated[2];
          } else {
            _verts[i] += x;
            _verts[i + 1] += y;
            _verts[i + 2] += z;
          }
        }

        verts.push(..._verts);
      };

      addSphere = function (x, y, z, rad, detail, r, g, b, a, ys = 1) {
        let _m = MATH.icosphere(detail),
          _verts = [],
          _index = [];

        for (let i = 0, l = _m.verts.length; i < l; i += 3) {
          _verts.push(
            _m.verts[i] * rad + x,
            _m.verts[i + 1] * rad * ys + y,
            _m.verts[i + 2] * rad + z,
            r,
            g,
            b,
            a,
            0,
            0,
            0,
          );
        }

        for (let i in _m.index) {
          _index.push(_m.index[i] + verts.length / 10);
        }

        verts.push(..._verts);
        index.push(..._index);
      };

      addLimbBox = function (
        AArot,
        x,
        y,
        z,
        w,
        h,
        l,
        rot,
        u,
        _v,
        useTex = false,
      ) {
        rot = rot || [0, 0, 0];

        let rotation = quat.fromEuler([], rot[0], rot[1], rot[2]);
        let model = mat4.fromRotationTranslation([], rotation, [x, y, z, 1]),
          a = 1;

        let v = [
          [-0.5 * w, 0.5 * h, -0.5 * l],
          [-0.5 * w, 0.5 * h, 0.5 * l],
          [0.5 * w, 0.5 * h, 0.5 * l],
          [0.5 * w, 0.5 * h, -0.5 * l],
          [-0.5 * w, -0.5 * h, -0.5 * l],
          [-0.5 * w, -0.5 * h, 0.5 * l],
          [0.5 * w, -0.5 * h, 0.5 * l],
          [0.5 * w, -0.5 * h, -0.5 * l],
        ];

        let shade = [];

        let normals = [
          [0, 1, 0],
          [0, 0, 1],
          [0, 0, -1],
          [1, 0, 0],
          [-1, 0, 0],
          [0, -1, 0],
        ];

        for (let i = 0, _l = v.length; i < _l; i++) {
          vec3.transformMat4(v[i], v[i], model);

          if (i < 6) {
            vec3.transformQuat(normals[i], normals[i], rotation);
            let n = normals[i];
            let d =
              n[0] * lightDir[0] + n[1] * lightDir[1] + n[2] * lightDir[2];
            shade[i] = d * 0.8 + 0.65;
          }

          switch (AArot) {
            case 1:
              let _temp = v[i][0];
              v[i][0] = -v[i][2];
              v[i][2] = _temp;

              break;

            case 2:
              v[i][0] = -v[i][0];
              v[i][2] = -v[i][2];

              break;

            case 3:
              let __temp = v[i][0];
              v[i][0] = v[i][2];
              v[i][2] = -__temp;

              break;
          }
        }

        let vl = verts.length / 10,
          tv = 126 / 1024,
          col = [1, 1, 1];

        if (!useTex) {
          tv = 0;
        }

        u += 1 / 1024;
        _v += 1 / 1024;

        verts.push(
          v[0][0],
          v[0][1],
          v[0][2],
          col[0] * shade[0],
          col[1] * shade[0],
          col[2] * shade[0],
          a,
          u,
          _v,
          0,
          v[1][0],
          v[1][1],
          v[1][2],
          col[0] * shade[0],
          col[1] * shade[0],
          col[2] * shade[0],
          a,
          u,
          _v,
          0,
          v[2][0],
          v[2][1],
          v[2][2],
          col[0] * shade[0],
          col[1] * shade[0],
          col[2] * shade[0],
          a,
          u,
          _v,
          0,
          v[3][0],
          v[3][1],
          v[3][2],
          col[0] * shade[0],
          col[1] * shade[0],
          col[2] * shade[0],
          a,
          u,
          _v,
          0,

          v[1][0],
          v[1][1],
          v[1][2],
          col[0] * shade[1],
          col[1] * shade[1],
          col[2] * shade[1],
          a,
          u,
          _v,
          0,
          v[2][0],
          v[2][1],
          v[2][2],
          col[0] * shade[1],
          col[1] * shade[1],
          col[2] * shade[1],
          a,
          u + tv,
          _v,
          0,
          v[5][0],
          v[5][1],
          v[5][2],
          col[0] * shade[1],
          col[1] * shade[1],
          col[2] * shade[1],
          a,
          u,
          _v + tv,
          0,
          v[6][0],
          v[6][1],
          v[6][2],
          col[0] * shade[1],
          col[1] * shade[1],
          col[2] * shade[1],
          a,
          u + tv,
          _v + tv,
          0,

          v[0][0],
          v[0][1],
          v[0][2],
          col[0] * shade[2],
          col[1] * shade[2],
          col[2] * shade[2],
          a,
          u,
          _v,
          0,
          v[3][0],
          v[3][1],
          v[3][2],
          col[0] * shade[2],
          col[1] * shade[2],
          col[2] * shade[2],
          a,
          u,
          _v,
          0,
          v[4][0],
          v[4][1],
          v[4][2],
          col[0] * shade[2],
          col[1] * shade[2],
          col[2] * shade[2],
          a,
          u,
          _v,
          0,
          v[7][0],
          v[7][1],
          v[7][2],
          col[0] * shade[2],
          col[1] * shade[2],
          col[2] * shade[2],
          a,
          u,
          _v,
          0,

          v[2][0],
          v[2][1],
          v[2][2],
          col[0] * shade[3],
          col[1] * shade[3],
          col[2] * shade[3],
          a,
          u,
          _v,
          0,
          v[3][0],
          v[3][1],
          v[3][2],
          col[0] * shade[3],
          col[1] * shade[3],
          col[2] * shade[3],
          a,
          u,
          _v,
          0,
          v[6][0],
          v[6][1],
          v[6][2],
          col[0] * shade[3],
          col[1] * shade[3],
          col[2] * shade[3],
          a,
          u,
          _v,
          0,
          v[7][0],
          v[7][1],
          v[7][2],
          col[0] * shade[3],
          col[1] * shade[3],
          col[2] * shade[3],
          a,
          u,
          _v,
          0,

          v[0][0],
          v[0][1],
          v[0][2],
          col[0] * shade[4],
          col[1] * shade[4],
          col[2] * shade[4],
          a,
          u,
          _v,
          0,
          v[1][0],
          v[1][1],
          v[1][2],
          col[0] * shade[4],
          col[1] * shade[4],
          col[2] * shade[4],
          a,
          u,
          _v,
          0,
          v[4][0],
          v[4][1],
          v[4][2],
          col[0] * shade[4],
          col[1] * shade[4],
          col[2] * shade[4],
          a,
          u,
          _v,
          0,
          v[5][0],
          v[5][1],
          v[5][2],
          col[0] * shade[4],
          col[1] * shade[4],
          col[2] * shade[4],
          a,
          u,
          _v,
          0,

          v[4][0],
          v[4][1],
          v[4][2],
          col[0] * shade[5],
          col[1] * shade[5],
          col[2] * shade[5],
          a,
          u,
          _v,
          0,
          v[5][0],
          v[5][1],
          v[5][2],
          col[0] * shade[5],
          col[1] * shade[5],
          col[2] * shade[5],
          a,
          u,
          _v,
          0,
          v[6][0],
          v[6][1],
          v[6][2],
          col[0] * shade[5],
          col[1] * shade[5],
          col[2] * shade[5],
          a,
          u,
          _v,
          0,
          v[7][0],
          v[7][1],
          v[7][2],
          col[0] * shade[5],
          col[1] * shade[5],
          col[2] * shade[5],
          a,
          u,
          _v,
          0,
        );

        index.push(
          0 + vl,
          1 + vl,
          2 + vl,
          0 + vl,
          2 + vl,
          3 + vl,
          5 + vl,
          6 + vl,
          7 + vl,
          6 + vl,
          5 + vl,
          4 + vl,
          8 + vl,
          9 + vl,
          10 + vl,
          11 + vl,
          10 + vl,
          9 + vl,
          14 + vl,
          13 + vl,
          12 + vl,
          13 + vl,
          14 + vl,
          15 + vl,
          18 + vl,
          17 + vl,
          16 + vl,
          17 + vl,
          18 + vl,
          19 + vl,
          22 + vl,
          21 + vl,
          20 + vl,
          23 + vl,
          22 + vl,
          20 + vl,
        );
      };

      addLimbCylinder = function (
        AArot,
        x,
        y,
        z,
        rad,
        hei,
        sides,
        r,
        g,
        b,
        a,
        rx,
        ry,
        rz,
        u,
        __v,
      ) {
        u += 1 / 1024;
        __v += 1 / 1024;

        let rad2 = rad,
          vl = verts.length / 10,
          _verts = [],
          _index = [];

        for (let t = 0, inc = MATH.TWO_PI / sides; t <= MATH.TWO_PI; t += inc) {
          let t1 = t - inc * 0.5,
            t2 = t + inc * 0.5,
            s = Math.sin(t1) * 0.1 + 0.9;
          _verts.push(
            Math.cos(t1) * rad,
            Math.sin(t1) * rad,
            hei * 0.5,
            r * s,
            g * s,
            b * s,
            a,
            u,
            __v,
            0,
            Math.cos(t1) * rad2,
            Math.sin(t1) * rad2,
            -hei * 0.5,
            r * s,
            g * s,
            b * s,
            a,
            u,
            __v,
            0,
            Math.cos(t2) * rad,
            Math.sin(t2) * rad,
            hei * 0.5,
            r * s,
            g * s,
            b * s,
            a,
            u,
            __v,
            0,
            Math.cos(t2) * rad2,
            Math.sin(t2) * rad2,
            -hei * 0.5,
            r * s,
            g * s,
            b * s,
            a,
            u,
            __v,
            0,
          );

          let _vl = _verts.length / 10;
          _index.push(_vl, _vl + 1, _vl + 2, _vl + 3, _vl + 2, _vl + 1);
        }

        let _v = _verts.length / 10;

        for (let t = 0, inc = MATH.TWO_PI / sides; t <= MATH.TWO_PI; t += inc) {
          let t1 = t - inc * 0.5,
            t2 = t + inc * 0.5;
          _verts.push(
            Math.cos(t1) * rad,
            Math.sin(t1) * rad,
            hei * 0.5,
            r * 0.9,
            g * 0.9,
            b * 0.9,
            a,
            u,
            __v,
            0,
            Math.cos(t2) * rad,
            Math.sin(t2) * rad,
            hei * 0.5,
            r * 0.9,
            g * 0.9,
            b * 0.9,
            a,
            u,
            __v,
            0,
          );
        }
        for (let l = _verts.length / 10, i = _v; i < l; i++) {
          _index.push(_v, i, i + 2);
        }
        _v = _verts.length / 10;
        for (let t = 0, inc = MATH.TWO_PI / sides; t <= MATH.TWO_PI; t += inc) {
          let t1 = t - inc * 0.5,
            t2 = t + inc * 0.5;
          _verts.push(
            Math.cos(t1) * rad2,
            Math.sin(t1) * rad2,
            -hei * 0.5,
            r * 0.7,
            g * 0.7,
            b * 0.7,
            a,
            u,
            __v,
            0,
            Math.cos(t2) * rad2,
            Math.sin(t2) * rad2,
            -hei * 0.5,
            r * 0.7,
            g * 0.7,
            b * 0.7,
            a,
            u,
            __v,
            0,
          );
        }
        for (let l = _verts.length / 10, i = _v; i < l; i++) {
          _index.push(i, i - 1, _v);
        }

        for (let i in _index) {
          _index[i] += vl;
        }

        index.push(..._index);

        let rotQuat = quat.fromEuler([], rx, ry, rz);

        for (let i = 0; i < _verts.length; i += 10) {
          if (rx) {
            let rotated = vec3.transformQuat(
              [],
              [_verts[i], _verts[i + 1], _verts[i + 2]],
              rotQuat,
            );
            _verts[i] = rotated[0] + x;
            _verts[i + 1] = rotated[1] + y;
            _verts[i + 2] = rotated[2] + z;

            rotated = vec3.transformQuat(
              rotated,
              [_verts[i + 7], _verts[i + 8], _verts[i + 9]],
              rotQuat,
            );

            _verts[i + 7] = rotated[0];
            _verts[i + 8] = rotated[1];
            _verts[i + 9] = rotated[2];
          } else {
            _verts[i] += x;
            _verts[i + 1] += y;
            _verts[i + 2] += z;
          }

          switch (AArot) {
            case 1:
              let _temp = _verts[i];
              _verts[i] = -_verts[i + 2];
              _verts[i + 2] = _temp;

              break;

            case 2:
              _verts[i] = -_verts[i];
              _verts[i + 2] = -_verts[i + 2];

              break;

            case 3:
              let __temp = _verts[i];
              _verts[i] = _verts[i + 2];
              _verts[i + 2] = -__temp;

              break;
          }
        }

        verts.push(..._verts);
      };
    } else {
      addBox = function (x, y, z, w, h, l, rot, col, rot2 = [0, 0, 0]) {
        rot = rot || [0, 0, 0];

        let rotation = quat.fromEuler([], rot[0], rot[1], rot[2]),
          rotation2 = quat.fromEuler([], rot2[0], rot2[1], rot2[2]);
        let model = mat4.fromRotationTranslation([], rotation, [x, y, z, 1]);

        let v = [
          [-0.5 * w, 0.5 * h, -0.5 * l],
          [-0.5 * w, 0.5 * h, 0.5 * l],
          [0.5 * w, 0.5 * h, 0.5 * l],
          [0.5 * w, 0.5 * h, -0.5 * l],
          [-0.5 * w, -0.5 * h, -0.5 * l],
          [-0.5 * w, -0.5 * h, 0.5 * l],
          [0.5 * w, -0.5 * h, 0.5 * l],
          [0.5 * w, -0.5 * h, -0.5 * l],
        ];

        let normals = [
          [0, 1, 0],
          [0, 0, 1],
          [0, 0, -1],
          [1, 0, 0],
          [-1, 0, 0],
          [0, -1, 0],
        ];

        for (let i = 0, _l = v.length; i < _l; i++) {
          vec3.transformMat4(v[i], v[i], model);
          vec3.transformQuat(v[i], v[i], rotation2);

          if (i < 6) {
            vec3.transformQuat(normals[i], normals[i], rotation);
          }

          vec3.transformMat4(v[i], v[i], DIS.matrix);
        }

        let vl = verts.length / 9,
          n = normals;

        verts.push(
          v[0][0],
          v[0][1],
          v[0][2],
          col[0],
          col[1],
          col[2],
          n[0][0],
          n[0][1],
          n[0][2],
          v[1][0],
          v[1][1],
          v[1][2],
          col[0],
          col[1],
          col[2],
          n[0][0],
          n[0][1],
          n[0][2],
          v[2][0],
          v[2][1],
          v[2][2],
          col[0],
          col[1],
          col[2],
          n[0][0],
          n[0][1],
          n[0][2],
          v[3][0],
          v[3][1],
          v[3][2],
          col[0],
          col[1],
          col[2],
          n[0][0],
          n[0][1],
          n[0][2],

          v[1][0],
          v[1][1],
          v[1][2],
          col[0],
          col[1],
          col[2],
          n[1][0],
          n[1][1],
          n[1][2],
          v[2][0],
          v[2][1],
          v[2][2],
          col[0],
          col[1],
          col[2],
          n[1][0],
          n[1][1],
          n[1][2],
          v[5][0],
          v[5][1],
          v[5][2],
          col[0],
          col[1],
          col[2],
          n[1][0],
          n[1][1],
          n[1][2],
          v[6][0],
          v[6][1],
          v[6][2],
          col[0],
          col[1],
          col[2],
          n[1][0],
          n[1][1],
          n[1][2],

          v[0][0],
          v[0][1],
          v[0][2],
          col[0],
          col[1],
          col[2],
          n[2][0],
          n[2][1],
          n[2][2],
          v[3][0],
          v[3][1],
          v[3][2],
          col[0],
          col[1],
          col[2],
          n[2][0],
          n[2][1],
          n[2][2],
          v[4][0],
          v[4][1],
          v[4][2],
          col[0],
          col[1],
          col[2],
          n[2][0],
          n[2][1],
          n[2][2],
          v[7][0],
          v[7][1],
          v[7][2],
          col[0],
          col[1],
          col[2],
          n[2][0],
          n[2][1],
          n[2][2],

          v[2][0],
          v[2][1],
          v[2][2],
          col[0],
          col[1],
          col[2],
          n[3][0],
          n[3][1],
          n[3][2],
          v[3][0],
          v[3][1],
          v[3][2],
          col[0],
          col[1],
          col[2],
          n[3][0],
          n[3][1],
          n[3][2],
          v[6][0],
          v[6][1],
          v[6][2],
          col[0],
          col[1],
          col[2],
          n[3][0],
          n[3][1],
          n[3][2],
          v[7][0],
          v[7][1],
          v[7][2],
          col[0],
          col[1],
          col[2],
          n[3][0],
          n[3][1],
          n[3][2],

          v[0][0],
          v[0][1],
          v[0][2],
          col[0],
          col[1],
          col[2],
          n[4][0],
          n[4][1],
          n[4][2],
          v[1][0],
          v[1][1],
          v[1][2],
          col[0],
          col[1],
          col[2],
          n[4][0],
          n[4][1],
          n[4][2],
          v[4][0],
          v[4][1],
          v[4][2],
          col[0],
          col[1],
          col[2],
          n[4][0],
          n[4][1],
          n[4][2],
          v[5][0],
          v[5][1],
          v[5][2],
          col[0],
          col[1],
          col[2],
          n[4][0],
          n[4][1],
          n[4][2],

          v[4][0],
          v[4][1],
          v[4][2],
          col[0],
          col[1],
          col[2],
          n[5][0],
          n[5][1],
          n[5][2],
          v[5][0],
          v[5][1],
          v[5][2],
          col[0],
          col[1],
          col[2],
          n[5][0],
          n[5][1],
          n[5][2],
          v[6][0],
          v[6][1],
          v[6][2],
          col[0],
          col[1],
          col[2],
          n[5][0],
          n[5][1],
          n[5][2],
          v[7][0],
          v[7][1],
          v[7][2],
          col[0],
          col[1],
          col[2],
          n[5][0],
          n[5][1],
          n[5][2],
        );

        index.push(
          0 + vl,
          1 + vl,
          2 + vl,
          0 + vl,
          2 + vl,
          3 + vl,
          5 + vl,
          6 + vl,
          7 + vl,
          6 + vl,
          5 + vl,
          4 + vl,
          8 + vl,
          9 + vl,
          10 + vl,
          11 + vl,
          10 + vl,
          9 + vl,
          14 + vl,
          13 + vl,
          12 + vl,
          13 + vl,
          14 + vl,
          15 + vl,
          18 + vl,
          17 + vl,
          16 + vl,
          17 + vl,
          18 + vl,
          19 + vl,
          22 + vl,
          21 + vl,
          20 + vl,
          23 + vl,
          22 + vl,
          20 + vl,
        );
      };

      addCylinder = function (
        x,
        y,
        z,
        rad,
        hei,
        sides,
        r,
        g,
        b,
        rx,
        ry,
        rz,
        r2,
      ) {
        let rad2 = r2 ?? rad,
          vl = verts.length / 9,
          _verts = [],
          _index = [];

        for (let t = 0, inc = MATH.TWO_PI / sides; t <= MATH.TWO_PI; t += inc) {
          let t1 = t - inc * 0.5,
            t2 = t + inc * 0.5;
          _verts.push(
            Math.cos(t1) * rad,
            Math.sin(t1) * rad,
            hei * 0.5,
            r,
            g,
            b,
            Math.cos(t1),
            Math.sin(t1),
            0,
            Math.cos(t1) * rad2,
            Math.sin(t1) * rad2,
            -hei * 0.5,
            r,
            g,
            b,
            Math.cos(t1),
            Math.sin(t1),
            0,
            Math.cos(t2) * rad,
            Math.sin(t2) * rad,
            hei * 0.5,
            r,
            g,
            b,
            Math.cos(t2),
            Math.sin(t2),
            0,
            Math.cos(t2) * rad2,
            Math.sin(t2) * rad2,
            -hei * 0.5,
            r,
            g,
            b,
            Math.cos(t2),
            Math.sin(t2),
            0,
          );

          let _vl = _verts.length / 9;
          _index.push(_vl, _vl + 1, _vl + 2, _vl + 3, _vl + 2, _vl + 1);
        }

        let _v = _verts.length / 9;

        for (let t = 0, inc = MATH.TWO_PI / sides; t <= MATH.TWO_PI; t += inc) {
          let t1 = t - inc * 0.5,
            t2 = t + inc * 0.5;
          _verts.push(
            Math.cos(t1) * rad,
            Math.sin(t1) * rad,
            hei * 0.5,
            r,
            g,
            b,
            0,
            0,
            1,
            Math.cos(t2) * rad,
            Math.sin(t2) * rad,
            hei * 0.5,
            r,
            g,
            b,
            0,
            0,
            1,
          );
        }
        for (let l = _verts.length / 9, i = _v; i < l - 1; i++) {
          _index.push(_v, i, i + 2);
        }
        _v = _verts.length / 9;
        for (let t = 0, inc = MATH.TWO_PI / sides; t <= MATH.TWO_PI; t += inc) {
          let t1 = t - inc * 0.5,
            t2 = t + inc * 0.5;
          _verts.push(
            Math.cos(t1) * rad2,
            Math.sin(t1) * rad2,
            -hei * 0.5,
            r,
            g,
            b,
            0,
            0,
            -1,
            Math.cos(t2) * rad2,
            Math.sin(t2) * rad2,
            -hei * 0.5,
            r,
            g,
            b,
            0,
            0,
            -1,
          );
        }
        for (let l = _verts.length / 9, i = _v; i < l; i++) {
          _index.push(i, i - 1, _v);
        }

        for (let i in _index) {
          _index[i] += vl;
        }

        index.push(..._index);

        let rotQuat = quat.fromEuler([], rx, ry, rz);

        for (let i = 0; i < _verts.length; i += 9) {
          if (rx) {
            let rotated = vec3.transformQuat(
              [],
              [_verts[i], _verts[i + 1], _verts[i + 2]],
              rotQuat,
            );
            _verts[i] = rotated[0] + x;
            _verts[i + 1] = rotated[1] + y;
            _verts[i + 2] = rotated[2] + z;

            rotated = vec3.transformQuat(
              rotated,
              [_verts[i + 6], _verts[i + 7], _verts[i + 8]],
              rotQuat,
            );

            _verts[i + 6] = rotated[0];
            _verts[i + 7] = rotated[1];
            _verts[i + 8] = rotated[2];
          } else {
            _verts[i] += x;
            _verts[i + 1] += y;
            _verts[i + 2] += z;
          }

          [_verts[i], _verts[i + 1], _verts[i + 2]] = vec3.transformMat4(
            [],
            [_verts[i], _verts[i + 1], _verts[i + 2]],
            DIS.matrix,
          );
        }

        verts.push(..._verts);
      };

      addSphere = function (x, y, z, rad, detail, r, g, b, vl) {
        let _m = MATH.icosphere(detail),
          _verts = [],
          _index = [];

        for (let i = 0, l = _m.verts.length; i < l; i += 3) {
          _verts.push(
            _m.verts[i] * rad + x,
            _m.verts[i + 1] * rad + y,
            _m.verts[i + 2] * rad + z,
            r,
            g,
            b,
            _m.verts[i],
            _m.verts[i + 1],
            _m.verts[i + 2],
          );
        }

        for (let i in _m.index) {
          _index.push(_m.index[i] + verts.length / 9);
        }

        for (let i = 0; i < _verts.length; i += 9) {
          [_verts[i], _verts[i + 1], _verts[i + 2]] = vec3.transformMat4(
            [],
            [_verts[i], _verts[i + 1], _verts[i + 2]],
            DIS.matrix,
          );
        }

        verts.push(..._verts);
        index.push(..._index);
      };

      addStar = function (
        x,
        y,
        z,
        innerRad,
        outerRad,
        thickness,
        depth,
        r,
        g,
        b,
        la = 0.75,
        lb = 0.25,
        rx = 0,
        ry = 0,
        rz = 0,
      ) {
        let rotQuat = quat.fromEuler([], rx, ry, rz);

        innerRad *= 0.8;
        let _verts = [],
          _index = [],
          pos = [],
          vs = [],
          ix = [],
          j = 0,
          vl = verts.length / 9;

        for (let i = 0; i < MATH.TWO_PI; i += MATH.TWO_PI / 10) {
          let r = j++ % 2 === 0 ? outerRad : innerRad;

          pos.push([Math.sin(i) * r, Math.cos(i) * r, -thickness]);
        }

        j = 0;

        for (let i = 0; i < MATH.TWO_PI; i += MATH.TWO_PI / 10) {
          let r = j++ % 2 === 0 ? outerRad : innerRad;

          pos.push([Math.sin(i) * r, Math.cos(i) * r, thickness]);
        }

        pos.push([0, 0, -depth], [0, 0, depth]);

        vs.push(
          0,
          1,
          20,
          1,
          2,
          20,
          2,
          3,
          20,
          3,
          4,
          20,
          4,
          5,
          20,
          5,
          6,
          20,
          6,
          7,
          20,
          7,
          8,
          20,
          8,
          9,
          20,
          9,
          0,
          20,
          11,
          10,
          21,
          12,
          11,
          21,
          13,
          12,
          21,
          14,
          13,
          21,
          15,
          14,
          21,
          16,
          15,
          21,
          17,
          16,
          21,
          18,
          17,
          21,
          19,
          18,
          21,
          10,
          19,
          21,
          9,
          10,
          0,
        );

        ix.push(
          2,
          1,
          0,
          5,
          4,
          3,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23,
          24,
          25,
          26,
          27,
          28,
          29,
          30,
          31,
          32,
          33,
          34,
          35,
          36,
          37,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          46,
          47,
          48,
          49,
          50,
          51,
          52,
          53,
          54,
          55,
          56,
          57,
          58,
          59,
          60,
          61,
          62,
        );

        for (let i = 0; i < 10; i++) {
          vs.push(0 + i, 10 + i, 1 + i, 11 + i, 1 + i, 10 + i);
          ix.push(i * 6, i * 6 + 1, i * 6 + 2, i * 6 + 3, i * 6 + 4, i * 6 + 5);
        }

        for (let i = 63; i < ix.length; i++) {
          ix[i] += 63;
        }

        for (let i = 0; i < pos.length; i++) {
          vec3.transformQuat(pos[i], pos[i], rotQuat);
          vec3.add(pos[i], pos[i], [x, y, z]);
          vec3.transformMat4(pos[i], pos[i], DIS.matrix);
        }

        for (let i in vs) {
          vs[i] = pos[vs[i]];
        }

        _index = ix;

        let findNorm = (a, b, c) => {
          a = vs[a];
          b = vs[b];
          c = vs[c];

          let n = vec3.cross(
            [],
            [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
            [a[0] - c[0], a[1] - c[1], a[2] - c[2]],
          );

          return vec3.normalize(n, n);
        };

        for (let i = 0; i < _index.length; i += 3) {
          let i1 = _index[i],
            i2 = _index[i + 1],
            i3 = _index[i + 2],
            shade =
              vec3.dot([0.035, 0.175, 0.053], findNorm(i1, i2, i3)) * la + lb;

          verts.push(
            ...vs[i1],
            r * shade,
            g * shade,
            b * shade,
            0,
            1,
            0,
            ...vs[i2],
            r * shade,
            g * shade,
            b * shade,
            0,
            1,
            0,
            ...vs[i3],
            r * shade,
            g * shade,
            b * shade,
            0,
            1,
            0,
          );
        }

        for (let i in _index) {
          _index[i] += vl;
        }

        index.push(..._index);
      };

      applyFinalRotation = function (x, y, z) {
        if (!mat4.exactEquals(DIS.matrix, DIS.ogMatrix)) return;

        let q = quat.fromEuler([], x, y, z);

        for (let i = 0; i < verts.length; i += 9) {
          let v = vec3.transformQuat(
            [],
            [verts[i], verts[i + 1], verts[i + 2]],
            q,
          );

          verts[i] = v[0];
          verts[i + 1] = v[1];
          verts[i + 2] = v[2];
        }
      };
    }

    func(
      addBox,
      addHiveSlot,
      addCylinder,
      addSphere,
      applyFinalRotation,
      addGiftedRing,
      addStar,
      addLimbBox,
      addLimbCylinder,
    );
    this.setMesh(verts, index);
  }

  /**
   * Uploads mesh data to GPU memory.
   * Binds vertex and index buffers and transfers data to the GPU.
   * Uses STATIC_DRAW hint for both static and dynamic meshes.
   *
   * @note Both branches currently use STATIC_DRAW; dynamic meshes should use DYNAMIC_DRAW
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData}
   */
  setBuffers() {
    if (this.isStatic) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.buffers.verts);
      gl.bufferData(gl.ARRAY_BUFFER, this.mesh.data.verts, gl.STATIC_DRAW);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mesh.buffers.index);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        this.mesh.data.index,
        gl.STATIC_DRAW,
      );
    } else {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.buffers.verts);
      gl.bufferData(gl.ARRAY_BUFFER, this.mesh.data.verts, gl.STATIC_DRAW);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mesh.buffers.index);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        this.mesh.data.index,
        gl.STATIC_DRAW,
      );
    }
  }

  /**
   * Renders the mesh using WebGL.
   * Binds buffers, configures vertex attributes, and draws the mesh.
   *
   * Static meshes use: position (3), color (4), and UV (3) attributes.
   * Dynamic meshes use: position (3), color (3), and normal (3) attributes.
   *
   * Vertex layout (static):
   * - Bytes 0-11: Position (3 floats)
   * - Bytes 12-27: Color (4 floats)
   * - Bytes 28-39: UV (3 floats)
   * - Stride: 40 bytes per vertex
   *
   * Vertex layout (dynamic):
   * - Bytes 0-11: Position (3 floats)
   * - Bytes 12-23: Color (3 floats)
   * - Bytes 24-35: Normal (3 floats)
   * - Stride: 36 bytes per vertex
   *
   * @requires glCache.static_vertPos, glCache.static_vertColor, glCache.static_vertUV - for static meshes
   * @requires glCache.dynamic_vertPos, glCache.dynamic_vertColor, glCache.dynamic_vertNormal - for dynamic meshes
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer}
   */
  render() {
    if (this.isStatic) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.buffers.verts);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mesh.buffers.index);

      gl.vertexAttribPointer(
        glCache.static_vertPos,
        3,
        gl.FLOAT,
        gl.FALSE,
        40,
        0,
      );
      gl.vertexAttribPointer(
        glCache.static_vertColor,
        4,
        gl.FLOAT,
        gl.FALSE,
        40,
        12,
      );
      gl.vertexAttribPointer(
        glCache.static_vertUV,
        3,
        gl.FLOAT,
        gl.FALSE,
        40,
        28,
      );
    } else {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.buffers.verts);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mesh.buffers.index);

      gl.vertexAttribPointer(
        glCache.dynamic_vertPos,
        3,
        gl.FLOAT,
        gl.FALSE,
        36,
        0,
      );
      gl.vertexAttribPointer(
        glCache.dynamic_vertColor,
        3,
        gl.FLOAT,
        gl.FALSE,
        36,
        12,
      );
      gl.vertexAttribPointer(
        glCache.dynamic_vertNormal,
        3,
        gl.FLOAT,
        gl.FALSE,
        36,
        24,
      );
    }

    gl.drawElements(gl.TRIANGLES, this.mesh.indexAmount, gl.UNSIGNED_SHORT, 0);
  }
}
