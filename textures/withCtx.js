// CHQ: Claude AI refactored and fixed
// ─── withCtx ─────────────────────────────────────────────────────────────────
// Saves the full transform, runs fn, then restores to identity.
// Previously referenced throughout but never defined.

export default function withCtx(ctx, fn) {
  const m = ctx.getTransform();
  fn(ctx);
  ctx.setTransform(m);
}
