import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Elysia EdgeDB Next.js Example",
    description:
        "Starter template using Elysia with EdgeDB and Next.js demonstrating authentication and authorization.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = auth();

    return (
        <AuthProvider session={session}>
            <html lang="en" className="absolute inset-0">
                <body
                    className={cn(inter.className, "min-h-full flex flex-col")}
                >
                    {children}
                    <Toaster position="bottom-center" />
                </body>
            </html>
        </AuthProvider>
    );
}
