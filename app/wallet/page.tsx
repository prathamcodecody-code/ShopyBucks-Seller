import { Suspense } from "react";
import SellerLayout from "@/components/layout/SellerLayout";
import WalletClient from "./WalletClient";

export const dynamic = "force-dynamic";

export default function WalletPage() {
  return (
    <SellerLayout>
      <Suspense fallback={<div className="p-6">Loading wallet…</div>}>
        <WalletClient />
      </Suspense>
    </SellerLayout>
  );
}
