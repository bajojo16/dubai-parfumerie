"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatedHero } from "@/components/sections/AnimatedHero";
import { BestSellers } from "@/components/sections/BestSellers";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { VideoPlaceholder } from "@/components/ui/VideoPlaceholder";
import { QuizSignature } from "@/components/sections/QuizSignature";
import { BackToTop } from "@/components/ui/BackToTop";
import { ProductCardLuxe, type LuxeProduct } from "@/components/ui/ProductCardLuxe";
import { BrandCard, type BrandCardData } from "@/components/ui/BrandCard";
import { OlfactiveTwin } from "@/components/sections/OlfactiveTwin";
import { OLFACTIVE_TWINS } from "@/data/olfactive-twins";
import { ShoppableVideoCarousel } from "@/components/sections/ShoppableVideoCarousel";
import { DEMO as SHOPPABLE_VIDEOS } from "@/data/shoppable-videos";
import { JournalSection } from "@/components/sections/JournalSection";
import { DEMO as JOURNAL_ARTICLES } from "@/data/journal-articles";
import { useLocale, useTranslations } from "next-intl";

const COFFRETS_HOME: LuxeProduct[] = [
  { image: "/assets/coffret-reef.jpg", brand: "Dubaï Parfumerie", title: "Coffret Découverte Oud", price: 39.9, oldPrice: 79.9, limitedStock: true, href: "/promo-flash", rating: 4.5, reviewCount: 97 },
  { image: "/assets/coffret-reef.jpg", brand: "Dubaï Parfumerie", title: "Lot 3 Parfums Best-Of", price: 49.9, oldPrice: 109.9, href: "/promo-flash", rating: 5, reviewCount: 64 },
  { image: "/assets/coffret-reef.jpg", brand: "Dubaï Parfumerie", title: "Coffret Miniatures Floral", price: 29.9, oldPrice: 64.9, href: "/promo-flash", rating: 4, reviewCount: 38 },
  { image: "/assets/coffret-reef.jpg", brand: "Dubaï Parfumerie", title: "Lot Découverte Huiles 6×3ml", price: 24.9, oldPrice: 54.9, limitedStock: true, href: "/promo-flash", rating: 4.5, reviewCount: 51 },
];

