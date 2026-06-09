import withCtx from "./withCtx";

// CHQ: Claude AI (Sonnet) generated

// ─── Bear tile renderer ───────────────────────────────────────────────────────
//
// Each bear variant is described by a plain config object. drawBear() handles
// all the shared canvas work; the config supplies only what differs between
// variants.
//
// Config shape:
//   bg          string          background fill color
//   ears        null | { fill, eyeFill, pupilFill }
//                               if null, no ear protrusions are drawn
//   legs        { fill }        outer leg color (inner shadow derived from bg)
//   body        { top, bottom } gradient stops for the torso strip
//   belly       null | string   if set, draws a rounded belly-plate in this color
//   eyes        { outer, inner, pupil }
//   nose        { outer, inner }
//   cheeks      null | string   optional blush ellipses
//   extras      null | fn(ctx)  escape hatch for one-off details (border, hat…)

// ─── shared geometry constants ────────────────────────────────────────────────
const BEAR = {
  // tile is 128×128, origin shifted to centre
  half: 64,

  // ear positions (mirrored)
  earX: 13,
  earY: -23,
  earR: 6,

  // leg bezier control points (mirrored horizontally)
  leg: {
    x0: -64,
    y0: 64,
    cx1: -66,
    cy1: -49,
    cx2: -18,
    cy2: -56,
    x1: -10,
    y1: -1,
    bottom: 64,
  },

  // body centre strip
  strip: { x: -12, w: 24, yTop: -11, yBottom: 64 },

  // belly plate
  belly: { rx: 50, ry: 20, yTop: -25, yBottom: -20 },

  // eye positions (mirrored)
  eyeX: 19,
  eyeY: -13,
  eyeRx: 5,
  eyeRy: 9,
  pupilX: 16,
  pupilY: -16,
  pupilRx: 2,
  pupilRy: 3,

  // nose
  noseOuter: { cx: 0, cy: 49, rx: 10, ry: 8 },
  noseInner: { cx: 0, cy: 52, rx: 5, ry: 3 },

  // cheek blush
  cheekX: 41,
  cheekY: 19,
  cheekRx: 10,
  cheekRy: 10,
};

