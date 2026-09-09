import { Footer } from "@/app/_components/footer";
import { Header } from "@/app/_components/header";

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

interface Props {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export const LegalPage = function ({ title, updated, intro, sections }: Props) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-foreground-subtle">Last updated: {updated}</p>
        <p className="mt-6 leading-relaxed text-foreground-muted">{intro}</p>

        <div className="mt-10 space-y-10">
          {sections.map((section, index) => (
            <section key={section.heading}>
              <h2 className="text-xl font-bold text-foreground">
                {index + 1}. {section.heading}
              </h2>
              {section.paragraphs?.map(paragraph => (
                <p key={paragraph.slice(0, 40)} className="mt-3 leading-relaxed text-foreground-muted">
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-3 list-disc space-y-2 pl-6 text-foreground-muted">
                  {section.bullets.map(bullet => (
                    <li key={bullet.slice(0, 40)} className="leading-relaxed">
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};
