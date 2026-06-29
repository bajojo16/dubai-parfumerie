"use client";

import { useLocale } from "next-intl";
import { ShippingChecker } from "@/components/sections/ShippingChecker";
import { DEMO_SHIPPING_COUNTRIES } from "@/data/shipping-countries";

export default function PreviewShippingPage() {
  const locale = useLocale();
  return (
    <main style={{ background: "#FDFBF6", minHeight: "100vh", padding: "40px 0" }}>
      <ShippingChecker
        countries={DEMO_SHIPPING_COUNTRIES}
        detectedCode="FR"
        locale={locale}
      />
    </main>
  );
}
