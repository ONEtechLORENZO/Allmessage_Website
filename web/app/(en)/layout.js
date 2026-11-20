import Shell from "../_home/Shell";
import en from "../i18n/en.json";

export { viewport } from "../_home/Shell";

export const metadata = {
  title: en.meta.title,
  description: en.meta.description,
};

export default function EnglishLayout({ children }) {
  return <Shell lang="en">{children}</Shell>;
}
