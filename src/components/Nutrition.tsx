"use client";

import { useState } from "react";
import { MEALS, r0, r1, sumMacros, todayStr, useStore, type FoodEntry, type Meal } from "@/lib/store";
import { AddFood, MacroLine } from "./AddFood";

function shift(date: string, days: number) {
  const d = new Date(date + "T12:00:00");
  d.setDate(d.getDate() + days);
  return todayStr(d);
}

function dayLabel(date: string) {
  const t = todayStr();
  if (date === t) return "Aujourd'hui";
  if (date === shift(t, -1)) return "Hier";
  return new Date(date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

export function Nutrition() {
  const { s, set } = useStore();
  const [date, setDate] = useState(todayStr());
  const [adding, setAdding] = useState<Meal | null>(null);
  const [editing, setEditing] = useState<FoodEntry | null>(null);
  const day = s.entries.filter((e) => e.date === date);
  const tot = sumMacros(day);
  const t = s.targets;

  return (
    <div className="page">
      <div className="date-nav">
        <button className="ghost" onClick={() => setDate(shift(date, -1))}>‹</button>
        <b>{dayLabel(date)}</b>
        <button className="ghost" onClick={() => setDate(shift(date, 1))} disabled={date >= todayStr()}>›</button>
      </div>

      <div className="card summary">
        <Ring value={tot.kcal} target={t.kcal} />
        <div className="bars">
          <Bar label="Protéines" cls="p" v={tot.p} t={t.p} />
          <Bar label="Glucides" cls="c" v={tot.c} t={t.c} />
          <Bar label="Lipides" cls="f" v={tot.f} t={t.f} />
          <div className="muted small">Fibres : {r1(tot.fiber)} g</div>
        </div>
      </div>

      {MEALS.map((m) => {
        const list = day.filter((e) => e.meal === m.id);
        const mt = sumMacros(list);
        return (
          <div className="card" key={m.id}>
            <div className="card-head">
              <b>{m.label}</b>
              <span className="muted small">{r0(mt.kcal)} kcal · P{r0(mt.p)} G{r0(mt.c)} L{r0(mt.f)}</span>
            </div>
            <ul className="list compact">
              {list.map((e) => (
                <li key={e.id} onClick={() => setEditing(e)}>
                  <div>
                    <div>{e.source === "photo" ? "📷 " : ""}{e.name}</div>
                    <div className="muted small">{e.portion ? `${e.portion} · ` : ""}{r0(e.grams)} g</div>
                  </div>
                  <div className="right small">
                    <b>{r0(e.kcal)}</b> kcal
                    <div className="muted">P{r0(e.p)} G{r0(e.c)} L{r0(e.f)}</div>
                  </div>
                </li>
              ))}
            </ul>
            <button className="add" onClick={() => setAdding(m.id)}>＋ Ajouter</button>
          </div>
        );
      })}

      {adding && <AddFood date={date} meal={adding} onClose={() => setAdding(null)} />}
      {editing && (
        <EditEntry
          entry={editing}
          onClose={() => setEditing(null)}
          onSave={(e) => set((st) => ({ ...st, entries: st.entries.map((x) => (x.id === e.id ? e : x)) }))}
          onDelete={() => set((st) => ({ ...st, entries: st.entries.filter((x) => x.id !== editing.id) }))}
        />
      )}
    </div>
  );
}

function Ring({ value, target }: { value: number; target: number }) {
  const pct = Math.min(1, value / (target || 1));
  const R = 52;
  const C = 2 * Math.PI * R;
  const over = value > target;
  return (
    <div className="ring">
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={R} className="ring-bg" />
        <circle cx="60" cy="60" r={R} className={"ring-fg" + (over ? " over" : "")} strokeDasharray={`${pct * C} ${C}`} transform="rotate(-90 60 60)" />
      </svg>
      <div className="ring-txt">
        <b>{r0(value)}</b>
        <span className="muted small">/ {target} kcal</span>
        <span className="small">{over ? `+${r0(value - target)}` : `reste ${r0(target - value)}`}</span>
      </div>
    </div>
  );
}

function Bar({ label, cls, v, t }: { label: string; cls: string; v: number; t: number }) {
  return (
    <div className="bar">
      <div className="bar-head small"><span>{label}</span><span>{r0(v)} / {t} g</span></div>
      <div className="bar-track"><div className={"bar-fill " + cls} style={{ width: `${Math.min(100, (v / (t || 1)) * 100)}%` }} /></div>
    </div>
  );
}

function EditEntry({ entry, onClose, onSave, onDelete }: { entry: FoodEntry; onClose: () => void; onSave: (e: FoodEntry) => void; onDelete: () => void }) {
  const [grams, setGrams] = useState(r0(entry.grams));
  const [meal, setMeal] = useState(entry.meal);
  const k = entry.grams ? grams / entry.grams : 1;
  const m = { kcal: entry.kcal * k, p: entry.p * k, c: entry.c * k, f: entry.f * k, fiber: entry.fiber * k };
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet small-sheet" onClick={(e) => e.stopPropagation()}>
        <h3>{entry.name}</h3>
        <label className="field">
          Repas
          <select value={meal} onChange={(e) => setMeal(e.target.value as Meal)}>
            {MEALS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
          </select>
        </label>
        <label className="field">
          Quantité (g)
          <input type="number" inputMode="decimal" value={grams} onChange={(e) => setGrams(Number(e.target.value) || 0)} />
        </label>
        <MacroLine m={m} />
        <div className="row gap">
          <button className="danger" onClick={() => { onDelete(); onClose(); }}>Supprimer</button>
          <button className="primary grow" onClick={() => { onSave({ ...entry, ...m, grams, meal }); onClose(); }}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
