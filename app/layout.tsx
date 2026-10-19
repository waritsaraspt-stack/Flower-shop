import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { AuthGuard } from "@/components/layout/AuthGuard";

export const metadata: Metadata = {
  title: "BloomPOS - ระบบบริหารจัดการร้านดอกไม้",
  description: "ระบบเปิดบิล จัดคิวทำช่อดอกไม้ บันทึกสลิป และสรุปบัญชีร้านดอกไม้ รองรับมือถือและไอแพด",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BloomPOS",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FAF8F5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-rose-100 selection:text-rose-700 min-h-screen flex flex-col bg-[#FAF8F5]">
        <StoreProvider>
          <AppHeader />
          <AuthGuard>
            <main className="flex-1 pb-24 sm:pb-16">{children}</main>
          </AuthGuard>
          <BottomNav />
        </StoreProvider>
      </body>
    </html>
  );
}
