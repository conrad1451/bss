import { Canvg } from "canvg";
import withCtx from "./withCtx";

// const SPRITES = createSpriteAtlas();

const SVG_COIN = `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- outer rim -->
  <circle cx="32" cy="32" r="30" fill="#f2c14e" stroke="#b8860b" stroke-width="3"/>

  <!-- inner shading -->
  <circle cx="32" cy="32" r="24" fill="#ffd86b"/>

  <!-- highlight -->
  <circle cx="24" cy="24" r="6" fill="rgba(255,255,255,0.5)"/>

  <!-- optional symbol -->
  <text x="32" y="40" text-anchor="middle" font-size="24" font-family="Arial" fill="#8b5a00">
    $
  </text>
</svg>
`;

const SVG_POTION = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-32 -32 64 64">
  <!-- bottle body -->
  <path d="
    M -10 -18
    L 10 -18
    L 8 -4
    L 14 20
    L -14 20
    L -8 -4
    Z
  " fill="currentColor" stroke="black" stroke-width="2"/>

  <!-- highlight -->
  <path d="
    M -6 -16
    L -2 -16
    L -4 18
    L -8 18
    Z
  " fill="rgba(255,255,255,0.25)" />

  <!-- cork -->
  <rect x="-6" y="-26" width="12" height="6" fill="rgb(120,80,40)" stroke="black" stroke-width="2"/>
</svg>
`;

const SVG_GEM = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-32 -32 64 64">
  <!-- main crystal -->
  <path d="
    M -20 0
    L 0 -15
    L 20 0
    L 0 15
    Z
  "
  fill="rgb(100,100,100)"
  stroke="black"
  stroke-width="2"/>

  <!-- left face -->
  <path d="
    M -20 0
    L -20 10
    L 0 25
    L 0 15
    Z
  "
  fill="rgb(85,85,85)"
  stroke="black"
  stroke-width="2"/>

  <!-- right face -->
  <path d="
    M 20 0
    L 20 10
    L 0 25
    L 0 15
    Z
  "
  fill="rgb(70,70,70)"
  stroke="black"
  stroke-width="2"/>

  <!-- highlight streaks -->
  <rect x="-18" y="8" width="4" height="8" fill="rgba(255,220,50,0.9)"/>
  <rect x="-12" y="11" width="4" height="8" fill="rgba(255,220,50,0.7)"/>
  <rect x="-6" y="14" width="4" height="8" fill="rgba(255,220,50,0.5)"/>

  <!-- rim glow (tintable) -->
  <ellipse cx="0" cy="-2" rx="8" ry="6"
    fill="none"
    stroke="currentColor"
    stroke-width="4"/>
</svg>
`;

const COLORS = {
  red: {
    rimDark: "rgb(155,0,0)",
    rimLight: "rgb(255,0,0)",
  },

  blue: {
    rimDark: "rgb(0,0,155)",
    rimLight: "rgb(0,0,255)",
  },

  silver: {
    rimDark: "rgb(175,175,175)",
    rimLight: "rgb(255,255,255)",
  },
};

const decals = [
  {
    col: 4,
    row: 1,
    type: "gem",
    params: COLORS.red,
  },

  {
    col: 5,
    row: 1,
    type: "gem",
    params: COLORS.blue,
  },
  {
    col: 6,
    row: 1,
    type: "gem",
    params: COLORS.silver,
  },
];

const SPRITE_DEFS = {
  coin: {
    svg: SVG_COIN,
    frames: 1,
    color: "gold",
  },

  potion: {
    svg: SVG_POTION,
    frames: 3, // animated
    colors: ["#69c", "#f66", "#b6f"],
  },

  gem: {
    svg: SVG_GEM,
    frames: 1,
    colors: {
      red: COLORS.red,
      blue: COLORS.blue,
      silver: COLORS.silver,
    },
  },
};

// const RENDERERS = {
//   gem: drawGem,
//   potion: drawPotion,
//   coin: drawCoin,
// };

const TILE = 128;

// ----------------------------------------------------------------------------------------------------//

