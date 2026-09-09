import { parseTermsBody } from "@/lib/terms";

export function TermsDocument({ body }: { body: string }) {
  const blocks = parseTermsBody(body);
  const sections: Array<{ heading: string | null; paragraphs: string[] }> = [];

  for (const block of blocks) {
    if (block.type === "heading") {
      sections.push({ heading: block.text, paragraphs: [] });
      continue;
    }
    if (sections.length === 0) {
      sections.push({ heading: null, paragraphs: [block.text] });
      continue;
    }
    sections[sections.length - 1].paragraphs.push(block.text);
  }

  return (
    <>
      {sections.map((section, index) => (
        <section key={`${section.heading ?? "intro"}-${index}`} className="space-y-2">
          {section.heading ? <h2 className="text-2xl font-semibold">{section.heading}</h2> : null}
          {section.paragraphs.map((paragraph, paragraphIndex) => (
            <p key={`${section.heading ?? "intro"}-${paragraphIndex}`}>{paragraph}</p>
          ))}
        </section>
      ))}
    </>
  );
}
