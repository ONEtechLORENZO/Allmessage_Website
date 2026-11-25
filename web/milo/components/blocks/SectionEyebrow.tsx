import "./eyebrow.css";

// Numbered section label ("03 — Come funziona"), same look as the labels of blocks 01 and 02.
// It animates in when its block sets data-go (blocks set data-js first, so without JS it is simply visible).
export function SectionEyebrow({ num, children }: { num: string; children: React.ReactNode }) {
  return (
    <p className="seb">
      <span className="seb-chip seb-a">{num}</span>
      <span aria-hidden="true" className="seb-dash seb-a" />
      <span className="seb-text seb-a">{children}</span>
    </p>
  );
}
