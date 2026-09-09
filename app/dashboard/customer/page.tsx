import { AppText } from "@/components/shared/app-text";

export default function CustomerDashboardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 text-center">
      <AppText type="h2">Customer dashboard</AppText>
      <AppText type="subtitle" className="mt-2 max-w-md text-sm">
        Your shipments, wallet and addresses are coming to the web soon. For now, everything works in the HESED FastTrack app.
      </AppText>
    </div>
  );
}
