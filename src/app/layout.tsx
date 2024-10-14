import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import BasicLayour from "./basicLayout";

export const metadata: Metadata = {
  title: "CheckMyHomeOnline",
  description: "Verify your Dream Home before Committing to it",
};

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BasicLayour>
      <Header />
      {children}
      <Footer />
    </BasicLayour>
  );
}
