"use client";

import { useLocale } from "next-intl";
import { JournalSection } from "@/components/sections/JournalSection";
import { DEMO } from "@/data/journal-articles";

export default function PreviewJournalPage() {
  const locale = useLocale();
  return (
    <main style={{ minHeight: "100vh" }}>
      <JournalSection articles={DEMO} locale={locale} />
    </main>
  );
}
