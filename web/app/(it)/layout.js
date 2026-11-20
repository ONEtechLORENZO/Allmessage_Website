import Shell from "../_home/Shell";
import head from "../head.json";

export { viewport } from "../_home/Shell";

export const metadata = {
  title: head.title,
  description: head.description,
};

export default function ItalianLayout({ children }) {
  return <Shell lang="it">{children}</Shell>;
}
