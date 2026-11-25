// Shared geometry for the hero: how much of the tile wall is visible for a given box size,
// and where the logo sits on the wall. Used by the 3D wall (camera) and by the logo overlay,
// so both always line up, at any screen size.

export const TU = 100.6; // design pixels per world unit (one tile ≈ 100 px)
const DESIGN_W = 1456, DESIGN_H = 819;
const HALF_W = DESIGN_W / TU / 2, HALF_H = DESIGN_H / TU / 2;

// Logo box on the 1456×819 design, in design pixels. Moved a little left of the reference
// image so the dial messages fit between the "o" and the blocks on the right.
const LOGO = { left: 560, top: 128, width: 510 };

export type WallView = { hw: number; hh: number; phone: boolean };

/** Visible half-width / half-height of the wall in world units. The wall grid extends far
 *  beyond the original artwork, so wider or taller screens simply see more tiles. */
export function wallView(w: number, h: number): WallView {
  const a = w / h;
  if (a >= DESIGN_W / DESIGN_H) return { hw: HALF_H * a, hh: HALF_H, phone: false }; // wide: more tiles left/right
  if (a >= 1.2) return { hw: HALF_W, hh: HALF_W / a, phone: false }; // squarer: more rows top/bottom
  const hh = HALF_H * 1.25; // phones: crop the sides, show a few more rows
  return { hw: hh * a, hh, phone: true };
}

// Description text box, bottom right of the wall (design pixels), and its font size.
const TEXT = { left: 732, top: 700, width: 690 };
const TEXT_FONT = 15.5;

type Rect = { left: number; top: number; width: number };

/** Places a design-pixel rectangle on the wall. Returns percentages of the hero box,
 *  plus `scale` = screen pixels per design pixel (for font sizes). Null on phones. */
function place(w: number, h: number, r: Rect) {
  if (!w || !h) return null;
  const v = wallView(w, h);
  if (v.phone) return null;
  const x = (r.left - DESIGN_W / 2) / TU, y = (DESIGN_H / 2 - r.top) / TU;
  return {
    left: ((x + v.hw) / (2 * v.hw)) * 100,
    top: ((v.hh - y) / (2 * v.hh)) * 100,
    width: (r.width / TU / (2 * v.hw)) * 100,
    scale: w / (2 * v.hw * TU),
  };
}

/** Logo position on the hero box, or null on phones (logo is then centred by CSS). */
export const logoBox = (w: number, h: number) => place(w, h, LOGO);

/** Description text position and font size, or null on phones (then placed by CSS). */
export function textBox(w: number, h: number) {
  const p = place(w, h, TEXT);
  return p && { ...p, fontSize: Math.max(12, TEXT_FONT * p.scale) };
}