function canvg(canvas, svgString) {
  const ctx = canvas.getContext("2d");
  Canvg.fromString(ctx, svgString).render();
}

// ─── mCanvg ───────────────────────────────────────────────────────────────────
// Replaces canvg entirely. Parses a subset of SVG sufficient for the sprite
// definitions in this file (SVG_COIN, SVG_POTION, SVG_GEM) and renders into
// an existing 2D context.
//
// Supported attributes: fill, stroke, stroke-width, currentColor injection.
// Supported elements:   rect, circle, ellipse, path, text.
// Supported path commands: M/m  L/l  H/h  V/v  C/c  Z/z
//
// ViewBox handling: if the root <svg> carries a viewBox attribute the function
// applies a translate+scale so that SVG-space coordinates map correctly onto
// the canvas.  The coin uses viewBox="0 0 64 64" (no transform needed).
// The potion and gem use viewBox="-32 -32 64 64" (centered origin — without
// this correction every shape lands in the wrong quadrant).

function mCanvg(ctx, svgText, color = null) {
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const root = doc.documentElement;

  // ── Resolve the viewBox → canvas transform ──────────────────────────────
  // Canvas size is always the physical pixel size of the scratch canvas, which
  // equals frameSize (64 by default). Read it from the canvas itself so this
  // works regardless of frameSize.
  const canvasW = ctx.canvas.width;
  const canvasH = ctx.canvas.height;

  let vbX = 0,
    vbY = 0,
    vbW = canvasW,
    vbH = canvasH;
  const vbAttr = root.getAttribute("viewBox");
  if (vbAttr) {
    const parts = vbAttr
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if (parts.length === 4) [vbX, vbY, vbW, vbH] = parts;
  }

  const scaleX = canvasW / vbW;
  const scaleY = canvasH / vbH;

  ctx.save();
  ctx.scale(scaleX, scaleY);
  ctx.translate(-vbX, -vbY);

  // ── Walk direct children ─────────────────────────────────────────────────
  for (const node of root.children) {
    renderNode(ctx, node, color);
  }

  ctx.restore();
}

// Render a single SVG element. Recurse into <g>.
function renderNode(ctx, node, inheritedColor) {
  const tag = node.tagName.toLowerCase();
  if (tag === "g") {
    ctx.save();
    applyTransform(ctx, node.getAttribute("transform"));
    const c = node.getAttribute("color") || inheritedColor;
    for (const child of node.children) renderNode(ctx, child, c);
    ctx.restore();
    return;
  }

  ctx.save();
  applyTransform(ctx, node.getAttribute("transform"));
  applyStyle(ctx, node, inheritedColor);

  switch (tag) {
    case "rect": {
      const x = +node.getAttribute("x") || 0;
      const y = +node.getAttribute("y") || 0;
      const w = +node.getAttribute("width") || 0;
      const h = +node.getAttribute("height") || 0;
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      fillAndStroke(ctx, node);
      break;
    }
    case "circle": {
      ctx.beginPath();
      ctx.arc(
        +node.getAttribute("cx") || 0,
        +node.getAttribute("cy") || 0,
        +node.getAttribute("r") || 0,
        0,
        Math.PI * 2,
      );
      fillAndStroke(ctx, node);
      break;
    }
    case "ellipse": {
      ctx.beginPath();
      ctx.ellipse(
        +node.getAttribute("cx") || 0,
        +node.getAttribute("cy") || 0,
        +node.getAttribute("rx") || 0,
        +node.getAttribute("ry") || 0,
        0,
        0,
        Math.PI * 2,
      );
      fillAndStroke(ctx, node);
      break;
    }
    case "path": {
      const d = node.getAttribute("d") || "";
      drawPath(ctx, d);
      fillAndStroke(ctx, node);
      break;
    }
    case "text": {
      const x = +node.getAttribute("x") || 0;
      const y = +node.getAttribute("y") || 0;
      const anchor = node.getAttribute("text-anchor") || "start";
      const fontSize = node.getAttribute("font-size") || "16";
      const fontFamily = node.getAttribute("font-family") || "Arial";
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.textAlign =
        anchor === "middle" ? "center" : anchor === "end" ? "right" : "left";
      ctx.textBaseline = "alphabetic";
      if (ctx.fillStyle) ctx.fillText(node.textContent, x, y);
      break;
    }
  }

  ctx.restore();
}

