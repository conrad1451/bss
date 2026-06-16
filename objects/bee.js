const CELL = 128 / 2048; // 0.0625

function buildCube(center, size, uvRowOffset) {
  const [cx, cy, cz] = center;
  const [sx, sy, sz] = size;
  const hx = sx / 2,
    hy = sy / 2,
    hz = sz / 2;

  const faces = [
    [
      [-hx, -hy, hz],
      [hx, -hy, hz],
      [hx, hy, hz],
      [-hx, hy, hz],
    ], // Front
    [
      [hx, -hy, -hz],
      [-hx, -hy, -hz],
      [-hx, hy, -hz],
      [hx, hy, -hz],
    ], // Back
    [
      [-hx, -hy, -hz],
      [-hx, -hy, hz],
      [-hx, hy, hz],
      [-hx, hy, -hz],
    ], // Left
    [
      [hx, -hy, hz],
      [hx, -hy, -hz],
      [hx, hy, -hz],
      [hx, hy, hz],
    ], // Right
    [
      [-hx, hy, hz],
      [hx, hy, hz],
      [hx, hy, -hz],
      [-hx, hy, -hz],
    ], // Top
    [
      [-hx, -hy, -hz],
      [hx, -hy, -hz],
      [hx, -hy, hz],
      [-hx, -hy, hz],
    ], // Bottom
  ];

  const uv = [
    [0, CELL],
    [CELL, CELL],
    [CELL, 0],
    [0, 0],
  ];
  const verts = [],
    index = [];

  faces.forEach((face) => {
    const base = verts.length / 7;
    face.forEach((pos, i) => {
      verts.push(
        pos[0] + cx,
        pos[1] + cy,
        pos[2] + cz,
        uv[i][0],
        uv[i][1] + uvRowOffset,
        1.0,
        0.0,
      );
    });
    index.push(base, base + 1, base + 2, base, base + 2, base + 3);
  });

  return { verts, index };
}

export function buildBeeMesh() {
  const body = buildCube([0, 0.4, 0], [0.9, 0.8, 0.9], CELL); // body cell (row below)
  const head = buildCube([0, 1.0, 0.3], [0.6, 0.6, 0.6], 0); // head cell

  const offset = body.verts.length / 7;
  return {
    verts: [...body.verts, ...head.verts],
    index: [...body.index, ...head.index.map((i) => i + offset)],
  };
}