// ─── Trust marquee (icônes ligne, fini les emojis) ───────────────────────────
const ic = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const TRUST_ITEMS: { icon: React.ReactNode; label: string }[] = [
  { icon: <svg {...ic} fill="currentColor" stroke="none"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.6 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z"/></svg>, label: "8 400+ avis vérifiés" },
  { icon: <svg {...ic}><path d="M3 7h11v8H3z"/><path d="M14 10h4l3 3v2h-7z"/><circle cx="7" cy="17" r="1.6"/><circle cx="17.5" cy="17" r="1.6"/></svg>, label: "Livraison offerte dès 60 €" },
  { icon: <svg {...ic}><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>, label: "Paiement 100% sécurisé" },
  { icon: <svg {...ic}><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>, label: "Authenticité certifiée" },
  { icon: <svg {...ic}><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg>, label: "Retours 14 jours offerts" },
  { icon: <svg {...ic}><path d="M21 16V8l-9-5-9 5v8l9 5z"/><path d="M3.3 7L12 12l8.7-5"/><path d="M12 22V12"/></svg>, label: "Expédition sous 24h" },
  { icon: <svg {...ic}><path d="M6 3h12l3 6-9 12L3 9z"/><path d="M3 9h18"/><path d="M9 3l3 6 3-6"/></svg>, label: "Parfums rares introuvables en France" },
  { icon: <svg {...ic}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>, label: "Paiement en 4× sans frais" },
];

// ─── Static data ─────────────────────────────────────────────────────────────

const products = [
  { id: 1, image: "/assets/prod-1.jpg", brand: "Lattafa", name: "Oud Pour Elle", price: 28.90, oldPrice: 49.90, rating: 4.8, reviews: 342, badge: "-42%", notes: "Oud · Rose · Musc blanc" },
  { id: 2, image: "/assets/prod-2.jpg", brand: "Al Haramain", name: "Amber Oud", price: 34.90, oldPrice: 59.90, rating: 4.9, reviews: 287, badge: "-42%", notes: "Ambre · Vanille · Bois de oud" },
  { id: 3, image: "/assets/prod-3.jpg", brand: "Reef", name: "Opulent Blue", price: 22.90, oldPrice: 39.90, rating: 4.7, reviews: 156, badge: "-43%", notes: "Musc · Cèdre · Bergamote" },
  { id: 4, image: "/assets/prod-4.jpg", brand: "Swiss Arabian", name: "Shaghaf Oud", price: 42.90, oldPrice: 74.90, rating: 4.9, reviews: 421, badge: "-43%", notes: "Oud · Santal · Rose de Taïf" },
  { id: 5, image: "/assets/prod-5.jpg", brand: "Armaf", name: "Club de Nuit", price: 19.90, oldPrice: 34.90, rating: 4.6, reviews: 198, badge: "-43%", notes: "Agrumes · Bois · Musc" },
  { id: 6, image: "/assets/prod-6.jpg", brand: "Ahmed Al Maghribi", name: "L'Or Intense", price: 36.90, oldPrice: 64.90, rating: 4.8, reviews: 134, badge: "-43%", notes: "Épices · Ambre · Encens" },
];

const bestSellers = products.slice(2, 6);
const oilItems = products.slice(0, 3);

// Adapte un produit catalogue (name/reviews) vers le format ProductCardLuxe (title/reviewCount)
type CatalogProduct = (typeof products)[number];
function toLuxe(p: CatalogProduct): LuxeProduct {
  return {
    image: p.image,
    brand: p.brand,
    title: p.name,
    price: p.price,
    oldPrice: p.oldPrice,
    rating: p.rating,
    reviewCount: p.reviews,
    href: "/promo-flash",
  };
}

const olfactoryFamilies = [
  { id: 1, name: "Boisé · Oud", count: 82, color: "#6B3A2A", img: "/assets/prod-1.jpg" },
  { id: 2, name: "Floral · Musc", count: 67, color: "#C8607A", img: "/assets/prod-4.jpg" },
  { id: 3, name: "Gourmand · Vanille", count: 45, color: "#C8901E", img: "/assets/prod-6.jpg" },
  { id: 4, name: "Épicé · Encens", count: 38, color: "#8B1A1A", img: "/assets/prod-5.jpg" },
  { id: 5, name: "Fruité · Floral", count: 51, color: "#7B3FA0", img: "/assets/prod-2.jpg" },
];

const brands: BrandCardData[] = [
  { name: "Lattafa", founded: 1980, origin: "Sharjah", count: "80+", logo: "/brands/lattafa.jpg", logoHover: "/brands/lattafa-hover.jpg", cover: true, coverBg: "#262626", coverBgHover: "#0A0A0A" },
  { name: "Reef", founded: 1995, origin: "UAE", count: "40+", logo: "/brands/reef.jpg", logoHover: "/brands/reef-hover.jpg", cover: true },
  { name: "Al Haramain", founded: 1970, origin: "Dubaï", count: "60+", logo: "/brands/alharamain.jpg", logoHover: "/brands/alharamain-hover.jpg", cover: true, coverBg: "#FCFBF9", coverBgHover: "#FCFBF9" },
  { name: "Ahmed Al Maghribi", founded: 2005, origin: "Dubaï", count: "30+", logo: "/brands/ahmed.jpg", logoHover: "/brands/ahmed-hover.jpg", cover: true, coverBg: "#FCFBF9", coverBgHover: "#0A0A0A" },
  { name: "Oud Elite", origin: "UAE", count: "40+", logo: "/brands/oudelite.jpg", logoHover: "/brands/oudelite-hover.jpg", cover: true, coverBg: "#FCFBF9", coverBgHover: "#0A0A0A" },
  { name: "Swiss Arabian", founded: 1974, origin: "Dubaï", count: "70+", logo: "/brands/swissarabian.jpg", logoHover: "/brands/swissarabian-hover.jpg", cover: true, coverBg: "#FCFBF9", coverBgHover: "#0A0A0A" },
  { name: "Paris Corner", founded: 2010, origin: "France/UAE", count: "35+", logo: "/brands/pariscorner.jpg", logoHover: "/brands/pariscorner-hover.jpg", cover: true, coverBg: "#FCFBF9", coverBgHover: "#0A0A0A" },
  { name: "Maison Asrar", origin: "Dubaï", count: "25+", logo: "/brands/asrar.jpg", logoHover: "/brands/asrar-hover.jpg", cover: true, coverBg: "#FCFBF9", coverBgHover: "#0A0A0A" },
  { name: "Rasasi", founded: 1979, origin: "Dubaï", count: "50+" },
  { name: "Afnan", founded: 1997, origin: "Sharjah", count: "45+" },
  { name: "Maison Alhambra", origin: "UAE", count: "60+" },
  { name: "Ard Al Zaafaran", founded: 2007, origin: "Dubaï", count: "40+" },
  { name: "Armaf", founded: 2013, origin: "UAE", count: "50+" },
  { name: "Khadlaj", founded: 2003, origin: "Sharjah", count: "35+" },
];

const faqItems = [
  { q: "Comment passer ma commande ?", a: "Ajoutez vos articles au panier, puis suivez les étapes de validation. Paiement sécurisé par carte bancaire, PayPal ou en 4× sans frais." },
  { q: "Quels modes de paiement acceptez-vous ?", a: "Carte bancaire (Visa, Mastercard), PayPal, Apple Pay, et paiement en 4× sans frais avec Alma dès 60 €." },
  { q: "Mon code promo ne fonctionne pas", a: "Vérifiez la validité de la date, le montant minimum (si applicable) et que le code est saisi exactement tel qu'indiqué. Contactez-nous si le problème persiste." },
  { q: "Quels sont les délais de livraison ?", a: "Livraison standard : 3-5 jours ouvrés. Express 24h disponible. Offerte dès 60 € d'achats." },
  { q: "Comment suivre ma commande ?", a: "Un email de suivi vous est envoyé dès l'expédition. Vous pouvez suivre votre colis en temps réel via le lien fourni." },
  { q: "Comment effectuer un retour ?", a: "Vous disposez de 14 jours après réception pour retourner un article non ouvert. Contactez notre service client pour recevoir l'étiquette de retour." },
  { q: "Livrez-vous à l'international ?", a: "Oui, nous livrons dans toute l'Europe et dans de nombreux pays. Les frais et délais varient selon la destination." },
  { q: "Vous avez un projet B2B / grossiste ?", a: "Oui ! Contactez-nous à pro@dubai-parfumerie.fr pour un devis personnalisé. Tarifs dégressifs dès 10 unités." },
];

const testimonials = [
  { name: "Yasmine B.", city: "Paris", text: "Des parfums authentiques, exactement comme je les ai connus à Dubaï. La qualité est irréprochable et la livraison ultra rapide.", stars: 5 },
  { name: "Karim M.", city: "Lyon", text: "Mon flacon d'Amber Oud est arrivé avec son certificat d'authenticité. Je suis bluffé par la tenue, plus de 12 heures sur la peau !", stars: 5 },
  { name: "Sophie L.", city: "Bordeaux", text: "Le coffret découverte est parfait pour initier sa famille. J'en offre à toutes mes amies. Le service client est très réactif.", stars: 5 },
];

const blogPosts = [
  { title: "L'Oud : l'or liquide de l'Orient", category: "Culture", readTime: "5 min", excerpt: "Découvrez l'histoire fascinante de l'oud, la résine la plus précieuse au monde, extraite du bois d'aquilaria." },
  { title: "Comment choisir son premier parfum oriental", category: "Guide", readTime: "7 min", excerpt: "Entre oud, musc et ambre, naviguer dans la parfumerie orientale peut sembler intimidant. Voici notre guide pour bien commencer." },
  { title: "Musc blanc vs musc noir : quelles différences ?", category: "Expertise", readTime: "4 min", excerpt: "Deux âmes du musc, deux univers olfactifs. Le musc blanc, délicat et poudreux, face au musc noir, animal et envoûtant." },
  { title: "Les 5 erreurs à éviter avec les parfums orientaux", category: "Conseils", readTime: "3 min", excerpt: "Application, conservation, superposition… Quelques gestes simples pour sublimer vos fragrances et en profiter au maximum." },
];

const scentFamilies = ["Oud", "Musc", "Ambre", "Rose", "Santal", "Épices", "Vanille", "Bakhour"];

const scentProducts: Record<string, { brand: string; name: string; price: number; oldPrice: number; img: string }[]> = {
  Oud: [
    { brand: "Lattafa", name: "Oud Mood", price: 32.9, oldPrice: 54.9, img: "/assets/prod-1.jpg" },
    { brand: "Swiss Arabian", name: "Shaghaf Oud", price: 39.9, oldPrice: 74.9, img: "/assets/prod-2.jpg" },
    { brand: "Al Haramain", name: "Oudh 36", price: 44.9, oldPrice: 79.9, img: "/assets/prod-3.jpg" },
  ],
  Ambre: [
    { brand: "Al Haramain", name: "Amber Oud", price: 34.9, oldPrice: 59.9, img: "/assets/prod-2.jpg" },
    { brand: "Lattafa", name: " Amber Elixir", price: 29.9, oldPrice: 49.9, img: "/assets/prod-4.jpg" },
    { brand: "Rasasi", name: "Ambar Gold", price: 37.9, oldPrice: 64.9, img: "/assets/prod-5.jpg" },
  ],
  Musc: [
    { brand: "Lattafa", name: "Musk Mood", price: 24.9, oldPrice: 42.9, img: "/assets/prod-3.jpg" },
    { brand: "Swiss Arabian", name: "White Musk", price: 28.9, oldPrice: 49.9, img: "/assets/prod-6.jpg" },
    { brand: "Ard Al Zaafaran", name: "Musk Pour Elle", price: 22.9, oldPrice: 39.9, img: "/assets/prod-1.jpg" },
  ],
  Rose: [
    { brand: "Lattafa", name: "Rose pour Elle", price: 28.9, oldPrice: 49.9, img: "/assets/prod-4.jpg" },
    { brand: "Swiss Arabian", name: "Rose de Taïf", price: 42.9, oldPrice: 72.9, img: "/assets/prod-5.jpg" },
    { brand: "Rasasi", name: "Bloom Rose", price: 31.9, oldPrice: 54.9, img: "/assets/prod-2.jpg" },
  ],
  Santal: [
    { brand: "Al Haramain", name: "Sandal Wood", price: 36.9, oldPrice: 62.9, img: "/assets/prod-6.jpg" },
    { brand: "Lattafa", name: "Santal Royal", price: 33.9, oldPrice: 57.9, img: "/assets/prod-3.jpg" },
    { brand: "Swiss Arabian", name: "Sandalia", price: 38.9, oldPrice: 66.9, img: "/assets/prod-1.jpg" },
  ],
  Safran: [
    { brand: "Lattafa", name: "Saffron Mood", price: 30.9, oldPrice: 52.9, img: "/assets/prod-5.jpg" },
    { brand: "Rasasi", name: "Saffron Oud", price: 41.9, oldPrice: 71.9, img: "/assets/prod-2.jpg" },
    { brand: "Al Haramain", name: "Safran Élixir", price: 35.9, oldPrice: 61.9, img: "/assets/prod-4.jpg" },
  ],
  Vanille: [
    { brand: "Lattafa", name: "Vanilla Mood", price: 26.9, oldPrice: 44.9, img: "/assets/prod-6.jpg" },
    { brand: "Swiss Arabian", name: "Vanilla Oud", price: 39.9, oldPrice: 68.9, img: "/assets/prod-3.jpg" },
    { brand: "Rasasi", name: "Vanille Noire", price: 32.9, oldPrice: 56.9, img: "/assets/prod-1.jpg" },
  ],
  Encens: [
    { brand: "Al Haramain", name: "Encens Mystique", price: 37.9, oldPrice: 64.9, img: "/assets/prod-4.jpg" },
    { brand: "Lattafa", name: "Bakhour Mood", price: 29.9, oldPrice: 49.9, img: "/assets/prod-5.jpg" },
    { brand: "Swiss Arabian", name: "Incense Oud", price: 43.9, oldPrice: 76.9, img: "/assets/prod-2.jpg" },
  ],
};

const editorialBlocks = [
  { name: "Oud", desc: "L'oud (ou agarwood) est l'essence la plus précieuse au monde. Issu du bois d'aquilaria infecté par un champignon, il dévoile des facettes boisées, fumées et animales d'une profondeur incomparable.", symbol: "Ω" },
  { name: "Musc", desc: "Pilier de la parfumerie orientale, le musc confère chaleur et sensualité à chaque composition. Il fixe les autres matières et leur offre une longévité remarquable sur la peau.", symbol: "µ" },
  { name: "Vanille", desc: "La vanille orientale est plus gourmande, plus intensément crémeuse que ses cousines occidentales. Elle enrobe les compositions d'une douceur addictive qui dure des heures.", symbol: "V" },
  { name: "Bakhour", desc: "Le bakhour est un encens traditionnel arabe composé de copeaux d'oud, de musc et d'huiles essentielles. Son rituel olfactif imprègne la maison et les vêtements d'un souvenir inoubliable.", symbol: "B" },
];

// ─── CountdownTimer ───────────────────────────────────────────────────────────

function CountdownTimer() {
  const [time, setTime] = useState({ h: 23, m: 14, s: 52 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        s -= 1;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  const cellStyle: React.CSSProperties = {
    display: "inline-flex", flexDirection: "column", alignItems: "center",
    background: "rgba(255,255,255,0.1)", borderRadius: "var(--r-md)",
    padding: "4px 10px", minWidth: 46,
  };
  const numStyle: React.CSSProperties = {
    fontFamily: "var(--font-display)", fontSize: "1.6rem",
    color: "var(--on-dark-strong)", lineHeight: 1, fontWeight: 600,
  };
  const lblStyle: React.CSSProperties = {
    fontSize: "0.55rem", letterSpacing: "0.12em",
    textTransform: "uppercase", color: "var(--on-dark-muted)", marginTop: 2,
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={cellStyle}><span style={numStyle}>{pad(time.h)}</span><span style={lblStyle}>h</span></div>
      <span style={{ color: "var(--gold-400)", fontSize: "1.2rem", fontWeight: 700 }}>:</span>
      <div style={cellStyle}><span style={numStyle}>{pad(time.m)}</span><span style={lblStyle}>min</span></div>
      <span style={{ color: "var(--gold-400)", fontSize: "1.2rem", fontWeight: 700 }}>:</span>
      <div style={cellStyle}><span style={numStyle}>{pad(time.s)}</span><span style={lblStyle}>sec</span></div>
    </div>
  );
}

// ─── ReassuranceIcon — icônes ligne fines (or) ───────────────────────────────
function ReassuranceIcon({ name }: { name: string }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--gold-400)",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "shipping":
      return (
        <svg {...common}>
          <path d="M3 7h11v8H3z" />
          <path d="M14 10h4l3 3v2h-7z" />
          <circle cx="7" cy="18" r="1.6" />
          <circle cx="17.5" cy="18" r="1.6" />
        </svg>
      );
    case "secure":
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          <circle cx="12" cy="15.5" r="1" />
        </svg>
      );
    case "authentic":
      return (
        <svg {...common}>
          <path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L3.2 8.7l5.4-.8z" />
        </svg>
      );
    case "returns":
      return (
        <svg {...common}>
          <path d="M4 12a8 8 0 0 1 14-5.3L21 9" />
          <path d="M21 4v5h-5" />
          <path d="M20 12a8 8 0 0 1-14 5.3L3 15" />
          <path d="M3 20v-5h5" />
        </svg>
      );
    case "installments":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18" />
          <path d="M7 14h3" />
        </svg>
      );
    default:
      return null;
  }
}