// Apply fill / stroke styles from element attributes.
function applyStyle(ctx, node, inheritedColor) {
  const fill = node.getAttribute("fill");
  const stroke = node.getAttribute("stroke");
  const sw = node.getAttribute("stroke-width");

  if (fill) {
    ctx.fillStyle = fill === "currentColor" ? inheritedColor || "black" : fill;
  }
  if (stroke) {
    ctx.strokeStyle =
      stroke === "currentColor" ? inheritedColor || "black" : stroke;
  }
  if (sw) ctx.lineWidth = +sw;
}

// Fill and/or stroke based on which attributes are present.
function fillAndStroke(ctx, node) {
  const hasFill =
    node.hasAttribute("fill") && node.getAttribute("fill") !== "none";
  const hasStroke =
    node.hasAttribute("stroke") && node.getAttribute("stroke") !== "none";
  if (hasFill) ctx.fill();
  if (hasStroke) ctx.stroke();
}

// Parse and apply a transform="translate(...) scale(...)" attribute.
function applyTransform(ctx, transform) {
  if (!transform) return;
  const t = transform.replace(/,/g, " ");
  const translate = t.match(/translate\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/);
  const scale = t.match(/scale\(\s*([-\d.]+)(?:\s+([-\d.]+))?\s*\)/);
  if (translate) ctx.translate(+translate[1], +translate[2]);
  if (scale)
    ctx.scale(+scale[1], scale[2] !== undefined ? +scale[2] : +scale[1]);
}

// ─── Path parser (M L H V C Z — absolute and relative) ───────────────────────
function drawPath(ctx, d) {
  // Tokenise: command letters and numbers (including negatives, decimals,
  // scientific notation).
  const tokens =
    d.match(/[MmLlHhVvCcZz]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) || [];

  let cx = 0,
    cy = 0; // current point
  let cmd = null;
  let i = 0;

  const num = () => +tokens[i++];

  ctx.beginPath();

  while (i < tokens.length) {
    const tok = tokens[i];
    if (/[MmLlHhVvCcZz]/.test(tok)) {
      cmd = tokens[i++];
    }

    switch (cmd) {
      case "M":
        cx = num();
        cy = num();
        ctx.moveTo(cx, cy);
        cmd = "L";
        break;
      case "m":
        cx += num();
        cy += num();
        ctx.moveTo(cx, cy);
        cmd = "l";
        break;
      case "L":
        cx = num();
        cy = num();
        ctx.lineTo(cx, cy);
        break;
      case "l":
        cx += num();
        cy += num();
        ctx.lineTo(cx, cy);
        break;
      case "H":
        cx = num();
        ctx.lineTo(cx, cy);
        break;
      case "h":
        cx += num();
        ctx.lineTo(cx, cy);
        break;
      case "V":
        cy = num();
        ctx.lineTo(cx, cy);
        break;
      case "v":
        cy += num();
        ctx.lineTo(cx, cy);
        break;
      case "C": {
        const x1 = num(),
          y1 = num(),
          x2 = num(),
          y2 = num();
        cx = num();
        cy = num();
        ctx.bezierCurveTo(x1, y1, x2, y2, cx, cy);
        break;
      }
      case "c": {
        const x1 = cx + num(),
          y1 = cy + num();
        const x2 = cx + num(),
          y2 = cy + num();
        cx += num();
        cy += num();
        ctx.bezierCurveTo(x1, y1, x2, y2, cx, cy);
        break;
      }
      case "Z":
      case "z":
        ctx.closePath();
        i++;
        break;
      default:
        // Unknown token — skip to avoid infinite loop.
        i++;
    }
  }
}

// // CHQ: Claude AI refactored and fixed
// // ─── withCtx ─────────────────────────────────────────────────────────────────
// // Saves the full transform, runs fn, then restores to identity.
// // Previously referenced throughout but never defined.
// function withCtx(ctx, fn) {
//   const m = ctx.getTransform();
//   fn(ctx);
//   ctx.setTransform(m);
// }

