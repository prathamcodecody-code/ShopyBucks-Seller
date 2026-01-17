"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    if (user.role === "ADMIN") {
      router.replace("/admin/dashboard");
      return;
    }

    if (user.role === "SELLER") {
      if (user.sellerStatus === "APPROVED") {
        router.replace("/dashboard");
      } else {
        router.replace("/seller/onboarding");
      }
      return;
    }

    router.replace("/dashboard");
  }, [user, loading, router]);

  return null;
}
