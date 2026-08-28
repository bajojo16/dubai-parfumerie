"use client";

/**
 * L'écran de fin — portage du bloc `#qResult` de l'archive AD Parfumerie.
 *
 * Il tient en cinq gestes :
 *  1. la famille olfactive gagnante et sa description ;
 *  2. les critères retenus, chaque pastille rejouant SA question sur place —
 *     le résultat reste affiché, on ne recommence pas le parcours ;
 *  3. trois cartes numérotées, cochées par défaut, décochables ;
 *  4. les combinaisons (chaque paire, puis le lot complet) avec leur remise,
 *     plus la jauge : 2 parfums −10 %, 3 et plus −20 % ;
 *  5. l'ajout au panier, avec le vol du flacon vers l'icône du header.
 *
 * Le formulaire « recevoir par e-mail » de l'archive n'est PAS porté : le README
 * dit lui-même qu'il n'envoie rien.
 *
 * Styles : bloc `CSS` de `FragranceFinderModal.tsx`.
 */
import { useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { addItem } from "@/lib/cart";
import { QUESTIONS, STEP } from "./data/questions";
import { QuestionScreen } from "./QuestionScreen";
import type { ScoredProduct } from "./lib/recommend";
import { combinations, discountRate, familyName, familyText } from "./lib/recommend";
import type { FamilyKey, QuizAnswers } from "./types";

/**
 * Le flacon qui vole jusqu'au panier — Web Animations API, comme dans
 * l'archive. Coupé sous `prefers-reduced-motion`.
 *
 * La cible est le bouton panier du header, repéré par son `title` : c'est le
 * seul crochet stable qu'il offre, et Header.tsx n'est pas à modifier.
 */
function flyToCart(from: HTMLElement | null) {
  if (!from || typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const target = document.querySelector<HTMLElement>('[title="Mon panier"]');
  if (!target) return;

  const start = from.getBoundingClientRect();
  const end = target.getBoundingClientRect();
  if (!start.width || !end.width) return;

  // On préfère l'image au conteneur : un <video> cloné ne rejoue pas.
  const source = from.querySelector("img") || from;
  const flying = source.cloneNode(true) as HTMLElement;
  flying.className = "dp-ff-fly";
  flying.removeAttribute("loading");
  Object.assign(flying.style, {
    position: "fixed",
    left: `${start.left}px`,
    top: `${start.top}px`,
    width: `${start.width}px`,
    height: `${start.height}px`,
    objectFit: "cover",
  });
  document.body.appendChild(flying);

  const dx = end.left + end.width / 2 - (start.left + start.width / 2);
  const dy = end.top + end.height / 2 - (start.top + start.height / 2);

  // La courbe monte avant de redescendre : un trajet en cloche se suit des yeux,
  // une ligne droite passe inaperçue.
  const animation = flying.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.55}px, ${dy * 0.28 - 60}px) scale(.62)`, opacity: 0.95, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(.12)`, opacity: 0.2 },
    ],
    { duration: 760, easing: "cubic-bezier(.4,.05,.35,1)" },
  );
  animation.onfinish = () => flying.remove();
}

