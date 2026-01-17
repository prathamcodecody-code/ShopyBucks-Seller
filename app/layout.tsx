// app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext";

export const metadata = {
  title: "ShopyBucks Seller",
  description: "ShopyBucks Seller Management Dashboard",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
