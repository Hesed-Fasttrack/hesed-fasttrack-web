import { AppText } from "@/components/shared/app-text";

export default function AdminOverviewPage() {
  return (
    <div>
      <AppText type="h2">Overview</AppText>
      <AppText type="subtitle" className="mt-1 text-sm">
        Platform stats land here in the next batch.
      </AppText>
    </div>
  );
}
