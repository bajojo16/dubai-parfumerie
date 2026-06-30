"use client";

import { useLocale } from "next-intl";
import { CategoryRail } from "@/components/sections/CategoryRail";

export default function PreviewCategoryRailPage() {
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      style={{ background: "#FDFBF6", minHeight: "100vh", paddingBlock: 48 }}
    >
      <div style={{ maxWidth: 1180, marginInline: "auto", paddingInline: 24 }}>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            color: "#6A655D",
            margin: "0 0 8px",
          }}
        >
          Aperçu isolé — CategoryRail (disques circulaires façon Notino). Locale :{" "}
          {locale.toUpperCase()}
        </p>
      </div>

      <CategoryRail
        locale={locale}
        heading={{
          eyebrow: "Explorer la maison",
          title: (
            <>
              Nos <em>catégories</em> signature
            </>
          ),
        }}
      />
    </main>
  );
}