// CHQ: Claude AI refactored and fixed
// ─── buildAtlas ───────────────────────────────────────────────────────────────
// Renders every sprite definition into a single atlas canvas and builds a
// lookup map (UV) from sprite key → array of frame entries.
// Previously buildAtlas returned { canvas, entries } but entries was a flat
// array with no key index, so drawFrame's UV.get(key) call always failed.
function buildAtlas(defs, frameSize = 64) {
  const keys = Object.keys(defs);
  const cols = 8;
  const rows = Math.ceil(
    keys.reduce((sum, k) => sum + (defs[k].frames || 1), 0) / cols,
  );

  const canvas = document.createElement("canvas");
  canvas.width = cols * frameSize;
  canvas.height = Math.max(rows, 1) * frameSize;
  const ctx = canvas.getContext("2d");

  // UV maps sprite key → [{ x, y, w, h }, ...]  (one entry per frame)
  const UV = new Map();

  let col = 0;
  let row = 0;

  for (const key of keys) {
    const def = defs[key];
    const frameCount = def.frames || 1;
    const frames = [];

    for (let f = 0; f < frameCount; f++) {
      // Resolve the per-frame color
      let color = null;
      if (Array.isArray(def.colors)) {
        color = def.colors[f] ?? null;
      } else if (def.color) {
        color = def.color;
      } else if (def.colors && typeof def.colors === "object") {
        color = Object.values(def.colors)[f] ?? null;
      }

      // Render this frame into a scratch canvas
      const scratch = document.createElement("canvas");
      scratch.width = frameSize;
      scratch.height = frameSize;

      let svg = def.svg;
      if (color) svg = svg.replaceAll("currentColor", color);
      // canvg(scratch, svg);
      // mCanvg(ctx, svg, color);

      const scratchCtx = scratch.getContext("2d");
      mCanvg(scratchCtx, svg, color);

      // Blit into atlas
      const ax = col * frameSize;
      const ay = row * frameSize;
      // ctx.drawImage(scratch, ax, ay);
      ctx.drawImage(scratch, ax, ay);

      frames.push({ x: ax, y: ay, w: frameSize, h: frameSize });

      col++;
      if (col >= cols) {
        col = 0;
        row++;
      }
    }

    UV.set(key, frames);
  }

  return { canvas, UV };
}

// CHQ: Claude AI refactored and fixed
// ─── Rebuild atlas and expose UV ──────────────────────────────────────────────
// Previously ATLAS was built at module level but UV was never constructed.
const { canvas: ATLAS_CANVAS, UV } = buildAtlas(SPRITE_DEFS);

// CHQ: Claude AI refactored and fixed
// ─── drawFrame ────────────────────────────────────────────────────────────────
// Draws one frame from the atlas at (x, y), centred, scaled by `scale`.
// Previously called UV.get(key) which always returned undefined because UV
// didn't exist.
function drawFrame(ctx, key, frame = 0, x = 0, y = 0, scale = 1) {
  const frames = UV.get(key);
  if (!frames) {
    console.warn(`drawFrame: unknown key "${key}"`);
    return;
  }
  const entry = frames[frame] ?? frames[0];
  ctx.drawImage(
    ATLAS_CANVAS,
    entry.x,
    entry.y,
    entry.w,
    entry.h,
    x - (entry.w * scale) / 2,
    y - (entry.h * scale) / 2,
    entry.w * scale,
    entry.h * scale,
  );
}

// CHQ: Claude AI refactored and fixed
// ─── drawTile ─────────────────────────────────────────────────────────────────
// Centers the canvas on the middle of tile (col, row) then calls draw(ctx).
// Previously used withCtx which was never defined.
function drawTile(ctx, col, row, draw) {
  withCtx(ctx, () => {
    ctx.translate(col * TILE + TILE * 0.5, row * TILE + TILE * 0.5 - 10);
    draw(ctx);
  });
}

