import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const metadata = { title: "Rootmark - Pitch Deck", description: "Portaldot Hacker House 2026 Track 1 deck" };

export default function PitchDeckPage() {
  const html = readFileSync(resolve(process.cwd(), "public/pitch-deck.html"), "utf8");
  const inner = html.replace(/^[\s\S]*?<body[^>]*>/i, "").replace(/<\/body>[\s\S]*$/i, "");
  const style = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i)?.[1] ?? "";
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: style }} />
      <div dangerouslySetInnerHTML={{ __html: inner }} />
    </>
  );
}
