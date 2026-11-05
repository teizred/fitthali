"use client";

import { useEffect, useMemo, useState } from "react";
import { EQUIPMENT, EXERCISES, MUSCLES, type Exercise } from "@/data/exercises";
import { normalize } from "@/data/foods";
import { r0, uid, useStore, type Workout as W, type WorkoutExercise } from "@/lib/store";
import { unlockAudio, useRestTimer } from "./RestTimer";

const REST_PRESETS = [45, 60, 90, 120, 180, 240];

function fmtDur(ms: number) {
  const m = Math.floor(ms / 60000);
  return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`;
}
function volume(w: W) {
  return w.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).reduce((b, s) => b + s.kg * s.reps, 0), 0);
}

export function Workout() {
  const { s, set } = useStore();
  const [view, setView] = useState<W | null>(null);

  const startWorkout = (from?: W) => {
    unlockAudio();
    const hour = new Date().getHours();
    const w: W = {
      id: uid(),
      name: from?.name || (hour < 12 ? "Séance du matin" : hour < 18 ? "Séance de l'après-midi" : "Séance du soir"),
      start: Date.now(),
      exercises: (from?.exercises || []).map((e) => ({ ...e, sets: e.sets.map((x) => ({ ...x, done: false })) })),
    };
    set((st) => ({ ...st, active: w }));
    setView(null);
  };

  if (s.active) return <ActiveWorkout />;
  if (view) return <WorkoutDetail w={view} onBack={() => setView(null)} onRepeat={() => startWorkout(view)} onDelete={() => { set((st) => ({ ...st, workouts: st.workouts.filter((x) => x.id !== view.id) })); setView(null); }} />;

  return (
    <div className="page">
      <button className="primary block big" onClick={() => startWorkout()}>▶ Démarrer une séance</button>
      <h3>Historique</h3>
      {s.workouts.length === 0 && <div className="muted">Aucune séance pour l'instant.</div>}
      {[...s.workouts].sort((a, b) => b.start - a.start).map((w) => (
        <div className="card clickable" key={w.id} onClick={() => setView(w)}>
          <div className="card-head">
            <b>{w.name}</b>
            <span className="muted small">{new Date(w.start).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}</span>
          </div>
          <div className="muted small">
            {w.end ? fmtDur(w.end - w.start) : ""} · {w.exercises.length} exercices · {r0(volume(w))} kg de volume
          </div>
          <div className="small">{w.exercises.map((e) => e.name).join(" · ")}</div>
        </div>
      ))}
    </div>
  );
}

function WorkoutDetail({ w, onBack, onRepeat, onDelete }: { w: W; onBack: () => void; onRepeat: () => void; onDelete: () => void }) {
  return (
    <div className="page">
      <button className="ghost" onClick={onBack}>← Retour</button>
      <h3>{w.name}</h3>
      <div className="muted small">{new Date(w.start).toLocaleString("fr-FR")} · {w.end ? fmtDur(w.end - w.start) : ""} · {r0(volume(w))} kg</div>
      {w.exercises.map((e, i) => (
        <div className="card" key={i}>
          <b>{e.name}</b>
          <ol className="small">
            {e.sets.filter((x) => x.done).map((x, j) => <li key={j}>{x.kg} kg × {x.reps}</li>)}
          </ol>
        </div>
      ))}
      <div className="row gap">
        <button className="danger" onClick={() => confirm("Supprimer cette séance ?") && onDelete()}>Supprimer</button>
        <button className="primary grow" onClick={onRepeat}>Refaire cette séance</button>
      </div>
    </div>
  );
}

function ActiveWorkout() {
  const { s, set } = useStore();
  const w = s.active!;
  const [picking, setPicking] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const { start } = useRestTimer();
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const update = (fn: (w: W) => W) => set((st) => (st.active ? { ...st, active: fn(st.active) } : st));
  const updateEx = (i: number, fn: (e: WorkoutExercise) => WorkoutExercise) =>
    update((w) => ({ ...w, exercises: w.exercises.map((e, j) => (j === i ? fn(e) : e)) }));

  /** Dernière performance enregistrée pour cet exercice. */
  const previous = (exId: string) => {
    const past = [...s.workouts].sort((a, b) => b.start - a.start).find((x) => x.exercises.some((e) => e.exId === exId));
    return past?.exercises.find((e) => e.exId === exId)?.sets.filter((x) => x.done) || [];
  };

  const addExercise = (ex: Exercise) => {
    const prev = previous(ex.id);
    const prevRest = [...s.workouts].reverse().flatMap((x) => x.exercises).find((e) => e.exId === ex.id)?.rest;
    const sets = prev.length ? prev.map((x) => ({ kg: x.kg, reps: x.reps, done: false })) : [1, 2, 3].map(() => ({ kg: 0, reps: 10, done: false }));
    update((w) => ({ ...w, exercises: [...w.exercises, { exId: ex.id, name: ex.name, rest: prevRest ?? s.profile.defaultRest, sets }] }));
    setPicking(false);
  };

  const finish = () => {
    const cleaned = { ...w, end: Date.now(), exercises: w.exercises.filter((e) => e.sets.some((x) => x.done)).map((e) => ({ ...e, sets: e.sets.filter((x) => x.done) })) };
    if (!cleaned.exercises.length) {
      if (!confirm("Aucune série validée. Abandonner la séance ?")) return;
      set((st) => ({ ...st, active: null }));
      return;
    }
    set((st) => ({ ...st, active: null, workouts: [...st.workouts, cleaned] }));
  };

  return (
    <div className="page">
      <div className="card">
        <input className="title-input" value={w.name} onChange={(e) => update((x) => ({ ...x, name: e.target.value }))} />
        <div className="row between">
          <span className="muted">⏱ {fmtDur(now - w.start)} · {r0(volume(w))} kg</span>
          <div className="row gap">
            <button className="ghost" onClick={() => confirm("Annuler la séance sans l'enregistrer ?") && set((st) => ({ ...st, active: null }))}>Annuler</button>
            <button className="primary" onClick={finish}>Terminer</button>
          </div>
        </div>
      </div>

      {w.exercises.map((ex, i) => {
        const prev = previous(ex.exId);
        return (
          <div className="card" key={i}>
            <div className="card-head">
              <b>{ex.name}</b>
              <button className="ghost small" onClick={() => update((x) => ({ ...x, exercises: x.exercises.filter((_, j) => j !== i) }))}>✕</button>
            </div>
            <div className="row gap small">
              <span className="muted">Repos</span>
              <select value={ex.rest} onChange={(e) => updateEx(i, (x) => ({ ...x, rest: Number(e.target.value) }))}>
                {[...new Set([...REST_PRESETS, ex.rest])].sort((a, b) => a - b).map((r) => (
                  <option key={r} value={r}>{r >= 60 ? `${Math.floor(r / 60)} min${r % 60 ? ` ${r % 60}s` : ""}` : `${r} s`}</option>
                ))}
              </select>
            </div>
            <table className="sets">
              <thead>
                <tr><th>#</th><th>Précédent</th><th>kg</th><th>Reps</th><th>✓</th></tr>
              </thead>
              <tbody>
                {ex.sets.map((st, j) => (
                  <tr key={j} className={st.done ? "done" : ""}>
                    <td>{j + 1}</td>
                    <td className="muted small">{prev[j] ? `${prev[j].kg}×${prev[j].reps}` : "—"}</td>
                    <td><input type="number" inputMode="decimal" value={st.kg} onChange={(e) => updateEx(i, (x) => ({ ...x, sets: x.sets.map((y, k) => (k === j ? { ...y, kg: Number(e.target.value) || 0 } : y)) }))} /></td>
                    <td><input type="number" inputMode="numeric" value={st.reps} onChange={(e) => updateEx(i, (x) => ({ ...x, sets: x.sets.map((y, k) => (k === j ? { ...y, reps: Number(e.target.value) || 0 } : y)) }))} /></td>
                    <td>
                      <button
                        className={"check" + (st.done ? " on" : "")}
                        onClick={() => {
                          const nowDone = !st.done;
                          updateEx(i, (x) => ({ ...x, sets: x.sets.map((y, k) => (k === j ? { ...y, done: nowDone } : y)) }));
                          if (nowDone) start(ex.rest, j + 1 < ex.sets.length ? `${ex.name} – série ${j + 2}` : `${ex.name} terminé`);
                        }}
                      >✓</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="row gap">
              <button className="add grow" onClick={() => updateEx(i, (x) => ({ ...x, sets: [...x.sets, { ...(x.sets.at(-1) || { kg: 0, reps: 10 }), done: false }] }))}>＋ Série</button>
              {ex.sets.length > 1 && <button className="ghost" onClick={() => updateEx(i, (x) => ({ ...x, sets: x.sets.slice(0, -1) }))}>− Série</button>}
            </div>
          </div>
        );
      })}

      <button className="add block" onClick={() => setPicking(true)}>＋ Ajouter un exercice</button>
      {picking && <ExercisePicker onPick={addExercise} onClose={() => setPicking(false)} />}
    </div>
  );
}

function ExercisePicker({ onPick, onClose }: { onPick: (e: Exercise) => void; onClose: () => void }) {
  const { s, set } = useStore();
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ muscle: MUSCLES[0], equip: "Machine" });
  const all = useMemo(() => [...s.customExercises, ...EXERCISES], [s.customExercises]);
  const list = all.filter((e) => (!muscle || e.muscle === muscle) && (!q || normalize(e.name + e.equip).includes(normalize(q))));

  const create = () => {
    const ex: Exercise = { id: "cx-" + uid(), name: q.trim(), muscle: form.muscle, equip: form.equip, custom: true };
    set((st) => ({ ...st, customExercises: [ex, ...st.customExercises] }));
    onPick(ex);
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head"><b>Exercices</b><button className="ghost" onClick={onClose}>Fermer</button></div>
        <div className="tab-body">
          <input autoFocus className="search" placeholder="Rechercher ou nommer une machine…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="chips">
            {MUSCLES.map((m) => <button key={m} className={"chip" + (muscle === m ? " on" : "")} onClick={() => setMuscle(muscle === m ? null : m)}>{m}</button>)}
          </div>
          {q.trim() && !creating && <button className="add block" onClick={() => setCreating(true)}>＋ Créer « {q.trim()} »</button>}
          {creating && (
            <div className="card">
              <div className="grid2">
                <label className="field">Muscle<select value={form.muscle} onChange={(e) => setForm({ ...form, muscle: e.target.value })}>{MUSCLES.map((m) => <option key={m}>{m}</option>)}</select></label>
                <label className="field">Matériel<select value={form.equip} onChange={(e) => setForm({ ...form, equip: e.target.value })}>{EQUIPMENT.map((m) => <option key={m}>{m}</option>)}</select></label>
              </div>
              <button className="primary block" onClick={create}>Créer et ajouter</button>
            </div>
          )}
          <ul className="list">
            {list.map((e) => (
              <li key={e.id} onClick={() => onPick(e)}>
                <span>{e.name}</span>
                <span className="muted small">{e.muscle} · {e.equip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
