// CHQ: ChatGPT: pulled out both versions of drawPetals into single export function
export function drawPetalTexture(
  ctx,
  { petals, width, height, yOffset = -20 },
) {
  ctx.beginPath();

  const rotation = (Math.PI * 2) / petals;

  for (let i = 0; i < petals; i++) {
    ctx.moveTo(-20, yOffset);
    ctx.bezierCurveTo(-width, -height, width, -height, 20, yOffset);
    ctx.rotate(rotation);
  }

  ctx.closePath();
}

export function drawCenter(ctx) {
  ctx.beginPath();
  // ctx.arc(0, 0, 25, 0, 6);
  ctx.arc(0, 0, 25, 0, Math.PI * 2);

  ctx.strokeStyle = "rgb(157, 242, 100)";
  ctx.lineWidth = 5;
  ctx.fillStyle = "rgb(226, 255, 138)";

  ctx.fill();
  ctx.stroke();
}

export function drawFlowerTextureV1(
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

export function drawFlowerTextureV2(
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

export function drawFlowerTextureV2_5(
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