// ─── textures_decals ──────────────────────────────────────────────────────────
// The RENDERERS map is now actually used instead of the old if/else chain.
// Each renderer receives (ctx, params) where params is the decal's params field.
//
// For gems the params object carries color stops (rimDark, rimLight) rather than
// a frame index, so we resolve the frame by matching against COLORS.
const COLOR_KEYS = Object.keys(COLORS); // ["red", "blue", "silver"]

// CHQ: Claude AI refactored and fixed
function gemFrameFromParams(params) {
  return COLOR_KEYS.findIndex(
    (k) =>
      COLORS[k].rimDark === params.rimDark &&
      COLORS[k].rimLight === params.rimLight,
  );
}

const RENDERERSOLD = {
  coin: (ctx /*, params */) => drawFrame(ctx, "coin", 0),
  potion: (ctx, params) => {
    // params is a color string for potions
    const color =
      typeof params === "string" ? params : (params?.color ?? "#69c");
    const sprite = SPRITES.get("potion", SVG_POTION, color, 64);
    drawSprite(ctx, sprite, 0, 0, 1);
  },
  gem: (ctx, params) => {
    const frame = Math.max(0, gemFrameFromParams(params));
    drawFrame(ctx, "gem", frame);
  },
};

const RENDERERS = {
  coin: (ctx) => drawFrame(ctx, "coin", 0),
  potion: (ctx, params) => {
    const colorKeys = ["#69c", "#f66", "#b6f"];
    const frame = typeof params === "string" ? colorKeys.indexOf(params) : 0;
    drawFrame(ctx, "potion", Math.max(0, frame));
  },
  gem: (ctx, params) => {
    const frame = Math.max(0, gemFrameFromParams(params));
    drawFrame(ctx, "gem", frame);
  },
};

// function createSpriteAtlas() {
//   const cache = new Map();

//   function renderSVGToCanvas(svg, color = null, size = 64) {
//     const canvas = document.createElement("canvas");
//     canvas.width = size;
//     canvas.height = size;

//     const ctx = canvas.getContext("2d");

//     let finalSVG = svg;
//     if (color) {
//       finalSVG = svg.replaceAll("currentColor", color);
//     }

//     // IMPORTANT: render into its own canvas
//     canvg(canvas, finalSVG);

//     return canvas;
//   }

//   function get(key, svg, color = null, size = 64) {
//     const cacheKey = `${key}_${color || "none"}_${size}`;

//     if (cache.has(cacheKey)) {
//       return cache.get(cacheKey);
//     }

//     const sprite = renderSVGToCanvas(svg, color, size);
//     cache.set(cacheKey, sprite);
//     return sprite;
//   }

//   return { get };
// }

// function buildAtlas(defs, frameSize = 64) {
//   const entries = [];
//   const canvas = document.createElement("canvas");
//   const ctx = canvas.getContext("2d");

//   const keys = Object.keys(defs);

//   const cols = 8;
//   const rows = Math.ceil(keys.length / cols);

//   canvas.width = cols * frameSize;
//   canvas.height = rows * frameSize;

//   let x = 0;
//   let y = 0;

//   for (const key of keys) {
//     const def = defs[key];

//     const frames = def.frames || 1;

//     for (let f = 0; f < frames; f++) {
//       const color = Array.isArray(def.colors)
//         ? def.colors[f]
//         : def.color || def.colors?.[Object.keys(def.colors)[f]];

//       const spriteCanvas = document.createElement("canvas");
//       spriteCanvas.width = frameSize;
//       spriteCanvas.height = frameSize;

//       const sctx = spriteCanvas.getContext("2d");

//       let svg = def.svg;
//       if (color) svg = svg.replaceAll("currentColor", color);

//       canvg(spriteCanvas, svg);

//       // draw into atlas
//       ctx.drawImage(spriteCanvas, x * frameSize, y * frameSize);

//       entries.push({
//         key,
//         frame: f,
//         x: x * frameSize,
//         y: y * frameSize,
//         w: frameSize,
//         h: frameSize,
//       });

//       x++;
//       if (x >= cols) {
//         x = 0;
//         y++;
//       }
//     }
//   }

//   return {
//     canvas,
//     entries,
//     frameSize,
//   };
// }

