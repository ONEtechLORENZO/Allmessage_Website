import Shell from "../_home/Shell";
import en from "../i18n/en.json";
import { pageMetadata } from "../../lib/site";

export { viewport } from "../_home/Shell";

export const metadata = pageMetadata("en", en.meta);

export default function EnglishLayout({ children }) {
  return <Shell lang="en">{children}</Shell>;
}
