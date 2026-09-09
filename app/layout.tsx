import { cn } from "@/lib/utils";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppProvider } from "./_components/provider";
import { rootMetadata, viewport } from "./_lib/metadata";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata = rootMetadata;
export { viewport };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("h-full antialiased", jakarta.variable)}>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
