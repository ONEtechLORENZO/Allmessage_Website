import { Fragment } from "react";
import "./milo-logo.css";

// Text that "writes itself" one character at a time, like the logo letters drawing in.
// It stays real text in the HTML (spans only wrap each character), so search engines
// and screen readers read it normally.

type Props = {
  text: string;
  started: boolean;
  /** seconds to wait after `started` before the first character */
  delay?: number;
  /** seconds between characters */
  step?: number;
  className?: string;
  style?: React.CSSProperties;
};

export function TypeText({ text, started, delay = 0, step = 0.015, className = "", style }: Props) {
  const words = text.split(" ");
  const offsets = words.map((_, w) => words.slice(0, w).reduce((sum, x) => sum + x.length + 1, 0));
  return (
    <p className={`milo-type ${started ? "milo-type-play" : ""} ${className}`} style={style}>
      {words.map((word, w) => (
        <Fragment key={w}>
          <span className="milo-type-word">
            {[...word].map((ch, c) => (
              <span
                key={c}
                className="milo-type-ch"
                style={{ animationDelay: `${(delay + (offsets[w] + c) * step).toFixed(3)}s` }}
              >
                {ch}
              </span>
            ))}
          </span>
          {w < words.length - 1 && " "}
        </Fragment>
      ))}
    </p>
  );
}
