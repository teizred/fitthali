"use client";

import { useMemo, useRef, useState } from "react";
import { CATEGORIES, FOODS, normalize, type Food } from "@/data/foods";
import { MEALS, r0, r1, scaleFood, uid, useStore, type FoodEntry, type Meal } from "@/lib/store";
import { analyzePhoto, analyzeText, compressImage, type AiResult } from "@/lib/api";

type Tab = "search" | "photo" | "text" | "create";

export function AddFood({ date, meal: initialMeal, onClose }: { date: string; meal: Meal; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("search");
  const [meal, setMeal] = useState<Meal>(initialMeal);
  const { set } = useStore();

  const addEntries = (list: Omit<FoodEntry, "id" | "date" | "meal">[]) => {
    set((s) => ({
      ...s,
      entries: [...s.entries, ...list.map((e) => ({ ...e, id: uid(), date, meal }))],
      recentFoodIds: [
        ...list.map((e) => e.foodId).filter((x): x is string => !!x),
        ...s.recentFoodIds,
      ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 30),
    }));
    onClose();
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <select value={meal} onChange={(e) => setMeal(e.target.value as Meal)}>
            {MEALS.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          <button className="ghost" onClick={onClose}>Fermer</button>
        </div>
        <div className="seg">
          {([["search", "🔍 Liste"], ["photo", "📷 Photo IA"], ["text", "✍️ Décrire"], ["create", "＋ Créer"]] as [Tab, string][]).map(([t, l]) => (
            <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{l}</button>
          ))}
        </div>
        {tab === "search" && <SearchTab onAdd={addEntries} />}
        {tab === "photo" && <PhotoTab onAdd={addEntries} />}
        {tab === "text" && <TextTab onAdd={addEntries} />}
        {tab === "create" && <CreateTab onCreated={() => setTab("search")} />}
      </div>
    </div>
  );
}

type AddFn = (list: Omit<FoodEntry, "id" | "date" | "meal">[]) => void;

function SearchTab({ onAdd }: { onAdd: AddFn }) {
  const { s } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [picked, setPicked] = useState<Food | null>(null);
  const all = useMemo(() => [...s.customFoods, ...FOODS], [s.customFoods]);

  const list = useMemo(() => {
    const nq = normalize(q.trim());
    if (!nq && !cat) {
      const recent = s.recentFoodIds.map((id) => all.find((f) => f.id === id)).filter((f): f is Food => !!f);
      return recent.length ? recent : all.slice(0, 40);
    }
    return all.filter(
      (f) => (!cat || f.cat === cat || (cat === "Mes aliments" && f.custom)) && (!nq || normalize(f.name + " " + (f.local || "")).includes(nq)),
    );
  }, [q, cat, all, s.recentFoodIds]);

  if (picked) return <FoodDetail food={picked} onBack={() => setPicked(null)} onAdd={onAdd} />;

  return (
    <div className="tab-body">
      <input autoFocus className="search" placeholder="idli, kottu, poulet, whey…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="chips">
        {["Mes aliments", ...CATEGORIES].map((c) => (
          <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(cat === c ? null : c)}>{c}</button>
        ))}
      </div>
      {!q && !cat && s.recentFoodIds.length > 0 && <div className="muted small">Récents</div>}
      <ul className="list">
        {list.map((f) => (
          <li key={f.id} onClick={() => setPicked(f)}>
            <div>
              <div>{f.name} {f.local && <span className="muted small">{f.local}</span>}</div>
              <div className="muted small">{f.cat}</div>
            </div>
            <div className="right small">
              <b>{f.kcal}</b> kcal/100g
              <div className="muted">P{f.p} G{f.c} L{f.f}</div>
            </div>
          </li>
        ))}
        {list.length === 0 && <li className="muted">Introuvable : essaie l'onglet « Décrire », l'IA connaît tous les plats.</li>}
      </ul>
    </div>
  );
}

function FoodDetail({ food, onBack, onAdd }: { food: Food; onBack: () => void; onAdd: AddFn }) {
  const [grams, setGrams] = useState(food.portions[0]?.g ?? 100);
  const m = scaleFood(food, grams);
  return (
    <div className="tab-body">
      <button className="ghost" onClick={onBack}>← Retour</button>
      <h3>{food.name}</h3>
      <div className="chips">
        {food.portions.map((p) => (
          <button key={p.label} className={"chip" + (grams === p.g ? " on" : "")} onClick={() => setGrams(p.g)}>
            {p.label} ({p.g} g)
          </button>
        ))}
        <button className={"chip" + (grams === 100 ? " on" : "")} onClick={() => setGrams(100)}>100 g</button>
      </div>
      <label className="field">
        Quantité (g)
        <div className="stepper">
          <button onClick={() => setGrams(Math.max(0, grams - 10))}>−</button>
          <input type="number" inputMode="decimal" value={grams} onChange={(e) => setGrams(Number(e.target.value) || 0)} />
          <button onClick={() => setGrams(grams + 10)}>+</button>
        </div>
      </label>
      <MacroLine m={m} />
      <button
        className="primary block"
        onClick={() =>
          onAdd([{ name: food.name, grams, ...m, source: food.custom ? "custom" : "db", foodId: food.id, portion: food.portions.find((p) => p.g === grams)?.label }])
        }
      >
        Ajouter
      </button>
    </div>
  );
}

export function MacroLine({ m }: { m: { kcal: number; p: number; c: number; f: number; fiber: number } }) {
  return (
    <div className="macro-line">
      <span><b>{r0(m.kcal)}</b> kcal</span>
      <span className="p">P {r1(m.p)} g</span>
      <span className="c">G {r1(m.c)} g</span>
      <span className="f">L {r1(m.f)} g</span>
      <span className="muted">Fibres {r1(m.fiber)} g</span>
    </div>
  );
}

function AiReview({ result, onAdd, onReset }: { result: AiResult; onAdd: AddFn; onReset: () => void }) {
  const [items, setItems] = useState(result.items.map((it) => ({ ...it, base: it, on: true })));
  const update = (i: number, grams: number) =>
    setItems((list) =>
      list.map((it, j) => {
        if (j !== i) return it;
        const k = it.base.grams ? grams / it.base.grams : 1;
        return { ...it, grams, kcal: it.base.kcal * k, protein: it.base.protein * k, carbs: it.base.carbs * k, fat: it.base.fat * k, fiber: it.base.fiber * k };
      }),
    );
  const kept = items.filter((i) => i.on);
  const tot = kept.reduce((a, i) => ({ kcal: a.kcal + i.kcal, p: a.p + i.protein, c: a.c + i.carbs, f: a.f + i.fat, fiber: a.fiber + i.fiber }), { kcal: 0, p: 0, c: 0, f: 0, fiber: 0 });

  return (
    <div>
      <div className="muted small">Confiance : {result.confidence}. {result.notes}</div>
      <ul className="list">
        {items.map((it, i) => (
          <li key={i} className={it.on ? "" : "off"}>
            <label className="row">
              <input type="checkbox" checked={it.on} onChange={(e) => setItems((l) => l.map((x, j) => (j === i ? { ...x, on: e.target.checked } : x)))} />
              <div>
                <div>{it.name}</div>
                <div className="muted small">{it.portion} · {r0(it.kcal)} kcal · P{r1(it.protein)} G{r1(it.carbs)} L{r1(it.fat)}</div>
              </div>
            </label>
            <input className="grams" type="number" inputMode="decimal" value={r0(it.grams)} onChange={(e) => update(i, Number(e.target.value) || 0)} />
            <span className="small muted">g</span>
          </li>
        ))}
      </ul>
      <MacroLine m={tot} />
      <div className="row gap">
        <button className="ghost" onClick={onReset}>Recommencer</button>
        <button
          className="primary grow"
          disabled={!kept.length}
          onClick={() =>
            onAdd(kept.map((i) => ({ name: i.name, portion: i.portion, grams: i.grams, kcal: i.kcal, p: i.protein, c: i.carbs, f: i.fat, fiber: i.fiber, source: "photo" as const })))
          }
        >
          Ajouter {kept.length} aliment{kept.length > 1 ? "s" : ""}
        </button>
      </div>
    </div>
  );
}

function PhotoTab({ onAdd }: { onAdd: AddFn }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [img, setImg] = useState<{ data: string; preview: string } | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<AiResult | null>(null);

  const run = async () => {
    if (!img) return;
    setLoading(true);
    setErr("");
    try {
      setResult(await analyzePhoto(img.data, "image/jpeg", note));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-body">
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={async (e) => {
        const f = e.target.files?.[0];
        if (f) { setImg(await compressImage(f)); setResult(null); }
        e.target.value = "";
      }} />
      {/* eslint-disable-next-line @next/next/no-img-element -- aperçu data: URL local */}
      {img ? <img className="preview" src={img.preview} alt="repas" /> : (
        <button className="dropzone" onClick={() => fileRef.current?.click()}>📷<br />Prendre ou choisir une photo du repas</button>
      )}
      {img && !result && (
        <>
          <input className="search" placeholder="Précision (optionnel) : « 3 idlis, sambar sans huile »" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="row gap">
            <button className="ghost" onClick={() => fileRef.current?.click()}>Changer</button>
            <button className="primary grow" disabled={loading} onClick={run}>{loading ? "Analyse en cours…" : "Analyser avec l'IA"}</button>
          </div>
        </>
      )}
      {err && <div className="error">{err}</div>}
      {result && <AiReview result={result} onAdd={onAdd} onReset={() => { setResult(null); setImg(null); }} />}
    </div>
  );
}

function TextTab({ onAdd }: { onAdd: AddFn }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<AiResult | null>(null);
  const run = async () => {
    setLoading(true);
    setErr("");
    try {
      setResult(await analyzeText(text));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  if (result) return <div className="tab-body"><AiReview result={result} onAdd={onAdd} onReset={() => setResult(null)} /></div>;
  return (
    <div className="tab-body">
      <textarea rows={4} placeholder="Ex : 2 assiettes de string hoppers avec kiri hodi et pol sambol, un thé au lait" value={text} onChange={(e) => setText(e.target.value)} />
      <button className="primary block" disabled={loading || !text.trim()} onClick={run}>{loading ? "Calcul en cours…" : "Calculer avec l'IA"}</button>
      {err && <div className="error">{err}</div>}
    </div>
  );
}

function CreateTab({ onCreated }: { onCreated: () => void }) {
  const { set } = useStore();
  const [f, setF] = useState({ name: "", kcal: "", p: "", c: "", f: "", fiber: "", portion: "1 portion", g: "100" });
  const n = (v: string) => Number(v.replace(",", ".")) || 0;
  const save = () => {
    const food: Food = {
      id: "custom-" + uid(),
      name: f.name.trim(),
      cat: "Mes aliments",
      kcal: n(f.kcal), p: n(f.p), c: n(f.c), f: n(f.f), fiber: n(f.fiber),
      portions: [{ label: f.portion || "1 portion", g: n(f.g) || 100 }],
      custom: true,
    };
    set((s) => ({ ...s, customFoods: [food, ...s.customFoods], recentFoodIds: [food.id, ...s.recentFoodIds] }));
    onCreated();
  };
  const field = (k: keyof typeof f, label: string, num = true) => (
    <label className="field">
      {label}
      <input inputMode={num ? "decimal" : "text"} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
    </label>
  );
  return (
    <div className="tab-body">
      <div className="muted small">Valeurs pour 100 g (regarde l'étiquette du paquet).</div>
      {field("name", "Nom", false)}
      <div className="grid2">
        {field("kcal", "Kcal")}
        {field("p", "Protéines (g)")}
        {field("c", "Glucides (g)")}
        {field("f", "Lipides (g)")}
        {field("fiber", "Fibres (g)")}
        {field("g", "Poids d'une portion (g)")}
      </div>
      {field("portion", "Nom de la portion", false)}
      <button className="primary block" disabled={!f.name.trim()} onClick={save}>Enregistrer l'aliment</button>
    </div>
  );
}
