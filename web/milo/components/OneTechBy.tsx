import { basePath } from "@milo/lib/base-path";
import "./onetech-by.css";

// "prodotto di" + the One Tech logo, linking to the One Tech site (header and footer, as on Allmessage).
export function OneTechBy({ label, className = "" }: { label: string; className?: string }) {
  return (
    <a className={`otby ${className}`} href="https://www.otech.one/" target="_blank" rel="noopener">
      <span>{label}</span>
      <img src={`${basePath}/img/onetech-logo-dark.png`} alt="One Tech" width={480} height={239} />
    </a>
  );
}
