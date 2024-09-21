import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { poppins } from "./fonts";
import { Toaster } from "~/components/ui/toaster";
import { ThemeProvider } from "~/components/theme/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Providers from "./providers";

export const metadata = {
  title: "ClassQuest - Tools and Worksheet Generators for Teachers",
  description:
    "ClassQuest offers various tools and worksheet generators to help teachers create engaging and effective learning materials for their students.",
  keywords:
    "ClassQuest, teacher tools, worksheet generator, education, classroom resources",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${poppins.className}`}>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Providers>
              <main>{children}</main>
              <Analytics />
              <SpeedInsights />
              <Toaster />
            </Providers>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
