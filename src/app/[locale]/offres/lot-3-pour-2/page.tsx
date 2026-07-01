"use client";

import { useLocale } from "next-intl";
import { BundleBuilder } from "@/components/bundle/BundleBuilder";

export default function Lot3Pour2Page() {
  const locale = useLocale();
  return <BundleBuilder variant="page" locale={locale} />;
}
