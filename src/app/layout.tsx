import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TN7 EDU",
  description:
    "Học IELTS cùng chuyên gia đầu ngành. Hỗ trợ toàn diện từ giáo viên bản ngữ, cựu giám khảo và chuyên gia IELTS Việt Nam.",
  openGraph: {
    title: "TN7 EDU",
    description:
      "Học IELTS cùng chuyên gia đầu ngành. Hỗ trợ toàn diện từ giáo viên bản ngữ, cựu giám khảo và chuyên gia IELTS Việt Nam.",
    url: "https://tn7edu.com/",
    images: [
      {
        url: "",
        width: 1200,
        height: 630,
        alt: "TN7 EDU",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TN7 EDU",
    description:
      "Học IELTS cùng chuyên gia đầu ngành. Hỗ trợ toàn diện từ giáo viên bản ngữ, cựu giám khảo và chuyên gia IELTS Việt Nam.",
    images: [
      "https://res.cloudinary.com/farmcode/image/upload/v1736620702/ielts-viet/website-thumbnail_uqdu6b.png",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className} suppressHydrationWarning={true}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
