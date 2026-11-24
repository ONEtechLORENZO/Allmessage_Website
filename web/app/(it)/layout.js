import Shell from "../_home/Shell";
import head from "../head.json";
import { pageMetadata } from "../../lib/site";

export { viewport } from "../_home/Shell";

export const metadata = pageMetadata("it", head);

export default function ItalianLayout({ children }) {
  return <Shell lang="it">{children}</Shell>;
}