function drawSprite(ctx, spriteCanvas, x, y, scale = 1) {
  const size = spriteCanvas.width;

  ctx.drawImage(
    spriteCanvas,
    x - (size * scale) / 2,
    y - (size * scale) / 2,
    size * scale,
    size * scale,
  );
}

function drawSVG(ctx, svg, x, y, scale = 1, color = null) {
  withCtx(ctx, () => {
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // optional color injection
    let finalSVG = svg;
    if (color) {
      finalSVG = svg.replaceAll("currentColor", color);
    }
    mCanvg(ctx, svg, color);
    // canvg(ctx.canvas, finalSVG);
  });
}

// // CHQ: ChatGPT refactored by pulling out this function
// function drawTile(ctx, col, row, draw) {
//   withCtx(ctx, () => {
//     ctx.translate(col * TILE + TILE * 0.5, row * TILE + TILE * 0.5 - 10);

//     draw(ctx);
//   });
// }

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

const ATLAS = buildAtlas(SPRITE_DEFS);

// function drawFrame(ctx, key, frame = 0, x = 0, y = 0, scale = 1) {
//   const entry = UV.get(key)[frame];

//   ctx.drawImage(
//     ATLAS.canvas,
//     entry.x,
//     entry.y,
//     entry.w,
//     entry.h,
//     x - (entry.w * scale) / 2,
//     y - (entry.h * scale) / 2,
//     entry.w * scale,
//     entry.h * scale,
//   );
// }

// CHQ: ChatGPT refactored by pulling out this function
function drawGem(ctx, colors) {
  ctx.scale(1.6, 1.6);

  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;

  // main crystal
  ctx.fillStyle = "rgb(100,100,100)";

  ctx.beginPath();
  ctx.moveTo(-20, 0);
  ctx.lineTo(0, -15);
  ctx.lineTo(20, 0);
  ctx.lineTo(0, 15);
  ctx.closePath();

  ctx.stroke();
  ctx.fill();

  // side faces
  ctx.fillStyle = "rgb(85,85,85)";

  ctx.beginPath();
  ctx.moveTo(-20, 0);
  ctx.lineTo(-20, 10);
  ctx.lineTo(0, 25);
  ctx.lineTo(0, 15);
  ctx.closePath();

  ctx.stroke();
  ctx.fill();

  ctx.fillStyle = "rgb(70,70,70)";

  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(20, 10);
  ctx.lineTo(0, 25);
  ctx.lineTo(0, 15);
  ctx.closePath();

  ctx.stroke();
  ctx.fill();

  // highlights
  ctx.fillStyle = "rgb(255,220,50,0.9)";

  ctx.fillRect(-19, 8, 4, 8);
  ctx.fillRect(-13, 11, 4, 8);
  ctx.fillRect(-7, 14, 4, 8);

  // glow ring
  ctx.lineWidth = 7;

  ctx.strokeStyle = colors.rimDark;

  ellipse(ctx, 0, -1, 8, 6);
  ctx.stroke();

  ctx.strokeStyle = colors.rimLight;

  ellipse(ctx, 0, -4, 8, 6);
  ctx.stroke();
}

const potions = [
  { col: 1, color: "#69c" },
  { col: 2, color: "#f66" },
  { col: 3, color: "#b6f" },
];

function drawPotion(ctx, color = "#69c") {
  const sprite = SPRITES.get("potion", SVG_POTION, color, 64);
  drawSprite(ctx, sprite, 0, 0, 1);
}

function drawCoin(ctx) {
  const sprite = SPRITES.get("coin", SVG_COIN, "gold", 64);
  drawSprite(ctx, sprite, 0, 0, 1);
}

window.textures_decals = function (ctx) {
  ctx.clearRect(0, 0, 1024, 1024);

  decals.forEach((d) => {
    drawTile(ctx, d.col, d.row, (ctx) => {
      const renderer = RENDERERS[d.type];
      if (renderer) {
        renderer(ctx, d.params);
      } else {
        console.warn(`textures_decals: no renderer for type "${d.type}"`);
      }
    });
  });
};
