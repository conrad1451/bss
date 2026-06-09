// CHQ: ChatGPT: pulled out both versions of drawPetals into single function
function drawPetalTexture(ctx, { petals, width, height, yOffset = -20 }) {
  ctx.beginPath();

  const rotation = (Math.PI * 2) / petals;

  for (let i = 0; i < petals; i++) {
    ctx.moveTo(-20, yOffset);
    ctx.bezierCurveTo(-width, -height, width, -height, 20, yOffset);
    ctx.rotate(rotation);
  }

  ctx.closePath();
}

function drawCenter(ctx) {
  ctx.beginPath();
  // ctx.arc(0, 0, 25, 0, 6);
  ctx.arc(0, 0, 25, 0, Math.PI * 2);

  ctx.strokeStyle = "rgb(157, 242, 100)";
  ctx.lineWidth = 5;
  ctx.fillStyle = "rgb(226, 255, 138)";

  ctx.fill();
  ctx.stroke();
}

function drawFlowerTextureV1(
  ctx,
  { x, y, scale = 0.7, rotation = 0, color = "red", petals = 4 },
) {
  //  ctx.translate(128, 128);
  ctx.translate(x, y);
  // ctx.scale(0.7, 0.7);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);
  drawPetalTexture(ctx, {
    petals: 4,
    width: 80,
    height: 100,
    yOffset: -20,
  });

  ctx.strokeStyle = "rgb(0,0,0,0.3)";
  ctx.lineWidth = 5;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.stroke();

  drawCenter(ctx);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawFlowerTextureV2(
  ctx,
  { x, y, scale = 0.7, rotation = 0, color = "red", petals = 4 },
) {
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);

  drawPetalTexture(ctx, {
    petals: 5,
    width: 95,
    height: 110,
    yOffset: -10,
  });

  ctx.strokeStyle = "rgb(0,0,0,0.3)";
  ctx.lineWidth = 5;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.stroke();
  ctx.scale(scale - 0.02, scale - 0.02);

  drawCenter(ctx);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawFlowerTextureV2_5(
  ctx,
  {
    x,
    y,
    scale = 0.7,
    rotation = 0,
    color = "red",
    color2 = "red",
    color3 = "red",
    petals = 4,
  },
) {
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);

  drawPetalTexture(ctx, {
    petals: 5,
    width: 95,
    height: 110,
    yOffset: -10,
  });

  ctx.strokeStyle = "rgb(0,0,0,0.3)";
  ctx.lineWidth = 5;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();

  for (let i = 0, j = 0; i < Math.PI * 2; i += (Math.PI * 2) / 10, j++) {
    let r = j % 2 === 0 ? 20 : 50;

    if (j === 0) {
      ctx.moveTo(Math.sin(i) * r, Math.cos(i) * r);
    } else {
      ctx.lineTo(Math.sin(i) * r, Math.cos(i) * r);
    }
  }

  ctx.closePath();
  ctx.strokeStyle = color2;
  ctx.lineWidth = 5;
  ctx.fillStyle = color3;
  ctx.fill();
  ctx.stroke();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

window.textures_flowers = function (tex_ctx) {
  // window.textures_flowers = function (tex_ctx) {
  let _COLORS = {
    blue: "rgb(20,84,196)",
    red: "rgb(255, 35, 0)",
    white: "rgb(255,255,255)",
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
