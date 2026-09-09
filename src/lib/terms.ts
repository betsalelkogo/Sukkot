export type TermsBlock = { type: "heading" | "paragraph"; text: string };

export function parseTermsBody(body: string): TermsBlock[] {
  const blocks: TermsBlock[] = [];
  const chunks = body.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);

  for (const chunk of chunks) {
    const lines = chunk.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) {
      continue;
    }
    if (lines[0].startsWith("## ")) {
      blocks.push({ type: "heading", text: lines[0].slice(3).trim() });
      for (const line of lines.slice(1)) {
        blocks.push({ type: "paragraph", text: line });
      }
      continue;
    }
    blocks.push({ type: "paragraph", text: lines.join(" ") });
  }

  return blocks.filter((block) => block.text);
}
