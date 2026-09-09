interface Props {
  eyebrow: string;
  title: string;
  description?: string;
}

export const SectionHeading = function ({ eyebrow, title, description }: Props) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-relaxed text-foreground-muted">{description}</p>}
    </div>
  );
};
