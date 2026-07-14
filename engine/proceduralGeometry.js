// engine/proceduralGeometry.js
//
// CHQ: Claude AI (Sonnet) created file
//
// Trimmed port of Mesh.js's addBox/addCylinder/addSphere generator
// functions. CANNON physics-body creation is intentionally removed -
// collision volumes are a separate concern now, not bundled into mesh
// geometry building.
//
// Also removed: the old `DIS.matrix` transform-baking step present in
// the dynamic variants. Whole-object world placement now happens via a
// model-matrix uniform at draw time (see renderer.js drawMobs/drawTurrets
// pattern); these builders only produce local/object-space geometry.
// The x/y/z/rot params here position a *sub-piece* within one mesh
// (e.g. a limb offset from a body's local origin), not the whole object
// in world space.
//
// Static variant  -> 10 floats/vertex: pos(3), color(3), alpha(1), uv(2), layer(1)
//                    feeds programs.static (staticVSH/staticFSH)
// Dynamic variant ->  9 floats/vertex: pos(3), color(3), normal(3)
//                    feeds programs.dynamic (dynamicVSH/dynamicFSH)

import { quat, vec3, mat4 } from "gl-matrix";

// Shared once: light direction used for static-variant baked shading.
// Matches the LIGHT_DIR constant substituted into dynamicFSH in
// renderer.js's prepareShaderSource (vec3(0.5, 0.8, 0.2)), kept in sync
// here since static-variant shading is computed on the CPU rather than
// in the fragment shader.
const LIGHT_DIR = [0.5, 0.8, 0.2];
{
  const m =
    1 /
    Math.sqrt(
      LIGHT_DIR[0] * LIGHT_DIR[0] +
        LIGHT_DIR[1] * LIGHT_DIR[1] +
        LIGHT_DIR[2] * LIGHT_DIR[2],
    );
  LIGHT_DIR[0] *= m;
  LIGHT_DIR[1] *= m;
  LIGHT_DIR[2] *= m;
}

const BOX_CORNER_SIGNS = [
  [-0.5, 0.5, -0.5],
  [-0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5],
  [0.5, 0.5, -0.5],
  [-0.5, -0.5, -0.5],
  [-0.5, -0.5, 0.5],
  [0.5, -0.5, 0.5],
  [0.5, -0.5, -0.5],
];

const BOX_FACE_NORMALS = [
  [0, 1, 0],
  [0, 0, 1],
  [0, 0, -1],
  [1, 0, 0],
  [-1, 0, 0],
  [0, -1, 0],
];

// Face->corner-index winding, shared by both variants (identical
// connectivity in the old code's static and dynamic addBox).
const BOX_FACE_INDICES = [
  [0, 1, 2, 3],
  [1, 2, 5, 6],
  [0, 3, 4, 7],
  [2, 3, 6, 7],
  [0, 1, 4, 5],
  [4, 5, 6, 7],
];