function drawBear(ctx, cfg) {
  const { half } = BEAR;

  // ── background ──────────────────────────────────────────────────────────
  ctx.fillStyle = cfg.bg;
  ctx.fillRect(-half, -half, half * 2, half * 2);

  // ── ears ────────────────────────────────────────────────────────────────
  if (cfg.ears) {
    ctx.fillStyle = cfg.ears.fill;
    _e(ctx, BEAR.earX, BEAR.earY, BEAR.earR, BEAR.earR);
    _e(ctx, -BEAR.earX, BEAR.earY, BEAR.earR, BEAR.earR);
  }

  // ── legs (two mirrored bezier fills) ────────────────────────────────────
  if (cfg.legs) {
    ctx.fillStyle = cfg.legs.fill;
    ctx.beginPath();
    const L = BEAR.leg;
    // left leg
    ctx.moveTo(L.x0, L.y0);
    ctx.lineTo(L.x0, L.y0 - 44);
    ctx.bezierCurveTo(L.cx1, L.cy1, L.cx2, L.cy2, L.x1, L.y1);
    ctx.lineTo(L.x1, L.bottom);
    // right leg (mirror x)
    ctx.moveTo(-L.x0, L.y0);
    ctx.lineTo(-L.x0, L.y0 - 44);
    ctx.bezierCurveTo(-L.cx1, L.cy1, -L.cx2, L.cy2, -L.x1, L.y1);
    ctx.lineTo(-L.x1, L.bottom);
    ctx.fill();
  }

  // ── body gradient strip ──────────────────────────────────────────────────
  const g = ctx.createLinearGradient(0, 0, 0, half);
  g.addColorStop(0, cfg.body.top);
  g.addColorStop(0.6, cfg.body.bottom);
  ctx.fillStyle = g;
  ctx.beginPath();
  // left curve
  ctx.moveTo(BEAR.strip.x, -25);
  ctx.bezierCurveTo(
    BEAR.strip.x - 1,
    49,
    BEAR.strip.x - 18,
    40,
    BEAR.strip.x,
    half,
  );
  // right curve
  ctx.moveTo(-BEAR.strip.x, -25);
  ctx.bezierCurveTo(
    -BEAR.strip.x + 1,
    49,
    -BEAR.strip.x + 18,
    40,
    -BEAR.strip.x,
    half,
  );
  ctx.fill();
  ctx.fillRect(
    BEAR.strip.x,
    BEAR.strip.yTop,
    BEAR.strip.w,
    BEAR.strip.yBottom - BEAR.strip.yTop,
  );

  // ── belly plate ──────────────────────────────────────────────────────────
  if (cfg.belly) {
    ctx.fillStyle = cfg.belly;
    ctx.beginPath();
    ctx.moveTo(-BEAR.belly.rx, BEAR.belly.yTop);
    ctx.bezierCurveTo(
      -BEAR.belly.rx,
      BEAR.belly.yBottom,
      BEAR.belly.rx,
      BEAR.belly.yBottom,
      BEAR.belly.rx,
      BEAR.belly.yTop,
    );
    ctx.lineTo(BEAR.belly.rx, BEAR.belly.yBottom);
    ctx.bezierCurveTo(
      BEAR.belly.rx,
      10,
      -BEAR.belly.rx,
      10,
      -BEAR.belly.rx,
      BEAR.belly.yBottom,
    );
    ctx.fill();
  }

  // ── nose (outer + inner) ─────────────────────────────────────────────────
  ctx.fillStyle = cfg.nose.outer;
  _e(
    ctx,
    BEAR.noseOuter.cx,
    BEAR.noseOuter.cy,
    BEAR.noseOuter.rx,
    BEAR.noseOuter.ry,
  );
  ctx.fillStyle = cfg.nose.inner;
  _e(
    ctx,
    BEAR.noseInner.cx,
    BEAR.noseInner.cy,
    BEAR.noseInner.rx,
    BEAR.noseInner.ry,
  );

  // ── eyes ─────────────────────────────────────────────────────────────────
  ctx.fillStyle = cfg.eyes.outer;
  _e(ctx, BEAR.eyeX, BEAR.eyeY, BEAR.eyeRx, BEAR.eyeRy);
  _e(ctx, -BEAR.eyeX, BEAR.eyeY, BEAR.eyeRx, BEAR.eyeRy);

  ctx.fillStyle = cfg.eyes.pupil;
  _e(ctx, BEAR.pupilX, BEAR.pupilY, BEAR.pupilRx, BEAR.pupilRy);
  _e(ctx, -BEAR.pupilX, BEAR.pupilY, BEAR.pupilRx, BEAR.pupilRy);

  // ── cheeks ───────────────────────────────────────────────────────────────
  if (cfg.cheeks) {
    ctx.fillStyle = cfg.cheeks;
    _e(ctx, BEAR.cheekX, BEAR.cheekY, BEAR.cheekRx, BEAR.cheekRy);
    _e(ctx, -BEAR.cheekX, BEAR.cheekY, BEAR.cheekRx, BEAR.cheekRy);
  }

  // ── one-off extras ───────────────────────────────────────────────────────
  if (cfg.extras) cfg.extras(ctx);
}