// ─── WelcomeModal ─────────────────────────────────────────────────────────────

function WelcomeModal() {
  const [shown, setShown] = useState(false);
  const [email, setEmail] = useState("");
  const [lang, setLang] = useState("Français");
  const [cur, setCur] = useState("EUR");

  useEffect(() => {
    const seen = localStorage.getItem("dp_welcome_shown");
    if (!seen) {
      const t = setTimeout(() => setShown(true), 1800);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    localStorage.setItem("dp_welcome_shown", "1");
    setShown(false);
  };

  if (!shown) return null;

  return (
    <div
      suppressHydrationWarning
      onClick={close}
      style={{
        position: "fixed", inset: 0, zIndex: 400,
        background: "rgba(15,10,6,0.72)", backdropFilter: "blur(5px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        className="dp-welcome-inner"
        onClick={e => e.stopPropagation()}
        style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          maxWidth: 820, width: "100%", maxHeight: "90vh",
          borderRadius: "var(--r-lg)", overflow: "hidden auto",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
        }}
      >
        {/* Left panel — image + coffrets */}
        <div className="dp-welcome-left" style={{
          position: "relative", background: "var(--espresso-900)",
          padding: "44px 36px 40px",
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
          minHeight: 460,
        }}>
          <Image src="/assets/popup-oud-roses.jpg" alt="Oud & Roses — parfums orientaux" fill sizes="400px" style={{ objectFit: "cover", opacity: 0.85 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(21,16,11,.15) 0%, rgba(21,16,11,.45) 55%, rgba(21,16,11,.88) 100%)" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 2.5vw, 2rem)", color: "#fff", margin: "0 0 12px", lineHeight: 1.2 }}>
              Nos Coffrets Découverte
            </h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.84rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.65, marginBottom: 22 }}>
              Explorez la richesse de la parfumerie orientale avec nos coffrets échantillons. Le meilleur moyen de trouver votre signature olfactive.
            </p>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--gold-400)", marginBottom: 20 }}>
              À partir de 9€
            </div>
            <a href="#coffrets" onClick={close} style={{
              display: "inline-block", background: "var(--gold-500)", color: "#fff",
              textDecoration: "none", padding: "11px 22px", borderRadius: "var(--r-sm)",
              fontFamily: "var(--font-sans)", fontSize: "0.76rem", fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
            }}>Découvrir les coffrets</a>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", color: "rgba(255,255,255,0.5)", marginTop: 24, fontStyle: "italic" }}>
              «&nbsp;L&apos;Orient se respire,<br />il ne se raconte pas.&nbsp;»
            </p>
          </div>
        </div>

        {/* Right panel — form */}
        <div style={{ background: "var(--surface-white)", padding: "44px 36px 40px", position: "relative" }}>
          {/* Close */}
          <button onClick={close} style={{
            position: "absolute", top: 16, right: 16,
            background: "none", border: "none", cursor: "pointer",
            color: "var(--ink-400)", fontSize: "1.1rem", lineHeight: 1, padding: 4,
          }}>×</button>

          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold-500)", marginBottom: 14 }}>Offre de bienvenue</div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 2.5vw, 2rem)", color: "var(--ink-900)", margin: "0 0 14px", lineHeight: 1.15 }}>
            -10% &amp; un échantillon offert
          </h3>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.86rem", color: "var(--ink-500)", lineHeight: 1.65, marginBottom: 24 }}>
            Rejoignez Le Cercle et recevez votre code de bienvenue, plus un échantillon surprise glissé dans votre première commande.
          </p>

          <input
            type="email"
            placeholder="Votre adresse email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: "100%", padding: "13px 14px", marginBottom: 10,
              border: "1px solid #ddd", borderRadius: "var(--r-sm)",
              fontFamily: "var(--font-sans)", fontSize: "0.88rem",
              color: "var(--ink-900)", background: "#fff", outline: "none",
              boxSizing: "border-box",
            }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <select value={lang} onChange={e => setLang(e.target.value)} style={{
              padding: "11px 12px", border: "1px solid #ddd", borderRadius: "var(--r-sm)",
              fontFamily: "var(--font-sans)", fontSize: "0.84rem", color: "var(--ink-900)",
              background: "#fff", outline: "none", cursor: "pointer",
            }}>
              {["Français","English","Español","Deutsch","Italiano","Русский","العربية"].map(l => <option key={l}>{l}</option>)}
            </select>
            <select value={cur} onChange={e => setCur(e.target.value)} style={{
              padding: "11px 12px", border: "1px solid #ddd", borderRadius: "var(--r-sm)",
              fontFamily: "var(--font-sans)", fontSize: "0.84rem", color: "var(--ink-900)",
              background: "#fff", outline: "none", cursor: "pointer",
            }}>
              {["EUR","AED","SAR","USD","GBP","MAD"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <button onClick={close} style={{
            width: "100%", background: "var(--gold-500)", color: "#fff", border: "none",
            borderRadius: "var(--r-sm)", padding: "14px", cursor: "pointer",
            fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 700,
            letterSpacing: "0.04em", marginBottom: 16,
          }}>J&apos;EN PROFITE</button>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--ink-400)" }}>
              Déjà membre ?&nbsp;
              <button onClick={close} style={{ background: "none", border: "none", color: "var(--gold-600)", textDecoration: "underline", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit" }}>
                Se connecter
              </button>
            </span>
            <button onClick={close} style={{ background: "none", border: "none", color: "var(--ink-300)", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "0.78rem" }}>
              Non merci
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FAQAccordion ─────────────────────────────────────────────────────────────

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {faqItems.map((item, i) => (
        <div key={i} style={{
          border: "1px solid var(--line-200)", borderRadius: "var(--r-md)",
          overflow: "hidden", background: "var(--surface-white)",
        }}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            style={{
              width: "100%", textAlign: "left", padding: "16px 20px",
              background: "none", border: "none", cursor: "pointer",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              fontFamily: "var(--font-sans)", fontSize: "0.93rem", fontWeight: 600,
              color: "var(--ink-900)",
            }}
          >
            {item.q}
            <span style={{
              color: "var(--gold-500)", fontSize: "1.3rem",
              transform: openIndex === i ? "rotate(45deg)" : "rotate(0deg)",
              transition: "transform 0.25s ease", lineHeight: 1,
            }}>+</span>
          </button>
          {openIndex === i && (
            <div style={{ padding: "0 20px 18px", fontFamily: "var(--font-sans)", fontSize: "0.88rem", color: "var(--ink-500)", lineHeight: 1.7 }}>
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  dark = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  dark?: boolean;
}) {
  return (
    <div style={{ textAlign: "center", marginBottom: 48 }}>
      <div style={{
        fontFamily: "var(--font-sans)", fontSize: "0.78rem",
        letterSpacing: "0.22em", textTransform: "uppercase",
        color: dark ? "var(--gold-400)" : "var(--gold-700)",
        marginBottom: 12, fontWeight: 500,
      }}>{eyebrow}</div>
      <h2 style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(2.2rem, 3.8vw, 3.2rem)",
        color: dark ? "var(--on-dark-strong)" : "var(--ink-900)",
        margin: 0, lineHeight: 1.12,
      }}>{title}</h2>
      {subtitle && (
        <p style={{
          fontFamily: "var(--font-sans)", fontSize: "1.1rem",
          color: dark ? "var(--on-dark-muted)" : "var(--ink-500)",
          marginTop: 16, lineHeight: 1.7,
          maxWidth: 640, marginInline: "auto",
        }}>{subtitle}</p>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HomePageClient() {
  const locale = useLocale();
  const tTwin = useTranslations("olfactiveTwin");
  const [selectedScent, setSelectedScent] = useState<string | null>(null);
  const [hoveredScent, setHoveredScent] = useState<string | null>(null);
  const [hoveredScentCard, setHoveredScentCard] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <BackToTop />
      {/* Keyframe styles */}
      <style>{`
        @keyframes kenBurns {
          0%   { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.12) translate(-2%, -1%); }
        }
        @keyframes marqueeScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.02); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Welcome Modal ── */}
      <WelcomeModal />

      {/* ── 2. HERO ───────────────────────────────────────────────── */}
      <AnimatedHero />

      {/* Promo strip — VENTES FLASH retiré pour le moment */}

      {/* ── LES PARFUMS DE L'ÉTÉ (sous le slider) ─────────────────── */}
      <section
        id="nouveautes"
        style={{
          backgroundImage: "linear-gradient(rgba(253,251,246,.34), rgba(253,251,246,.52)), url('/assets/saison-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "80px 20px",
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <SectionHeader
            eyebrow="Dernières arrivées"
            title={<>Les parfums <em>de l&apos;été</em></>}
            subtitle="Fraîchement sourcées à Dubaï, exclusives en France."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {products.slice(0, 4).map(p => <ProductCardLuxe key={p.id} product={toLuxe(p)} locale={locale} />)}
          </div>
        </div>
      </section>

      {/* ── COFFRETS & LOTS (sous bannière) ───────────────────────── */}
      <section id="coffrets-lots" style={{ background: "var(--surface-cream)", padding: "80px 20px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <SectionHeader
            eyebrow="Coffrets & Lots"
            title={<>Plus de senteurs, <em>meilleur prix</em></>}
            subtitle="Découvrez plusieurs fragrances en un seul achat, à prix réduit."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {COFFRETS_HOME.map((p, i) => (
              <ProductCardLuxe key={i} product={p} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* ── BEST SELLERS « Premium Collections » — désactivée ─────── */}
      {false && <BestSellers />}

      {/* ── BANNIÈRE PROMO YARA (roll-on) ─────────────────────────── */}
      <section style={{ position: "relative", width: "100%", overflow: "hidden", height: "clamp(220px, 25vw, 360px)" }}>
        <Image
          src="/assets/banner-yara.jpg"
          alt="Yara & Mousuf Wardi — roll-on de voyage"
          fill
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority={false}
        />
        {/* Voile léger pour lisibilité texte (côté droit) */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(255,245,247,0) 45%, rgba(255,240,243,0.35) 100%)", pointerEvents: "none" }} />
        <div
          style={{
            position: "absolute", inset: 0, zIndex: 2,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 24, padding: "0 clamp(24px, 6vw, 96px)",
          }}
        >
          {/* Bouton (gauche) */}
          <a
            href="/promo-flash"
            className="dp-yara-cta"
            style={{
              flexShrink: 0, position: "relative", overflow: "hidden",
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "#FBF6EC", color: "#3A2418", textDecoration: "none",
              fontFamily: "var(--font-sans)", fontSize: "clamp(.78rem, 1.3vw, .95rem)",
              fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase",
              padding: "clamp(12px,1.4vw,17px) clamp(20px,2.6vw,34px)", borderRadius: 999,
              boxShadow: "0 10px 28px -10px rgba(120,40,60,.45)",
            }}
          >
            <span style={{ position: "relative", zIndex: 1 }}>Découvrir →</span>
          </a>

          {/* Texte (droite) */}
          <div style={{ textAlign: "right", maxWidth: "min(56%, 620px)" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)", margin: 0,
                fontSize: "clamp(1.6rem, 3.6vw, 3rem)", lineHeight: 1.1,
                color: "#4A2230", textShadow: "0 1px 14px rgba(255,250,250,.6)",
              }}
            >
              Vous aimez <em>Yara</em> ?<br />Emportez-le partout.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-sans)", marginTop: 12, marginBottom: 0,
                fontSize: "clamp(.85rem, 1.5vw, 1.1rem)", color: "#6B3A48",
                textShadow: "0 1px 10px rgba(255,250,250,.6)",
              }}
            >
              Yara &amp; Mousuf Wardi, en roll-on de voyage
            </p>
          </div>
        </div>
        <style>{`
          @keyframes dpYaraPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
          .dp-yara-cta{animation:dpYaraPulse 2.4s ease-in-out infinite}
          .dp-yara-cta::after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.7) 50%,transparent 70%);transform:translateX(-130%)}
          .dp-yara-cta:hover::after{transform:translateX(130%);transition:transform .7s cubic-bezier(.2,.8,.2,1)}
          .dp-yara-cta:hover{background:#fff;animation-play-state:paused}
        `}</style>
      </section>

      {/* ── TOUS NOS INCONTOURNABLES (avant Mur) ──────────────────── */}
      <section id="catalogue" style={{ background: "var(--surface-page)", padding: "80px 20px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <SectionHeader
            eyebrow="Le catalogue"
            title={<>Tous nos <em>incontournables</em></>}
            subtitle="Les parfums les plus appréciés de notre clientèle, semaine après semaine."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {bestSellers.map(p => <ProductCardLuxe key={p.id} product={toLuxe(p)} locale={locale} />)}
          </div>
        </div>
      </section>

      {/* ── LE MUR DES SENTEURS ───────────────────────────────────── */}
      <section id="senteurs" style={{ background: "var(--espresso-800)", padding: "52px 20px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ marginBottom: -16 }}>
            <SectionHeader
              dark
              eyebrow="Univers olfactifs"
              title={<>Le Mur des <em>Senteurs</em></>}
              subtitle="Explorez nos 8 univers, des oud profonds aux muscs enveloppants."
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { img: "/assets/scents/oud.png", label: "Oud", sub: "Profond · Mystérieux" },
              { img: "/assets/scents/ambre.png", label: "Ambre", sub: "Chaud · Enveloppant" },
              { img: "/assets/scents/floral.png", label: "Floral", sub: "Rose · Jasmin" },
              { img: "/assets/scents/boise.png", label: "Boisé", sub: "Cèdre · Vétiver" },
              { img: "/assets/scents/musc.png", label: "Musc", sub: "Délicat · Poudreux" },
              { img: "/assets/scents/rose.png", label: "Rose", sub: "Royal · Envoûtant" },
              { img: "/assets/scents/epice.png", label: "Épicé", sub: "Safran · Cardamome" },
              { img: "/assets/scents/mixte.png", label: "Mixte", sub: "Universel · Moderne" },
            ].map((card, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredScentCard(i)}
                onMouseLeave={() => setHoveredScentCard(null)}
                style={{
                  position: "relative", paddingBottom: "70%", overflow: "hidden",
                  borderRadius: "var(--r-lg)", cursor: "pointer",
                  border: hoveredScentCard === i ? "1.5px solid var(--gold-400)" : "1.5px solid transparent",
                  transition: "border-color 0.3s",
                }}
              >
                <Image
                  src={card.img}
                  alt={card.label}
                  fill
                  style={{
                    objectFit: "cover",
                    transform: hoveredScentCard === i ? "scale(1.06)" : "scale(1)",
                    transition: "transform 0.5s ease",
                  }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(21,16,11,0.85) 0%, transparent 55%)" }} />
                <div style={{ position: "absolute", bottom: 10, insetInline: 12 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", color: "#fff", marginBottom: 1 }}>{card.label}</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", color: "var(--on-dark-muted)", letterSpacing: "0.06em", opacity: 0.85 }}>{card.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VIDÉO PRODUITS — désactivée (doublon avec shoppable) ──── */}
      {false && (
      <section id="video-avis" style={{ background: "var(--espresso-800)", padding: "80px 20px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <SectionHeader
            dark
            eyebrow="Communauté"
            title={<>Vidéo <em>produits</em></>}
            subtitle="Ils partagent leur expérience, sans filtre."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {[
              { name: "Vanilla Voyage", desc: "Démonstration produit", src: "/assets/videos/vanilla-voyage.mp4" },
              { name: "Reef 33", desc: "Démonstration produit", src: "/assets/videos/reef33.mp4" },
              { name: "Aurum", desc: "Présentation produit", src: "/assets/videos/aurum-v4.mp4" },
              { name: "Oud & Roses", desc: "Démonstration produit", src: "/assets/videos/oud-roses.mp4" },
            ].map((v, i) => (
              <div key={i}>
                <VideoPlaceholder
                  label={`${v.name} — ${v.desc}`}
                  aspectRatio="9/16"
                  duration={v.src ? undefined : "0:45 – 1:20"}
                  src={v.src}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ── VIDÉOS SHOPPABLES ─────────────────────────────────────── */}
      <section id="shoppable" style={{ background: "var(--surface-page)", padding: "80px 20px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <SectionHeader
            eyebrow="Shopping vidéo"
            title={<>Vu en <em>vidéo</em>, ajouté au panier</>}
            subtitle="Découvrez nos parfums en mouvement et commandez en un clic."
          />
          <ShoppableVideoCarousel videos={SHOPPABLE_VIDEOS} locale={locale} />
        </div>
      </section>

      {/* ── JUMEAU OLFACTIF ───────────────────────────────────────── */}
      <section id="jumeau-olfactif" style={{ background: "var(--surface-page)", padding: "80px 20px" }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <SectionHeader
            eyebrow={tTwin("eyebrow")}
            title={tTwin("title")}
            subtitle={tTwin("subtitle")}
          />
          <OlfactiveTwin matches={OLFACTIVE_TWINS} locale={locale} />
        </div>
      </section>

      {/* ── TRUST MARQUEE — bande déroulante désactivée ───────────── */}
      {false && (
      <section style={{ background: "var(--espresso-900)", padding: "11px 0", overflow: "hidden", borderBottom: "1px solid rgba(200,144,30,0.15)" }}>
        <div style={{ display: "flex", width: "max-content", animation: "marqueeScroll 30s linear infinite" }}>
          {[0, 1].map(rep => (
            <div key={rep} style={{ display: "flex" }}>
              {TRUST_ITEMS.map((item, i) => (
                <span key={i} style={{
                  display: "inline-flex", alignItems: "center", gap: 9,
                  fontFamily: "var(--font-sans)", fontSize: "0.78rem",
                  color: "var(--on-dark)", whiteSpace: "nowrap",
                  padding: "0 28px", borderRight: "1px solid rgba(200,144,30,0.12)",
                }}>
                  <span style={{ color: "var(--gold-400)", display: "inline-flex" }} aria-hidden>{item.icon}</span>
                  {item.label}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>
      )}

      {/* ── HUILES DE PARFUM (sous Jumeau) ────────────────────────── */}
      <section id="huiles" style={{ background: "var(--surface-cream)", padding: "80px 20px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold-700)", marginBottom: 12 }}>Exclusif</div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.5vw, 2.8rem)", color: "var(--ink-900)", margin: "0 0 18px", lineHeight: 1.1 }}>
                Huiles de parfum<br /><em>concentrées</em>
              </h2>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.92rem", color: "var(--ink-500)", lineHeight: 1.78, marginBottom: 24 }}>
                Les huiles de parfum orientales sont la quintessence de la tradition olfactive arabe. Sans alcool, ultra-concentrées, elles tiennent 12 à 24 heures et créent une signature olfactive unique à chaque individu.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                {["Sans alcool — idéal peaux sensibles", "Concentration supérieure à 30%", "Longévité 12–24h", "Voyage autorisé en cabine"].map(item => (
                  <li key={item} style={{ fontFamily: "var(--font-sans)", fontSize: "0.86rem", color: "var(--ink-700)", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "var(--gold-500)", fontSize: "1rem", flexShrink: 0 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
              <a href="#" style={{
                display: "inline-block", background: "var(--ink-900)", color: "var(--on-dark-strong)",
                textDecoration: "none", padding: "13px 28px", borderRadius: "var(--r-pill)",
                fontFamily: "var(--font-sans)", fontSize: "0.86rem", fontWeight: 600,
              }}>Découvrir les huiles →</a>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {oilItems.map(p => <ProductCardLuxe key={p.id} product={toLuxe(p)} locale={locale} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. AUTHENTICITÉ ───────────────────────────────────────── */}
      <section id="authenticite" style={{ background: "var(--surface-cream)", padding: "80px 20px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <RevealOnScroll>
          <SectionHeader
            eyebrow="Notre promesse"
            title={<>100% Authentique,<br /><em>ou remboursé</em></>}
            subtitle="Chaque flacon est sourcé directement auprès des distributeurs officiels aux Émirats."
          />
          </RevealOnScroll>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
            {[
              { n: "01", title: "Sourcing direct Dubaï", desc: "Nous nous approvisionnons exclusivement auprès des distilleries et distributeurs agréés aux EAU, garantissant l'authenticité de chaque flacon." },
              { n: "02", title: "Certificats d'authenticité", desc: "Chaque commande est accompagnée d'un certificat numéroté. Code QR vérifiable directement sur le site officiel de la marque." },
              { n: "03", title: "Garantie satisfaction", desc: "Pas convaincu ? Nous vous remboursons intégralement sous 30 jours, sans question. Votre confiance est notre priorité absolue." },
            ].map(card => (
              <div key={card.n} style={{
                background: "var(--surface-white)", borderRadius: "var(--r-lg)",
                padding: "36px 28px", border: "1px solid var(--line-200)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "4rem", color: "var(--gold-100)", position: "absolute", top: 10, right: 18, lineHeight: 1, userSelect: "none" }}>{card.n}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", color: "var(--ink-900)", marginBottom: 14, position: "relative" }}>{card.title}</div>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", color: "var(--ink-500)", lineHeight: 1.72, margin: 0 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. VENTES FLASH — retirée pour le moment ──────────────── */}

      {/* ── 9. TROUVEZ VOTRE PARFUM ───────────────────────────────── */}
      <section id="guide" style={{ background: "var(--surface-page)", padding: "80px 20px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <SectionHeader
            eyebrow="Notre expertise"
            title="Trouvez votre parfum idéal"
            subtitle="5 questions pour révéler votre signature olfactive et recevoir des recommandations sur mesure."
          />
          <QuizSignature />
        </div>
      </section>

      {/* ── 10. ROUE DES SENTEURS — retirée ───────────────────────── */}
      {false && (
      <section id="roue" style={{ background: "#1a1208", padding: "80px 20px" }}>
        <div className="dp-roue-grid" style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          {/* Left: title + result */}
          <div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "11px", letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold-500)", marginBottom: 20 }}>Recherche par notes</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(2.8rem,4vw,4rem)", color: "var(--on-dark-strong)", lineHeight: 1.05, margin: "0 0 32px" }}>La Roue des <em>Senteurs</em></h2>
            {selectedScent ? (
              <div style={{ animation: "fadeSlideIn .3s ease" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--gold-400)", marginBottom: 10 }}>{selectedScent}</div>
                <div style={{ fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: ".9375rem", color: "var(--on-dark-muted)", lineHeight: 1.7, marginBottom: 20 }}>
                  Découvrez tous les parfums à dominante <strong style={{ color: "var(--on-dark)" }}>{selectedScent}</strong> de notre catalogue — des créations orientales rares sourcées directement au Golfe.
                </div>
                <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--gold-400)", textDecoration: "none" }}>
                  Voir les parfums {selectedScent} →
                </a>
              </div>
            ) : (
              <p style={{ fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: "1rem", color: "var(--on-dark-muted)", lineHeight: 1.8, margin: 0 }}>
                Cliquez sur une note olfactive pour explorer les parfums qui la composent. De l&apos;oud mystérieux au musc délicat, chaque cercle ouvre un univers.
              </p>
            )}
          </div>

          {/* Right: SVG wheel */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            {(() => {
              const CX = 250, CY = 250, R = 170, RC = 68, RN = 54;
              const nodes = [
                { label: "Oud",     a: 0   },
                { label: "Ambre",   a: 45  },
                { label: "Musc",    a: 90  },
                { label: "Rose",    a: 135 },
                { label: "Santal",  a: 180 },
                { label: "Safran",  a: 225 },
                { label: "Vanille", a: 270 },
                { label: "Encens",  a: 315 },
              ];
              const toRad = (deg: number) => (deg * Math.PI) / 180;
              const pos = (a: number) => ({
                x: CX + R * Math.sin(toRad(a)),
                y: CY - R * Math.cos(toRad(a)),
              });
              return (
                <svg viewBox="0 0 500 500" width="100%" style={{ maxWidth: 480, overflow: "visible" }}>
                  {/* Dashed lines center → nodes */}
                  {nodes.map(n => {
                    const p = pos(n.a);
                    const dx = p.x - CX, dy = p.y - CY;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    const ux = dx/dist, uy = dy/dist;
                    return (
                      <line
                        key={n.label}
                        x1={CX + ux * RC} y1={CY + uy * RC}
                        x2={p.x - ux * RN} y2={p.y - uy * RN}
                        stroke="rgba(200,144,30,0.3)"
                        strokeWidth="1.2"
                        strokeDasharray="5 4"
                      />
                    );
                  })}
                  {/* Center circle */}
                  <circle cx={CX} cy={CY} r={RC} fill="#15100b" stroke="#C8901E" strokeWidth="1.5" strokeDasharray="6 4" />
                  <text x={CX} y={CY - 8} textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="17" fill={selectedScent ? "#D8A63A" : "#e8dfc8"} fontStyle="italic">
                    {selectedScent || "La Roue"}
                  </text>
                  <text x={CX} y={CY + 12} textAnchor="middle" fontFamily="Jost, sans-serif" fontSize="8.5" fill="rgba(220,200,160,.55)" letterSpacing="2">
                    {selectedScent ? "SÉLECTIONNÉ" : "CLIQUEZ UNE NOTE"}
                  </text>
                  {/* Outer nodes */}
                  {nodes.map(n => {
                    const p = pos(n.a);
                    const active = selectedScent === n.label;
                    const hovered = hoveredScent === n.label;
                    return (
                      <g
                        key={n.label}
                        onClick={() => setSelectedScent(selectedScent === n.label ? null : n.label)}
                        onMouseEnter={() => setHoveredScent(n.label)}
                        onMouseLeave={() => setHoveredScent(null)}
                        style={{ cursor: "pointer" }}
                      >
                        <circle
                          cx={p.x} cy={p.y} r={RN}
                          fill={active ? "rgba(200,144,30,0.22)" : hovered ? "rgba(200,144,30,0.12)" : "rgba(90,72,48,0.55)"}
                          stroke={active ? "#C8901E" : hovered ? "rgba(200,144,30,0.5)" : "rgba(120,96,60,0.35)"}
                          strokeWidth="1.2"
                          style={{ transition: "fill .2s, stroke .2s" }}
                        />
                        <text x={p.x} y={p.y + 6} textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="15" fill={active ? "#D8A63A" : "#e8dfc8"} style={{ pointerEvents: "none", transition: "fill .2s" }}>
                          {n.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              );
            })()}
          </div>
        </div>

        {/* Suggestions: 3 parfums de la senteur sélectionnée (miniatures) */}
        {selectedScent && scentProducts[selectedScent] && (
          <div style={{ maxWidth: 1240, margin: "32px auto 0", animation: "fadeSlideIn .35s ease" }}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "10px", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold-500)", marginBottom: 12, textAlign: "center" }}>
              3 parfums {selectedScent} à découvrir
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {scentProducts[selectedScent].map(p => (
                <a key={p.name} href={`/produit/${p.name.trim().toLowerCase().replace(/\s+/g, "-")}`} style={{
                  textDecoration: "none", display: "flex", alignItems: "center", gap: 12,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(200,144,30,0.18)",
                  borderRadius: "var(--r-md)", padding: 8, transition: "border-color .25s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gold-400)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,144,30,0.18)"; }}
                >
                  <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0, borderRadius: "var(--r-sm)", overflow: "hidden" }}>
                    <Image src={p.img} alt={p.name} fill sizes="52px" style={{ objectFit: "cover" }} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.6rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--gold-500)", marginBottom: 2 }}>{p.brand}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", color: "var(--on-dark-strong)", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name.trim()}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 600, color: "var(--gold-400)" }}>{p.price.toFixed(2).replace(".", ",")} €</span>
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "var(--on-dark-muted)", textDecoration: "line-through" }}>{p.oldPrice.toFixed(2).replace(".", ",")} €</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </section>
      )}

      {/* ── 11. FAMILLES OLFACTIVES — retirée ─────────────────────── */}

      {/* ── 12. CATÉGORIES ────────────────────────────────────────── */}
      <section id="categories" style={{ background: "var(--surface-cream)", padding: "80px 20px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <SectionHeader eyebrow="Nos univers" title="Pour elle, pour lui, pour tous" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {[
              { img: "/assets/cat-femme.jpg", label: "Pour Elle", count: "320 parfums" },
              { img: "/assets/cat-homme.jpg", label: "Pour Lui", count: "280 parfums" },
              { img: "/assets/cat-mixte.jpg", label: "Mixte", count: "420 parfums" },
              { img: "/assets/coffrets.jpg", label: "Coffrets", count: "85 coffrets" },
            ].map(cat => (
              <a key={cat.label} href="#" style={{
                textDecoration: "none", display: "block",
                position: "relative", paddingBottom: "125%",
                borderRadius: "var(--r-lg)", overflow: "hidden",
              }}>
                <Image src={cat.img} alt={cat.label} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(21,16,11,0.8) 0%, transparent 55%)" }} />
                <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "#fff", marginBottom: 4 }}>{cat.label}</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--on-dark-muted)" }}>{cat.count}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── 13. HOT ON SOCIAL ─────────────────────────────────────── */}
      <section id="social" style={{ background: "var(--espresso-900)", padding: "80px 20px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <SectionHeader
            dark
            eyebrow="@dubaiparfumerie"
            title={<>Tendances <em>du moment</em></>}
            subtitle="Ce que notre communauté s'arrache cette semaine sur TikTok & Instagram."
          />
          <div
            ref={scrollRef}
            style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}
          >
            {products.map((p, i) => (
              <div key={p.id} style={{
                minWidth: 210, flexShrink: 0,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(200,144,30,0.15)",
                borderRadius: "var(--r-lg)", overflow: "hidden", cursor: "pointer",
              }}>
                <div style={{ position: "relative", paddingBottom: "100%" }}>
                  <Image src={p.image} alt={p.name} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: "cover" }} />
                  <div style={{
                    position: "absolute", top: 10, right: 10,
                    background: "rgba(21,16,11,0.8)", color: "var(--gold-300)",
                    fontSize: "0.68rem", padding: "3px 8px", borderRadius: "var(--r-sm)",
                    fontFamily: "var(--font-sans)",
                  }}>#{i + 1} Tendance</div>
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", color: "var(--on-dark-strong)", marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--on-dark-muted)", marginBottom: 8 }}>{p.brand}</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--gold-400)", fontWeight: 700 }}>{p.price.toFixed(2)} €</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 15. FOCUS MARQUE ──────────────────────────────────────── */}
      <section id="marque" style={{ background: "var(--espresso-900)", padding: "80px 20px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            <VideoPlaceholder
              label="Brand story Lattafa — vidéo institutionnelle"
              aspectRatio="4/3"
              duration="2:30"
            />
            <div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold-400)", marginBottom: 12 }}>Sharjah, fondée en 1980</div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.5vw, 2.8rem)", color: "var(--on-dark-strong)", margin: "0 0 18px", lineHeight: 1.1 }}>Lattafa Perfumes</h2>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--on-dark)", lineHeight: 1.8, marginBottom: 18 }}>
                Fondée en 1980 à Sharjah, Lattafa est aujourd'hui l'une des maisons de parfumerie orientale les plus influentes au monde. Avec plus de 80 références, la maison allie tradition et modernité pour offrir des fragrances d'exception à des prix accessibles.
              </p>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", color: "var(--on-dark-muted)", lineHeight: 1.8, marginBottom: 28 }}>
                Leur secret ? Des matières premières sélectionnées par des maîtres parfumeurs, des huiles d'oud d'Assam et des roses de Taïf cultivées en altitude. Un savoir-faire transmis de génération en génération.
              </p>
              <div style={{ display: "flex", gap: 32, marginBottom: 28 }}>
                {[{ n: "80+", l: "Références" }, { n: "45", l: "Ans d'existence" }, { n: "4.8/5", l: "Note moyenne" }].map(s => (
                  <div key={s.l}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "var(--gold-300)", fontWeight: 600 }}>{s.n}</div>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "var(--on-dark-muted)", letterSpacing: "0.08em" }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <a href="#" style={{
                display: "inline-block", background: "var(--gold-500)", color: "#fff",
                textDecoration: "none", padding: "13px 28px", borderRadius: "var(--r-pill)",
                fontFamily: "var(--font-sans)", fontSize: "0.86rem", fontWeight: 600,
              }}>Explorer Lattafa →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 16. TOP MAISONS ───────────────────────────────────────── */}
      <section id="maisons" style={{ background: "var(--surface-page)", padding: "80px 20px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <SectionHeader
            eyebrow="Nos marques"
            title="Les grandes maisons orientales"
            subtitle="Parmi les plus belles maisons de parfumerie orientale et du Golfe. Des flacons 100 % authentiques, sans contrefaçon et au juste prix, donc sans compromis."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
            {brands.map((b) => (
              <BrandCard key={b.name} brand={{ ...b, href: "#" }} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 17. COFFRETS ──────────────────────────────────────────── */}
      <section id="coffrets" style={{ background: "linear-gradient(135deg, var(--espresso-900) 0%, var(--espresso-600) 100%)", padding: "80px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.22 }}>
          <Image src="/assets/coffrets.jpg" alt="Coffrets découverte" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: "cover" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(21,16,11,0.92) 50%, rgba(21,16,11,0.5) 100%)" }} />
        <div style={{ maxWidth: 1240, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ maxWidth: 540 }}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold-400)", marginBottom: 12 }}>L'art du cadeau oriental</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--on-dark-strong)", margin: "0 0 18px", lineHeight: 1.1 }}>
              Coffrets Découverte<br /><em style={{ color: "var(--gold-400)" }}>dès 49 €</em>
            </h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.93rem", color: "var(--on-dark)", lineHeight: 1.78, marginBottom: 28 }}>
              Offrez l'Orient en un écrin. Nos coffrets comprennent 3 à 12 miniatures sélectionnées par nos experts, avec guide olfactif et certificat d'authenticité. Idéal pour s'initier ou faire découvrir la parfumerie orientale.
            </p>
            <div style={{ display: "flex", gap: 14 }}>
              <a href="#" style={{ background: "var(--gold-500)", color: "#fff", textDecoration: "none", padding: "13px 28px", borderRadius: "var(--r-pill)", fontFamily: "var(--font-sans)", fontSize: "0.86rem", fontWeight: 700 }}>Voir les coffrets</a>
              <a href="#" style={{ border: "1.5px solid rgba(255,255,255,0.4)", color: "var(--on-dark-strong)", textDecoration: "none", padding: "13px 28px", borderRadius: "var(--r-pill)", fontFamily: "var(--font-sans)", fontSize: "0.86rem" }}>Personnaliser</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 18. PREUVES & TÉMOIGNAGES ─────────────────────────────── */}
      <section id="avis" style={{ background: "var(--surface-cream)", padding: "80px 20px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <SectionHeader
            eyebrow="Ils nous font confiance"
            title="8 400 clients satisfaits"
            subtitle="Authentiques, vérifiés, non modifiés."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 48 }}>
            {[
              { n: "4.9/5", l: "Note globale", sub: "Sur 8 400 avis" },
              { n: "98%", l: "Recommandent", sub: "à leur entourage" },
              { n: "24h", l: "Réponse SAV", sub: "Garanti" },
              { n: "96%", l: "Livré à temps", sub: "Ou remboursé" },
            ].map(s => (
              <div key={s.l} style={{ background: "var(--surface-white)", border: "1px solid var(--line-200)", borderRadius: "var(--r-lg)", padding: "24px 18px", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", color: "var(--gold-700)", fontWeight: 600, marginBottom: 4 }}>{s.n}</div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", fontWeight: 600, color: "var(--ink-900)", marginBottom: 2 }}>{s.l}</div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.76rem", color: "var(--ink-400)" }}>{s.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ background: "var(--surface-white)", border: "1px solid var(--line-200)", borderRadius: "var(--r-lg)", padding: "28px 24px" }}>
                <div style={{ color: "var(--star)", fontSize: "1rem", marginBottom: 14, letterSpacing: "0.05em" }}>{"★".repeat(t.stars)}</div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", color: "var(--ink-700)", lineHeight: 1.65, margin: "0 0 18px", fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--gold-100)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--gold-700)", flexShrink: 0 }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.84rem", fontWeight: 600, color: "var(--ink-900)" }}>{t.name}</div>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.74rem", color: "var(--ink-400)" }}>{t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 20. GARANTIE PRIX — désactivée ────────────────────────── */}
      {false && (
      <section id="garantie" style={{ background: "var(--espresso-900)", padding: "60px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", border: "1.5px solid var(--gold-500)", borderRadius: "var(--r-lg)", padding: "48px 40px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <svg width="46" height="46" viewBox="0 0 48 48" fill="none" stroke="var(--gold-400)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="24" cy="20" r="11" />
              <path d="M24 14.5l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z" fill="var(--gold-500)" stroke="var(--gold-500)" strokeWidth="0.6" />
              <path d="M18 30l-3 12 9-5 9 5-3-12" />
            </svg>
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold-400)", marginBottom: 12 }}>Engagement</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "var(--on-dark-strong)", margin: "0 0 16px" }}>Garantie Meilleur Prix</h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.93rem", color: "var(--on-dark-muted)", lineHeight: 1.78, maxWidth: 560, margin: "0 auto 28px" }}>
            Vous trouvez le même parfum authentique moins cher ailleurs en France ? Nous vous remboursons la différence, plus <strong style={{ color: "var(--gold-400)" }}>5% supplémentaires</strong>. Sans condition, sans délai.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {["✓ Authenticité garantie", "✓ Prix le plus bas", "✓ Remboursement sous 48h"].map(item => (
              <span key={item} style={{ fontFamily: "var(--font-sans)", fontSize: "0.84rem", color: "var(--gold-300)", fontWeight: 600 }}>{item}</span>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ── 21. LE JOURNAL (JournalSection bento) ─────────────────── */}
      <JournalSection articles={JOURNAL_ARTICLES} locale={locale} />

      {/* ── 22. ENCYCLOPÉDIE ──────────────────────────────────────── */}
      <section id="encyclopedie" style={{ background: "var(--surface-cream)", padding: "80px 20px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <SectionHeader
            eyebrow="Encyclopédie"
            title="Comprendre la parfumerie orientale"
            subtitle="Les grandes matières premières qui font l'âme des fragrances du Golfe."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {editorialBlocks.map(b => (
              <div key={b.name} style={{ background: "var(--surface-white)", border: "1px solid var(--line-200)", borderRadius: "var(--r-lg)", padding: "28px 22px" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--gold-500)", marginBottom: 10 }}>{b.symbol}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.22rem", color: "var(--ink-900)", margin: "0 0 12px" }}>{b.name}</h3>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.84rem", color: "var(--ink-500)", lineHeight: 1.72, margin: 0 }}>{b.desc}</p>
                <a href="#" style={{ display: "inline-block", marginTop: 16, fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--gold-700)", fontWeight: 600, textDecoration: "none" }}>En savoir plus →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 23. RÉASSURANCE 5 PILIERS ─────────────────────────────── */}
      <section id="reassurance" style={{ background: "linear-gradient(180deg, var(--espresso-900), #120d08)", padding: "60px 20px", borderTop: "1px solid rgba(200,144,30,0.18)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, textAlign: "center" }}>
            {[
              { icon: "shipping", title: "Livraison offerte", sub: "Dès 60 € d'achat" },
              { icon: "secure", title: "Paiement sécurisé", sub: "SSL · 3D Secure" },
              { icon: "authentic", title: "100% Authentique", sub: "Certifié origines" },
              { icon: "returns", title: "Retours 14 jours", sub: "Sans question" },
              { icon: "installments", title: "Paiement 4×", sub: "Sans frais dès 60 €" },
            ].map((p) => (
              <div key={p.title} className="dp-pillar" style={{
                padding: "26px 14px 22px", borderRadius: 16,
                border: "1px solid rgba(200,144,30,0.10)",
                background: "rgba(255,255,255,0.018)",
                transition: "transform .3s ease, border-color .3s ease, background .3s ease",
              }}>
                <div className="dp-pillar-ic" style={{
                  width: 60, height: 60, margin: "0 auto 16px", borderRadius: "50%",
                  border: "1px solid rgba(200,144,30,0.45)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "radial-gradient(circle at 50% 35%, rgba(200,144,30,0.16), transparent 70%)",
                  transition: "border-color .3s ease, box-shadow .3s ease",
                }}>
                  <ReassuranceIcon name={p.icon} />
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 600, color: "var(--on-dark-strong)", marginBottom: 5, letterSpacing: "0.01em" }}>{p.title}</div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--on-dark-muted)" }}>{p.sub}</div>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          .dp-pillar:hover { transform: translateY(-5px); border-color: rgba(200,144,30,0.35) !important; background: rgba(200,144,30,0.05) !important; }
          .dp-pillar:hover .dp-pillar-ic { border-color: rgba(200,144,30,0.9) !important; box-shadow: 0 0 0 4px rgba(200,144,30,0.08), 0 8px 22px -8px rgba(200,144,30,0.5); }
        `}</style>
      </section>

      {/* ── 24. NEWSLETTER ────────────────────────────────────────── */}
      <section id="newsletter" style={{ background: "var(--surface-cream-2)", padding: "80px 20px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold-700)", marginBottom: 12 }}>Accès privilégié</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)", color: "var(--ink-900)", margin: "0 0 14px" }}>Rejoindre Le Cercle</h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--ink-500)", lineHeight: 1.75, marginBottom: 28 }}>
            Ventes privées 48h avant tout le monde · Nouveautés en exclusivité · Conseils de nos experts · Offres personnalisées. <strong>Dès votre inscription, -10% sur votre première commande.</strong>
          </p>
          <div style={{ display: "flex", gap: 10, maxWidth: 460, margin: "0 auto 14px" }}>
            <input
              type="email"
              placeholder="votre@email.fr"
              style={{
                flex: 1, padding: "13px 16px", border: "1.5px solid var(--line-300)",
                borderRadius: "var(--r-sm)", fontFamily: "var(--font-sans)", fontSize: "0.88rem",
                color: "var(--ink-900)", background: "var(--surface-white)", outline: "none",
              }}
            />
            <button style={{
              background: "var(--gold-500)", color: "#fff", border: "none",
              borderRadius: "var(--r-sm)", padding: "13px 22px",
              fontFamily: "var(--font-sans)", fontSize: "0.84rem", fontWeight: 700, cursor: "pointer",
              whiteSpace: "nowrap",
            }}>Rejoindre →</button>
          </div>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "var(--ink-400)", margin: 0 }}>
            En vous inscrivant, vous acceptez de recevoir nos emails. Désabonnement possible à tout moment.
          </p>
        </div>
      </section>

      {/* ── 25. FAQ ───────────────────────────────────────────────── */}
      <section id="faq" style={{ background: "var(--surface-page)", padding: "80px 20px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <SectionHeader eyebrow="Questions fréquentes" title="Tout savoir avant de commander" />
          <FAQAccordion />
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", color: "var(--ink-500)", marginBottom: 14 }}>Une autre question ?</p>
            <a href="mailto:contact@dubai-parfumerie.fr" style={{
              display: "inline-block", background: "var(--ink-900)", color: "var(--on-dark-strong)",
              textDecoration: "none", padding: "12px 28px", borderRadius: "var(--r-pill)",
              fontFamily: "var(--font-sans)", fontSize: "0.84rem", fontWeight: 600,
            }}>Contacter le service client</a>
          </div>
        </div>
      </section>

      {/* ── 26. SEO TEXT ──────────────────────────────────────────── */}
      <section id="seo" style={{ background: "var(--surface-cream-2)", padding: "56px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.45rem", color: "var(--ink-900)", marginBottom: 16 }}>Parfumerie orientale authentique livrée en France</h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.86rem", color: "var(--ink-500)", lineHeight: 1.82, marginBottom: 14 }}>
            Dubai Parfumerie est la référence française pour l'achat de parfums orientaux authentiques en ligne. Nous importons directement des grandes maisons des Émirats Arabes Unis, du Bahreïn et du Moyen-Orient : <strong>Lattafa, Al Haramain, Swiss Arabian, Armaf, Reef, Ahmed Al Maghribi</strong> et bien d'autres. Chaque flacon est accompagné de son certificat d'authenticité.
          </p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.86rem", color: "var(--ink-500)", lineHeight: 1.82, marginBottom: 14 }}>
            Notre catalogue de plus de 1 200 références couvre toutes les familles olfactives orientales : <strong>oud boisé et fumé</strong>, <strong>musc blanc et noir</strong>, <strong>ambre et vanille</strong>, <strong>rose de Taïf</strong>, <strong>encens et bakhour</strong>. Que vous recherchiez un parfum pour femme, pour homme ou une fragrance mixte, notre équipe d'experts vous guide vers votre signature olfactive idéale.
          </p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.86rem", color: "var(--ink-500)", lineHeight: 1.82 }}>
            Livraison offerte dès 60 € d'achat, expédition sous 24h depuis notre entrepôt en France, paiement sécurisé en 4× sans frais. Retours acceptés 14 jours après réception pour tout article non ouvert. Dubai Parfumerie, votre ambassadeur de la parfumerie du Golfe depuis 2018.
          </p>
        </div>
      </section>

      {/* Footer doublon retiré — le footer global <Footer/> (layout) fait foi */}
    </>
  );
}
