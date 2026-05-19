import type { Metadata } from "next";
import "./globals.css"; // Global styles
import { TaskProvider } from "@/context/TaskContext";

export const metadata: Metadata = {
  title: "TaskPro",
  description: "TaskPro",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <TaskProvider>{children}</TaskProvider>
      </body>
    </html>
  );
}