export function ResultScreen({
  trio,
  family,
  answers,
  money,
  onReplay,
  onRestart,
  onToast,
  onClose,
}: {
  trio: ScoredProduct[];
  family: FamilyKey;
  answers: QuizAnswers;
  money: Intl.NumberFormat;
  /** rejoue une question sans quitter l'écran ; `null` = « peu importe » */
  onReplay: (step: number, optionIndex: number | null) => void;
  onRestart: () => void;
  onToast: (message: string) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<boolean[]>(() => trio.map(() => true));
  const [quantities, setQuantities] = useState<number[]>(() => trio.map(() => 1));
  const [added, setAdded] = useState<boolean[]>(() => trio.map(() => false));
  const [openCriterion, setOpenCriterion] = useState<number | null>(null);
  const visualRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Le trio change quand un critère est rejoué : la sélection et les quantités
  // repartent de zéro. Calculé PENDANT le rendu (état dérivé d'une prop) plutôt
  // que dans un effet — un effet aurait laissé clignoter l'ancienne sélection
  // sur les nouvelles cartes, et la règle `react-hooks/set-state-in-effect` du
  // repo interdit de toute façon un setState synchrone dans un useEffect.
  const trioKey = trio.map((r) => r.product.id).join("|");
  const [lastTrio, setLastTrio] = useState(trioKey);
  if (lastTrio !== trioKey) {
    setLastTrio(trioKey);
    setPicked(trio.map(() => true));
    setQuantities(trio.map(() => 1));
    setAdded(trio.map(() => false));
  }

  // ── Totaux ────────────────────────────────────────────────────────────────
  const units = trio.reduce((n, _, i) => (picked[i] ? n + quantities[i] : n), 0);
  const gross = trio.reduce((s, r, i) => (picked[i] ? s + (r.product.price || 0) * quantities[i] : s), 0);
  const rate = discountRate(units);
  const net = gross * (1 - rate);

  const budgetAnswer = answers[STEP.budget];
  const budgetOption = budgetAnswer == null ? undefined : QUESTIONS[STEP.budget].options[budgetAnswer];
  const budgetMin = budgetOption?.min ?? 0;
  const budgetMax = budgetOption?.max ?? Number.POSITIVE_INFINITY;
  // Le budget se juge sur ce qui sera réellement payé, remise déduite.
  const inBudget = net >= budgetMin && net <= budgetMax;

  const pickedKey = trio.map((_, i) => (picked[i] ? i : -1)).filter((i) => i >= 0).join(",");

  // ── Gestes ────────────────────────────────────────────────────────────────
  function togglePick(i: number) {
    setPicked((p) => p.map((v, k) => (k === i ? !v : v)));
  }

  function setQty(i: number, next: number) {
    setQuantities((q) => q.map((v, k) => (k === i ? Math.min(9, Math.max(1, next)) : v)));
  }

  /** Une ligne de combinaison COMPOSE la sélection ; elle ne met rien au panier.
      Cliquer un prix pour découvrir qu'on vient d'acheter serait un piège. */
  function applyCombination(indexes: number[]) {
    setPicked(trio.map((_, i) => indexes.includes(i)));
  }

  function addOne(i: number) {
    const p = trio[i].product;
    addItem({ id: p.id, name: p.name, brand: p.brand, price: p.price || 0, image: p.image || "" }, quantities[i]);
    flyToCart(visualRefs.current[i]);
    setAdded((a) => a.map((v, k) => (k === i ? true : v)));
  }

  function addSelection() {
    if (!units) return;
    trio.forEach((r, i) => {
      if (!picked[i]) return;
      const p = r.product;
      addItem({ id: p.id, name: p.name, brand: p.brand, price: p.price || 0, image: p.image || "" }, quantities[i]);
      flyToCart(visualRefs.current[i]);
    });
    setAdded((a) => a.map((v, i) => v || picked[i]));
    onToast(
      rate
        ? `${units} flacon${units > 1 ? "s" : ""} au panier — remise de ${Math.round(rate * 100)} %`
        : `${units} flacon au panier`,
    );
  }

  // ── Récapitulatif des critères ────────────────────────────────────────────
  const criteria = QUESTIONS.map((question, step) => {
    const answer = answers[step];
    return {
      step,
      question,
      label: question.criterion,
      value: answer == null ? "Peu importe" : question.options[answer].label,
    };
  });

  return (
    <div className="dp-ff-result">
      {/* <div> et non <section> : globals.css force un padding latéral sur
          tout <section> sous 760 px, qui déformerait les colonnes ici. */}
      <div className="dp-ff-result-side">
        <span className="dp-ff-eyebrow">Votre famille olfactive</span>
        <p className="dp-ff-fam">{familyName(family)}</p>
        <p className="dp-ff-desc">{familyText(family)}</p>

        <div className="dp-ff-crit">
          <h3 className="dp-ff-crit-title">Vos critères</h3>
          <ul>
            {criteria.map(({ step, question, label, value }) => (
              <li key={question.id}>
                <button
                  type="button"
                  onClick={() => setOpenCriterion((c) => (c === step ? null : step))}
                  aria-expanded={openCriterion === step}
                >
                  <span>{label}</span>
                  <b>{value}</b>
                  <i aria-hidden="true">modifier</i>
                </button>
                {openCriterion === step && (
                  <div className="dp-ff-inline">
                    <p className="dp-ff-inline-q">{question.title}</p>
                    <QuestionScreen
                      question={question}
                      selected={answers[step]}
                      compact
                      onSelect={(optionIndex) => {
                        onReplay(step, optionIndex);
                        setOpenCriterion(null);
                      }}
                      onSkip={() => {
                        onReplay(step, null);
                        setOpenCriterion(null);
                      }}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <button type="button" className="dp-ff-restart" onClick={onRestart}>
          Recommencer le quiz
        </button>
      </div>

      <div className="dp-ff-reco">
        <h3 className="dp-ff-reco-title">
          Les trois qui vous ressemblent le plus
          {budgetOption && (
            <span className={`dp-ff-budget${inBudget ? "" : " out"}`}>
              {inBudget
                ? `Total ${money.format(net)}${rate ? " remise déduite" : ""}, dans votre budget`
                : `Total ${money.format(net)}${rate ? " remise déduite" : ""} — au plus près de votre budget`}
            </span>
          )}
        </h3>

        <div className="dp-ff-grid">
          {trio.map((r, i) => {
            const p = r.product;
            const on = picked[i];
            return (
              <article key={p.id} className={`dp-ff-card${on ? "" : " off"}`}>
                <span className="dp-ff-num" aria-hidden="true">{i + 1}</span>
                {/* La pastille d'angle porte desormais la selection. La pilule
                    « Dans la selection » qui vivait sous le nom a ete retiree :
                    elle repetait en toutes lettres ce que la coche verte disait
                    deja, et pesait plus lourd que le nom du parfum. Le role
                    reste tenu par un vrai bouton, donc atteignable au clavier. */}
                <button
                  type="button"
                  className="dp-ff-case"
                  aria-pressed={on}
                  aria-label={on ? `Retirer ${p.name} de la selection` : `Remettre ${p.name} dans la selection`}
                  onClick={() => togglePick(i)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m5 12.5 4.5 4.5L19 7" />
                  </svg>
                </button>

                <div className="dp-ff-vis" ref={(el) => { visualRefs.current[i] = el; }}>
                  {/* La vidéo de carte, quand la source en fournit une : elle
                      montre CE flacon-là, là où le visuel est parfois partagé
                      entre plusieurs références. */}
                  {p.video ? (
                    <video src={p.video} poster={p.image} muted loop playsInline autoPlay preload="none" />
                  ) : p.image ? (
                    <Image src={p.image} alt="" fill sizes="(max-width: 640px) 33vw, 200px" style={{ objectFit: "cover" }} />
                  ) : (
                    <b>{p.brand.charAt(0)}</b>
                  )}
                  {/* La pastille ne sert que pour l'exception : « en stock » est
                      la norme, l'afficher reviendrait à étiqueter tout l'écran. */}
                  {!p.available && <span className="dp-ff-stock">Sur commande</span>}
                </div>

                <div className="dp-ff-txt">
                  <span className="dp-ff-brand">
                    {p.brand}
                    {r.filler && <i className="dp-ff-flag">suggestion</i>}
                  </span>
                  <span className="dp-ff-name">{p.name}</span>
                  {p.notes.length > 0 && <span className="dp-ff-notes">{p.notes.slice(0, 3).join(" · ")}</span>}
                </div>

                <div className="dp-ff-actions">
                  <span className={`dp-ff-price${quantities[i] > 1 ? " multiple" : ""}`}>
                    {money.format((p.price || 0) * quantities[i])}
                  </span>
                  <span className="dp-ff-qty" role="group" aria-label={`Quantité — ${p.name}`}>
                    <button type="button" onClick={() => setQty(i, quantities[i] - 1)} aria-label="Retirer un exemplaire">−</button>
                    <b>{quantities[i]}</b>
                    <button type="button" onClick={() => setQty(i, quantities[i] + 1)} aria-label="Ajouter un exemplaire">+</button>
                  </span>
                </div>

                <div className="dp-ff-buttons">
                  <button type="button" className={`dp-ff-add${added[i] ? " on" : ""}`} onClick={() => addOne(i)}>
                    {added[i] ? "Ajouté" : "Ajouter"}
                  </button>
                  <Link className="dp-ff-sheet" href={p.href} onClick={onClose}>
                    Fiche
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="dp-ff-offres">
          <div className={`dp-ff-jauge${units >= 3 ? " full" : ""}`}>
            <div className="dp-ff-jauge-bar">
              <i style={{ width: `${(Math.min(units, 3) / 3) * 100}%` }} />
            </div>
            <div className="dp-ff-jauge-lib">
              <span>2 parfums · −10 %</span>
              <span>3 parfums · −20 %</span>
            </div>
            <p className="dp-ff-jauge-msg">
              {units === 0 && "Choisissez au moins un parfum pour voir votre remise."}
              {units === 1 && (
                <>
                  Ajoutez <b>un parfum</b> et la remise démarre à 10 %.
                </>
              )}
              {units === 2 && (
                <>
                  Encore <b>un parfum</b> et votre remise passe de 10 % à 20 %
                  {/* ce que le troisième ferait gagner, en euros et non en pourcentage */}
                  {gross > 0 ? ` — soit ${money.format(gross * 0.1)} de moins.` : "."}
                </>
              )}
              {units >= 3 && (
                <>
                  Remise maximale atteinte : <b>−20 %</b>.
                </>
              )}
            </p>
          </div>

          <div className="dp-ff-combis">
            {combinations(trio.length).map((indexes) => {
              const brut = indexes.reduce((s, i) => s + (trio[i].product.price || 0) * quantities[i], 0);
              const count = indexes.reduce((s, i) => s + quantities[i], 0);
              const t = discountRate(count);
              const active = indexes.join(",") === pickedKey;
              const full = indexes.length === trio.length;
              return (
                <button
                  key={indexes.join("-")}
                  type="button"
                  className={`dp-ff-combi${active ? " on" : ""}${full ? " max" : ""}`}
                  aria-pressed={active}
                  onClick={() => applyCombination(indexes)}
                >
                  <span className="dp-ff-combi-nums">
                    {indexes.map((i) => (
                      <i key={i}>{i + 1}</i>
                    ))}
                  </span>
                  <span className="dp-ff-combi-lib">{full ? "Les trois" : "Les deux"}</span>
                  <span className="dp-ff-combi-prix">
                    {t > 0 && <s>{money.format(brut)}</s>}
                    <b>{money.format(brut * (1 - t))}</b>
                    {t > 0 && <em>−{Math.round(t * 100)} %</em>}
                  </span>
                </button>
              );
            })}
          </div>

          <button type="button" className="dp-ff-ajout" onClick={addSelection} disabled={units === 0}>
            {units === 0 ? (
              "Choisissez au moins un parfum"
            ) : (
              <>
                Ajouter {units === 1 ? "ce parfum" : `ces ${units} parfums`} au panier — <b>{money.format(net)}</b>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