function boxTriIndices(vl) {
  const idx = [];
  for (let f = 0; f < 6; f++) {
    const b = vl + f * 4;
    idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  return idx;
}

/**
 * Static-pipeline box. Bakes per-face shading (dot against LIGHT_DIR)
 * directly into vertex color, since programs.static does no per-fragment
 * lighting of its own.
 *
 * @param {number[]} verts - flat output array (10 floats/vertex)
 * @param {number[]} index - flat output triangle index array
 * @param {number} x,y,z - local offset within the assembled mesh
 * @param {number} w,h,l - box dimensions
 * @param {number[]} [rot] - [rx,ry,rz] euler degrees, default [0,0,0]
 * @param {number[]} col - [r,g,b,a] (a optional, defaults to 1)
 * @param {number} [uvW] - u-repeat width for texturing (0 disables texture UVs)
 * @param {number} [uvL] - v-repeat length for texturing
 */
export function addBoxStatic(
  verts,
  index,
  x,
  y,
  z,
  w,
  h,
  l,
  rot,
  col,
  uvW = w,
  uvL = l,
) {
  rot = rot || [0, 0, 0];
  const a = col[3] ?? 1;
  const r = col[0] * 1.2;
  const g = col[1] * 1.2;
  const b = col[2] * 1.2;

  const rotation = quat.fromEuler([], rot[0], rot[1], rot[2]);
  const model = mat4.fromRotationTranslation([], rotation, [x, y, z, 1]);

  const corners = BOX_CORNER_SIGNS.map((c) => [c[0] * w, c[1] * h, c[2] * l]);
  const normals = BOX_FACE_NORMALS.map((n) => [...n]);
  const shade = [];

  for (let i = 0; i < corners.length; i++) {
    vec3.transformMat4(corners[i], corners[i], model);
  }
  for (let i = 0; i < normals.length; i++) {
    vec3.transformQuat(normals[i], normals[i], rotation);
    const n = normals[i];
    const d = n[0] * LIGHT_DIR[0] + n[1] * LIGHT_DIR[1] + n[2] * LIGHT_DIR[2];
    shade[i] = d * 0.8 + 0.65;
  }

  // Per-face UV rectangles matching the old code's (w,l)/(w,h)/(l,h) pairing
  // per face orientation.
  const faceUV = [
    [
      [uvW, uvL],
      [uvW, 0],
      [0, 0],
      [0, uvL],
    ],
    [
      [0, 0],
      [uvW, 0],
      [0, h],
      [uvW, h],
    ],
    [
      [uvW, h],
      [0, h],
      [uvW, 0],
      [0, 0],
    ],
    [
      [0, 0],
      [uvL, 0],
      [0, h],
      [uvL, h],
    ],
    [
      [0, 0],
      [uvL, 0],
      [0, h],
      [uvL, h],
    ],
    [
      [0, uvL],
      [0, 0],
      [uvW, 0],
      [uvW, uvL],
    ],
  ];

  const vl = verts.length / 10;

  for (let f = 0; f < 6; f++) {
    const s = shade[f];
    for (let c = 0; c < 4; c++) {
      const corner = corners[BOX_FACE_INDICES[f][c]];
      const [u, v] = faceUV[f][c];
      verts.push(
        corner[0],
        corner[1],
        corner[2],
        r * s,
        g * s,
        b * s,
        a,
        u,
        v,
        0,
      );
    }
  }

  index.push(...boxTriIndices(vl));
}

/**
 * Dynamic-pipeline box. Pushes raw color + per-face normal; shading is
 * computed in dynamicFSH (dot against LIGHT_DIR uniform-substituted constant)
 * rather than on the CPU.
 */
export function addBoxDynamic(verts, index, x, y, z, w, h, l, rot, col) {
  rot = rot || [0, 0, 0];
  const rotation = quat.fromEuler([], rot[0], rot[1], rot[2]);
  const model = mat4.fromRotationTranslation([], rotation, [x, y, z, 1]);

  const corners = BOX_CORNER_SIGNS.map((c) => [c[0] * w, c[1] * h, c[2] * l]);
  const normals = BOX_FACE_NORMALS.map((n) => [...n]);

  for (let i = 0; i < corners.length; i++) {
    vec3.transformMat4(corners[i], corners[i], model);
  }
  for (let i = 0; i < normals.length; i++) {
    vec3.transformQuat(normals[i], normals[i], rotation);
  }

  const vl = verts.length / 9;

  for (let f = 0; f < 6; f++) {
    const n = normals[f];
    for (let c = 0; c < 4; c++) {
      const corner = corners[BOX_FACE_INDICES[f][c]];
      verts.push(
        corner[0],
        corner[1],
        corner[2],
        col[0],
        col[1],
        col[2],
        n[0],
        n[1],
        n[2],
      );
    }
  }

  // NOTE: dynamic index stride differs from static only in that vl is
  // computed against a 9-float stride above; connectivity is identical.
  for (let f = 0; f < 6; f++) {
    const bIdx = vl + f * 4;
    index.push(bIdx, bIdx + 1, bIdx + 2, bIdx, bIdx + 2, bIdx + 3);
  }
}

/**
 * Static-pipeline cylinder (or frustum when r2 differs from rad).
 * rx/ry/rz are optional euler-degree rotations applied post-hoc to the
 * whole cylinder (matches old code's "build unrotated, then rotate if
 * rx truthy" shortcut - rotation is skipped entirely when rx is falsy,
 * same behavior preserved here for parity).
 */
export function addCylinderStatic(
  verts,
  index,
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
  rx = 0,
  ry = 0,
  rz = 0,
  r2,
  shading = true,
) {
  const rad2 = r2 ?? rad;
  const vl = verts.length / 10;
  const _verts = [];
  const _index = [];

  for (let t = 0, inc = (Math.PI * 2) / sides; t <= Math.PI * 2; t += inc) {
    const t1 = t - inc * 0.5;
    const t2 = t + inc * 0.5;
    const s = shading ? Math.sin(t1) * 0.1 + 0.9 : 1;

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

    const _vl = _verts.length / 10;
    _index.push(_vl, _vl + 1, _vl + 2, _vl + 3, _vl + 2, _vl + 1);
  }

  let _v = _verts.length / 10;
  for (let t = 0, inc = (Math.PI * 2) / sides; t <= Math.PI * 2; t += inc) {
    const t1 = t - inc * 0.5;
    const t2 = t + inc * 0.5;
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
  for (let l = _verts.length / 10, i = _v; i < l; i++)
    _index.push(_v, i, i + 2);

  _v = _verts.length / 10;
  for (let t = 0, inc = (Math.PI * 2) / sides; t <= Math.PI * 2; t += inc) {
    const t1 = t - inc * 0.5;
    const t2 = t + inc * 0.5;
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
  for (let l = _verts.length / 10, i = _v; i < l; i++)
    _index.push(i, i - 1, _v);

  for (let i = 0; i < _index.length; i++) _index[i] += vl;
  index.push(..._index);

  const rotQuat = quat.fromEuler([], rx, ry, rz);
  for (let i = 0; i < _verts.length; i += 10) {
    if (rx) {
      const rotated = vec3.transformQuat(
        [],
        [_verts[i], _verts[i + 1], _verts[i + 2]],
        rotQuat,
      );
      _verts[i] = rotated[0] + x;
      _verts[i + 1] = rotated[1] + y;
      _verts[i + 2] = rotated[2] + z;
    } else {
      _verts[i] += x;
      _verts[i + 1] += y;
      _verts[i + 2] += z;
    }
  }

  verts.push(..._verts);
}

/**
 * Dynamic-pipeline cylinder. Pushes a pseudo-normal (cos/sin of the angle,
 * 0) on the side faces rather than a baked shade value, whichh matches the old
 * dynamic addCylinder's attribute layout exactly.
 */
export function addCylinderDynamic(
  verts,
  index,
  x,
  y,
  z,
  rad,
  hei,
  sides,
  r,
  g,
  b,
  rx = 0,
  ry = 0,
  rz = 0,
  r2,
) {
  const rad2 = r2 ?? rad;
  const vl = verts.length / 9;
  const _verts = [];
  const _index = [];

  for (let t = 0, inc = (Math.PI * 2) / sides; t <= Math.PI * 2; t += inc) {
    const t1 = t - inc * 0.5;
    const t2 = t + inc * 0.5;
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

    const _vl = _verts.length / 9;
    _index.push(_vl, _vl + 1, _vl + 2, _vl + 3, _vl + 2, _vl + 1);
  }

  let _v = _verts.length / 9;
  for (let t = 0, inc = (Math.PI * 2) / sides; t <= Math.PI * 2; t += inc) {
    const t1 = t - inc * 0.5;
    const t2 = t + inc * 0.5;
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
  for (let l = _verts.length / 9, i = _v; i < l - 1; i++)
    _index.push(_v, i, i + 2);

  _v = _verts.length / 9;
  for (let t = 0, inc = (Math.PI * 2) / sides; t <= Math.PI * 2; t += inc) {
    const t1 = t - inc * 0.5;
    const t2 = t + inc * 0.5;
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
  for (let l = _verts.length / 9, i = _v; i < l; i++) _index.push(i, i - 1, _v);

  for (let i = 0; i < _index.length; i++) _index[i] += vl;
  index.push(..._index);

  const rotQuat = quat.fromEuler([], rx, ry, rz);
  for (let i = 0; i < _verts.length; i += 9) {
    if (rx) {
      const rotated = vec3.transformQuat(
        [],
        [_verts[i], _verts[i + 1], _verts[i + 2]],
        rotQuat,
      );
      _verts[i] = rotated[0] + x;
      _verts[i + 1] = rotated[1] + y;
      _verts[i + 2] = rotated[2] + z;

      const rotatedN = vec3.transformQuat(
        [],
        [_verts[i + 6], _verts[i + 7], _verts[i + 8]],
        rotQuat,
      );
      _verts[i + 6] = rotatedN[0];
      _verts[i + 7] = rotatedN[1];
      _verts[i + 8] = rotatedN[2];
    } else {
      _verts[i] += x;
      _verts[i + 1] += y;
      _verts[i + 2] += z;
    }
  }

  verts.push(..._verts);
}

/**
 * Static-pipeline icosphere. Uniform flat color (no per-vertex shading, which
 * matches old static addSphere, which never varied color across the sphere).
 */
export function addSphereStatic(
  verts,
  index,
  x,
  y,
  z,
  rad,
  detail,
  r,
  g,
  b,
  a,
  ys = 1,
) {
  const m = MATH.icosphere(detail);
  const vl0 = verts.length / 10;

  for (let i = 0, l = m.verts.length; i < l; i += 3) {
    verts.push(
      m.verts[i] * rad + x,
      m.verts[i + 1] * rad * ys + y,
      m.verts[i + 2] * rad + z,
      r,
      g,
      b,
      a,
      0,
      0,
      0,
    );
  }
  for (let i = 0; i < m.index.length; i++) index.push(m.index[i] + vl0);
}

/**
 * Dynamic-pipeline icosphere. Pushes the unit-sphere direction as the
 * per-vertex normal (radially outward), matching old dynamic addSphere.
 */
export function addSphereDynamic(verts, index, x, y, z, rad, detail, r, g, b) {
  const m = MATH.icosphere(detail);
  const vl0 = verts.length / 9;

  for (let i = 0, l = m.verts.length; i < l; i += 3) {
    verts.push(
      m.verts[i] * rad + x,
      m.verts[i + 1] * rad + y,
      m.verts[i + 2] * rad + z,
      r,
      g,
      b,
      m.verts[i],
      m.verts[i + 1],
      m.verts[i + 2],
    );
  }
  for (let i = 0; i < m.index.length; i++) index.push(m.index[i] + vl0);
}
