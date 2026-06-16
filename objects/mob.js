// Build a simple box and upload it as the mob/player mesh
export function buildBoxMesh() {
  const verts = [
    // x,    y,    z,    r,   g,   b,   u,   v
    -0.5,
    0.0,
    0.5,
    1.0,
    1.0,
    1.0,
    0.0,
    1.0, // front BL
    0.5,
    0.0,
    0.5,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0, // front BR
    0.5,
    2.0,
    0.5,
    1.0,
    1.0,
    1.0,
    1.0,
    0.0, // front TR
    -0.5,
    2.0,
    0.5,
    1.0,
    1.0,
    1.0,
    0.0,
    0.0, // front TL
    -0.5,
    0.0,
    -0.5,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0, // back BL
    0.5,
    0.0,
    -0.5,
    1.0,
    1.0,
    1.0,
    0.0,
    1.0, // back BR
    0.5,
    2.0,
    -0.5,
    1.0,
    1.0,
    1.0,
    0.0,
    0.0, // back TR
    -0.5,
    2.0,
    -0.5,
    1.0,
    1.0,
    1.0,
    1.0,
    0.0, // back TL
  ];
  const index = [
    0,
    1,
    2,
    0,
    2,
    3, // front
    5,
    4,
    7,
    5,
    7,
    6, // back
    4,
    0,
    3,
    4,
    3,
    7, // left
    1,
    5,
    6,
    1,
    6,
    2, // right
    3,
    2,
    6,
    3,
    6,
    7, // top
    4,
    5,
    1,
    4,
    1,
    0, // bottom
  ];
  return { verts, index };
}