// shorthand used only inside this module
function _e(ctx, cx, cy, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Bear variant configs ─────────────────────────────────────────────────────

const BEAR_VARIANTS = [
  // 0 — dark / shadow bear
  {
    bg: "rgb(33,35,37)",
    ears: { fill: "rgb(123,105,65)" },
    legs: { fill: "rgb(45,50,53)" },
    body: { top: "rgb(33,35,37)", bottom: "rgb(123,105,65)" },
    belly: null,
    eyes: { outer: "rgb(20,20,20)", pupil: "rgb(45,50,53)" },
    nose: { outer: "rgb(45,50,53)", inner: "rgb(33,35,37)" },
    cheeks: null,
  },
  // 1 — white / snow bear
  {
    bg: "rgb(240,240,240)",
    ears: null,
    legs: { fill: "rgb(200,200,200)" },
    body: { top: "rgb(240,240,240)", bottom: "rgb(170,170,170)" },
    belly: null,
    eyes: { outer: "rgb(20,20,20)", pupil: "rgb(200,200,200)" },
    nose: { outer: "rgb(45,50,53)", inner: "rgb(33,35,37)" },
    cheeks: null,
  },
  // 2 — brown bear
  {
    bg: "rgb(115,84,48)",
    ears: null,
    legs: { fill: "rgb(97,69,39)" },
    body: { top: "rgb(115,84,48)", bottom: "rgb(156,118,75)" },
    belly: null,
    eyes: { outer: "rgb(20,20,20)", pupil: "rgb(99,73,41)" },
    nose: { outer: "rgb(45,50,53)", inner: "rgb(33,35,37)" },
    cheeks: null,
  },
  // 3 — green bear (with border extras)
  {
    bg: "rgb(52,135,63)",
    ears: null,
    legs: { fill: "rgb(45,99,52)" },
    body: { top: "rgb(52,135,63)", bottom: "rgb(70,181,83)" },
    belly: null,
    eyes: { outer: "rgb(120,247,108)", pupil: "rgb(45,99,52)" },
    nose: { outer: "rgb(56,117,55)", inner: "rgb(24,71,23)" },
    cheeks: null,
    extras(ctx) {
      // border overlay (scaled down slightly before this is called)
      ctx.save();
      ctx.scale(1 / 0.9, 1 / 0.9);
      ctx.fillStyle = "rgb(100,100,100)";
      const h = 64;
      ctx.fillRect(-h, -h, 11, h * 2);
      ctx.fillRect(h - 11, -h, 11, h * 2);
      ctx.fillRect(-h, -h, h * 2, 11);
      ctx.fillRect(-h, h - 11, h * 2, 11);
      ctx.restore();
    },
  },
  // 4 — panda (radial gradient legs)
  {
    bg: "rgb(230,230,230)",
    ears: null,
    legs: null, // panda uses radial gradients — handled in extras
    body: { top: "rgb(230,230,230)", bottom: "rgb(230,230,230)" },
    belly: null,
    eyes: { outer: "rgb(0,0,0)", pupil: "rgb(70,70,70)" },
    nose: { outer: "rgb(45,50,53)", inner: "rgb(33,35,37)" },
    cheeks: null,
    extras(ctx) {
      // radial-gradient legs
      const makeGrad = (cx, cy) => {
        const g = ctx.createRadialGradient(cx, cy, 27, cx, cy, 28);
        g.addColorStop(0, "rgb(50,50,50)");
        g.addColorStop(1, "rgb(200,200,200)");
        return g;
      };
      ctx.fillStyle = makeGrad(-22, -14);
      ctx.beginPath();
      ctx.moveTo(-64, 64);
      ctx.lineTo(-64, -13);
      ctx.bezierCurveTo(-36, 18, -29, -72, -10, -20);
      ctx.lineTo(-10, 64);
      ctx.fill();

      ctx.fillStyle = makeGrad(22, -14);
      ctx.beginPath();
      ctx.moveTo(64, 64);
      ctx.lineTo(64, -13);
      ctx.bezierCurveTo(36, 18, 29, -72, 10, -20);
      ctx.lineTo(10, 64);
      ctx.fill();

      // white body strip over the top
      ctx.fillStyle = "rgb(230,230,230)";
      ctx.beginPath();
      ctx.moveTo(-9, -12);
      ctx.bezierCurveTo(-11, 5, -30, 56, -9, 64);
      ctx.moveTo(9, -12);
      ctx.bezierCurveTo(11, 5, 30, 56, 9, 64);
      ctx.fill();
      ctx.fillRect(-10, -11, 20, 75);
    },
  },
  // 5 — striped / zebra bear
  {
    bg: "rgb(199,198,177)",
    ears: null,
    legs: { fill: "rgb(173,166,173)" },
    body: { top: "rgb(199,198,177)", bottom: "rgb(224,221,184)" },
    belly: null,
    eyes: { outer: "rgb(0,0,0,0.1)", pupil: "rgb(40,40,40)" },
    nose: { outer: "rgb(45,50,53)", inner: "rgb(33,35,37)" },
    cheeks: null,
    extras(ctx) {
      ctx.strokeStyle = "rgb(40,40,40)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-29, -11);
      ctx.bezierCurveTo(-23, -14, -21, -15, -16, -13);
      ctx.moveTo(29, -11);
      ctx.bezierCurveTo(23, -14, 21, -15, 16, -13);
      ctx.stroke();
      // zigzag leg lines
      ctx.beginPath();
      for (const [sx, dir] of [
        [-64, 1],
        [64, -1],
      ]) {
        ctx.moveTo(sx, 64);
        ctx.lineTo(sx + dir * 15, 54);
        ctx.lineTo(sx, 44);
        ctx.lineTo(sx + dir * 21, 34);
        ctx.lineTo(sx, 24);
        ctx.lineTo(sx + dir * 13, 14);
        ctx.lineTo(sx, 4);
        ctx.lineTo(sx + dir * 9, -16);
      }
      ctx.fill();
    },
  },
  // 6 — tan / caramel bear
  {
    bg: "rgb(176,147,118)",
    ears: null,
    legs: { fill: "rgb(153,125,97)" },
    body: { top: "rgb(176,147,118)", bottom: "rgb(189,162,134)" },
    belly: null,
    eyes: { outer: "rgb(20,20,20)", pupil: "rgb(153,125,97)" },
    nose: { outer: "rgb(45,50,53)", inner: "rgb(33,35,37)" },
    cheeks: "rgb(205,50,50,0.07)",
    extras(ctx) {
      // small horn/tuft
      ctx.fillStyle = "rgb(69,62,51)";
      ctx.beginPath();
      ctx.moveTo(-9, -64);
      ctx.bezierCurveTo(-5, -56, -13, -53, -19, -55);
      ctx.bezierCurveTo(-6, -36, 6, -45, 10, -49);
      ctx.bezierCurveTo(15, -52, 16, -61, 13, -64);
      ctx.fill();
      // extra eye ring
      _e(ctx, 19, -19, 5, 3);
      _e(ctx, -19, -19, 5, 3);
    },
  },
  // 7 — scout / flag bear
  {
    bg: "rgb(56,75,125)",
    ears: null,
    legs: null,
    body: { top: "rgb(56,75,125)", bottom: "rgb(56,75,125)" },
    belly: null,
    eyes: { outer: "rgb(0,0,0)", pupil: "rgb(0,0,0)" },
    nose: { outer: "rgb(0,0,0)", inner: "rgb(0,0,0)" },
    cheeks: null,
    extras(ctx) {
      // neckerchief / flag body
      ctx.fillStyle = "rgb(196,114,96)";
      ctx.beginPath();
      ctx.moveTo(-15, -64);
      ctx.lineTo(-29, 64);
      ctx.lineTo(29, 64);
      ctx.lineTo(15, -64);
      ctx.fill();

      // shading lines
      ctx.strokeStyle = "rgb(0,0,0,0.2)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-15, -64);
      ctx.lineTo(-29, 64);
      ctx.moveTo(15, -64);
      ctx.lineTo(29, 64);
      ctx.stroke();

      // white collar tabs
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.moveTo(-15, -64);
      ctx.lineTo(-11, -50);
      ctx.lineTo(-64, -64);
      ctx.moveTo(15, -64);
      ctx.lineTo(10, -50);
      ctx.lineTo(64, -64);
      ctx.fill();
      ctx.stroke();

      // merit badge dots
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "white";
      const badges = [
        { fill: "rgb(227,227,107)", cx: -31, cy: -27 },
        { fill: "rgb(145,194,103)", cx: -35, cy: 3 },
        { fill: "rgb(252,81,81)", cx: -38, cy: 33 },
      ];
      for (const b of badges) {
        ctx.fillStyle = b.fill;
        _e(ctx, b.cx, b.cy, 6, 6);
        ctx.stroke();
      }
    },
  },
  // 8 — gold / honey bear
  {
    bg: "rgb(194,149,43)",
    ears: null,
    legs: { fill: "rgb(176,126,39)" },
    body: { top: "rgb(194,149,43)", bottom: "rgb(214,173,79)" },
    belly: "rgb(190,190,190,0.6)",
    eyes: { outer: "rgb(20,20,20)", pupil: "rgb(186,161,115)" },
    nose: { outer: "rgb(45,50,53)", inner: "rgb(33,35,37)" },
    cheeks: null,
    extras(ctx) {
      // belly highlight dot
      ctx.fillStyle = "rgb(255,255,255,0.5)";
      _e(ctx, -45, -21, 2, 4);
    },
  },
  // 9 — yellow / sun bear
  {
    bg: "rgb(235,210,96)",
    ears: null,
    legs: { fill: "rgb(209,189,102)" },
    body: { top: "rgb(235,210,96)", bottom: "rgb(250,233,163)" },
    belly: null,
    eyes: { outer: "rgb(20,20,20)", pupil: "rgb(209,189,102)" },
    nose: { outer: "rgb(87,59,30)", inner: "rgb(51,34,18)" },
    cheeks: "rgb(255,166,166,0.4)",
    extras(ctx) {
      // extra eye markings
      _e(ctx, 21, -19, 5, 2);
      _e(ctx, -22, -19, 5, 2);
    },
  },
  // 10 — face-only (white, just eyes + mouth, used for UI)
  {
    bg: "rgb(255,255,255)",
    ears: null,
    legs: null,
    body: { top: "rgb(255,255,255)", bottom: "rgb(255,255,255)" },
    belly: null,
    eyes: { outer: "rgb(0,0,0)", pupil: "rgb(0,0,0)" },
    nose: { outer: "rgb(0,0,0)", inner: "rgb(0,0,0)" },
    cheeks: null,
    extras(ctx) {
      ctx.strokeStyle = "rgb(0,0,0)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-16, 10);
      ctx.bezierCurveTo(-20, 39, 20, 39, 16, 10);
      ctx.closePath();
      ctx.stroke();
    },
  },
  // 11 — pink / bubblegum bear
  {
    bg: "rgb(242,102,242)",
    ears: { fill: "rgb(242,102,242)" },
    legs: { fill: "rgb(119,252,183)" },
    body: { top: "rgb(242,102,242)", bottom: "rgb(242,102,242)" },
    belly: null,
    eyes: { outer: "rgb(255,255,255)", pupil: "rgb(50,255,150)" },
    nose: { outer: "rgb(50,255,150)", inner: "rgb(49,224,134)" },
    cheeks: null,
    extras(ctx) {
      ctx.fillStyle = "rgb(242,102,242)";
      _e(ctx, BEAR.earX, BEAR.earY, BEAR.earR, BEAR.earR);
      _e(ctx, -BEAR.earX, BEAR.earY, BEAR.earR, BEAR.earR);
    },
  },
];

// ─── window.textures_bear ─────────────────────────────────────────────────────

window.textures_bear = function (tex_ctx) {
  function e(x, y, w, h, r = 0) {
    tex_ctx.beginPath();
    tex_ctx.ellipse(x, y, w, h, r, 0, 7);
    tex_ctx.fill();
  }

  tex_ctx.clearRect(0, 0, 1024, 1024);
  tex_ctx.lineCap = "butt";
  tex_ctx.lineJoin = "butt";

  BEAR_VARIANTS.forEach((cfg, i) => {
    const col = i % 8;
    const row = Math.floor(i / 8);
    const cx = col * 128 + 64;
    const cy = row * 128 + 64;

    withCtx(tex_ctx, () => {
      tex_ctx.translate(cx, cy);
      if (cfg.scale) tex_ctx.scale(cfg.scale, cfg.scale);
      drawBear(tex_ctx, cfg);
    });
  });
};
