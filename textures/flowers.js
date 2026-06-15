import {
  drawFlowerTextureV1,
  drawFlowerTextureV2,
  drawFlowerTextureV2_5,
} from "./flowerTextureHelpers";

window.textures_flowers = function (tex_ctx) {
  // window.textures_flowers = function (tex_ctx) {
  let _COLORS = {
    blue: "rgb(20,84,196)",
    red: "rgb(255, 35, 0)",
    white: "rgb(255, 255, 255)",
    blueArr: [20, 84, 186],
    redArr: [255, 0, 0],
    whiteArr: [255, 255, 255],
  };

  // CHQ: Claude (Haiku): separate flower configuration from
  //      rendering logic (flowersV1, flowersV2, flowersV3)
  const flowersV1 = [
    // Row 1 - large flowers
    { x: 128, y: 128, scale: 0.7, rotation: 0, color: _COLORS.red },
    { x: 128 * 3, y: 128, scale: 0.7, rotation: 0, color: _COLORS.blue },
    { x: 128 * 5, y: 128, scale: 0.7, rotation: 0, color: _COLORS.white },

    // Row 2 - scattered medium flowers
    { x: 128 * 7 - 51, y: 108, scale: 0.6, rotation: 1, color: _COLORS.red },
    { x: 128 * 7 + 40, y: 147, scale: 0.6, rotation: -0.6, color: _COLORS.red },
    { x: 128 - 51, y: 87 + 256, scale: 0.6, rotation: 1, color: _COLORS.blue },
    {
      x: 40 + 128,
      y: 128 * 2 + 129,
      scale: 0.6,
      rotation: -0.6,
      color: _COLORS.blue,
    },
    {
      x: 128 * 3 - 51,
      y: 87 + 256,
      scale: 0.6,
      rotation: 1,
      color: _COLORS.white,
    },
    {
      x: 40 + 128 * 3,
      y: 128 * 2 + 129,
      scale: 0.6,
      rotation: -0.6,
      color: _COLORS.white,
    },

    // Row 3 - larger scattered flowers
    {
      x: 128 * 5 - 55,
      y: 87 + 263,
      scale: 0.65,
      rotation: 0,
      color: _COLORS.red,
    },
    {
      x: 58 + 128 * 5,
      y: 128 * 2 + 101,
      scale: 0.65,
      rotation: -1.5,
      color: _COLORS.red,
    },
    {
      x: 12 + 128 * 7,
      y: 128 * 2 + 177,
      scale: 0.65,
      rotation: -1.5,
      color: _COLORS.blue,
    },
    {
      x: 66 + 128 * 7,
      y: 128 * 2 + 91,
      scale: 0.65,
      rotation: 0.1,
      color: _COLORS.blue,
    },
    {
      x: 128 - 63,
      y: 128 * 3 + 235,
      scale: 0.65,
      rotation: 0,
      color: _COLORS.white,
    },
    {
      x: 2 + 121,
      y: 128 * 4 + 189,
      scale: 0.65,
      rotation: -1.6,
      color: _COLORS.white,
    },
    {
      x: 17 + 166,
      y: 128 * 4 + 111,
      scale: 0.65,
      rotation: -1.5,
      color: _COLORS.white,
    },
  ];

  const flowersV2 = [
    {
      x: 128 + 256,
      y: 128 + 256 * 2,
      scale: 0.92,
      rotation: 0,
      color: _COLORS.red,
    },
    {
      x: 128 + 256 * 2,
      y: 128 + 256 * 2,
      scale: 0.92,
      rotation: 0,
      color: _COLORS.blue,
    },
    {
      x: 128 + 256 * 3,
      y: 128 + 256 * 2,
      scale: 0.92,
      rotation: 0,
      color: _COLORS.white,
    },
  ];

  const flowersV3 = [
    {
      x: 128,
      y: 128 + 256 * 3,
      scale: 0.92,
      rotation: 0,
      color: _COLORS.red,
      color2: "rgb(157, 242, 100)",
      color3: "rgb(255, 255,58)",
    },
    {
      x: 128 + 256 * 1,
      y: 128 + 256 * 3,
      scale: 0.92,
      rotation: 0,
      color: _COLORS.blue,
      color2: "rgb(157, 242, 100)",
      color3: "rgb(255, 255,58)",
    },
    {
      x: 128 + 256 * 2,
      y: 128 + 256 * 3,
      scale: 0.92,
      rotation: 0,
      color: _COLORS.white,
      color2: "rgb(157, 242, 100)",
      color3: "rgb(255, 255,58)",
    },
  ];

  tex_ctx.fillStyle = "rgb(0,153,0)";
  tex_ctx.fillRect(0, 0, 1024, 1024);

  flowersV1.forEach((flower) => drawFlowerTextureV1(tex_ctx, flower));
  flowersV2.forEach((flower) => drawFlowerTextureV2(tex_ctx, flower));
  flowersV3.forEach((flower) => drawFlowerTextureV2_5(tex_ctx, flower));
};
