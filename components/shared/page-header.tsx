import { AppText } from "@/components/shared/app-text";

interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageHeader = function ({ title, description, action }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <AppText type="h2">{title}</AppText>
        {description && (
          <AppText type="subtitle" className="mt-1 text-sm">
            {description}
          </AppText>
        )}
      </div>
      {action}
    </div>
  );
};
