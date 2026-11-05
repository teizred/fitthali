"use client";

import { useMemo, useState, type ReactElement } from "react";
import { r0, r1, sumMacros, todayStr, useStore } from "@/lib/store";
import { generateReport } from "@/lib/api";

type Period = "week" | "lastweek" | "month" | "lastmonth";
const LABELS: Record<Period, string> = { week: "Cette semaine", lastweek: "Semaine dernière", month: "Ce mois", lastmonth: "Mois dernier" };

function range(p: Period): { from: string; to: string; label: string } {
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  if (p === "week" || p === "lastweek") {
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) - (p === "lastweek" ? 7 : 0));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    return { from: todayStr(monday), to: todayStr(sunday), label: `semaine du ${fmt(monday)} au ${fmt(sunday)}` };
  }
  const first = new Date(now.getFullYear(), now.getMonth() - (p === "lastmonth" ? 1 : 0), 1, 12);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0, 12);
  return { from: todayStr(first), to: todayStr(last), label: first.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) };
}

function daysBetween(from: string, to: string) {
  const out: string[] = [];
  const d = new Date(from + "T12:00:00");
  const end = new Date(to + "T12:00:00");
  while (d <= end) {
    out.push(todayStr(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

const cacheKey = (k: string) => "fitthali:report:" + k;

export function Reports() {
  const { s } = useStore();
  const [period, setPeriod] = useState<Period>("week");
  const { from, to, label } = range(period);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [report, setReport] = useState<string | null>(null);
  const key = `${from}_${to}`;

  const stats = useMemo(() => {
    const today = todayStr();
    const days = daysBetween(from, to).filter((d) => d <= today);
    const entries = s.entries.filter((e) => e.date >= from && e.date <= to);
    const perDay = days.map((d) => ({ date: d, ...sumMacros(entries.filter((e) => e.date === d)) }));
    const logged = perDay.filter((d) => d.kcal > 0);
    const tot = sumMacros(logged);
    const n = logged.length || 1;
    const avg = { kcal: tot.kcal / n, p: tot.p / n, c: tot.c / n, f: tot.f / n, fiber: tot.fiber / n };
    const kcalFromMacros = avg.p * 4 + avg.c * 4 + avg.f * 9 || 1;
    const foods = new Map<string, { name: string; count: number; kcal: number; p: number }>();
    for (const e of entries) {
      const k = e.name.toLowerCase();
      const cur = foods.get(k) || { name: e.name, count: 0, kcal: 0, p: 0 };
      cur.count++;
      cur.kcal += e.kcal;
      cur.p += e.p;
      foods.set(k, cur);
    }
    const topKcal = [...foods.values()].sort((a, b) => b.kcal - a.kcal).slice(0, 8);
    const topFreq = [...foods.values()].sort((a, b) => b.count - a.count).slice(0, 8);
    const fromTs = new Date(from + "T00:00:00").getTime();
    const toTs = new Date(to + "T23:59:59").getTime();
    const workouts = s.workouts.filter((w) => w.start >= fromTs && w.start <= toTs);
    const muscles: Record<string, number> = {};
    let volume = 0, sets = 0, minutes = 0;
    for (const w of workouts) {
      minutes += w.end ? (w.end - w.start) / 60000 : 0;
      for (const ex of w.exercises) {
        const done = ex.sets.filter((x) => x.done);
        sets += done.length;
        volume += done.reduce((a, x) => a + x.kg * x.reps, 0);
        muscles[ex.name] = (muscles[ex.name] || 0) + done.length;
      }
    }
    return {
      days, perDay, logged: logged.length, avg, tot,
      split: { p: (avg.p * 4) / kcalFromMacros, c: (avg.c * 4) / kcalFromMacros, f: (avg.f * 9) / kcalFromMacros },
      daysOnTarget: logged.filter((d) => Math.abs(d.kcal - s.targets.kcal) <= s.targets.kcal * 0.1).length,
      daysProteinOk: logged.filter((d) => d.p >= s.targets.p * 0.9).length,
      topKcal, topFreq,
      training: { sessions: workouts.length, sets, volume, minutes, exercises: muscles, list: workouts.map((w) => ({ name: w.name, date: new Date(w.start).toLocaleDateString("fr-FR"), exercises: w.exercises.map((e) => `${e.name}: ${e.sets.filter((x) => x.done).map((x) => `${x.kg}kg×${x.reps}`).join(", ")}`) })) },
    };
  }, [s.entries, s.workouts, s.targets, from, to]);

  const cached = (() => {
    try { return localStorage.getItem(cacheKey(key)); } catch { return null; }
  })();
  const shown = report ?? cached;

  const run = async () => {
    setLoading(true);
    setErr("");
    try {
      const payload = {
        joursDansLaPeriode: stats.days.length,
        joursRenseignes: stats.logged,
        moyennesParJour: { kcal: r0(stats.avg.kcal), proteines: r0(stats.avg.p), glucides: r0(stats.avg.c), lipides: r0(stats.avg.f), fibres: r0(stats.avg.fiber) },
        repartitionCalorique: { proteines: r0(stats.split.p * 100) + "%", glucides: r0(stats.split.c * 100) + "%", lipides: r0(stats.split.f * 100) + "%" },
        joursDansObjectifKcal: stats.daysOnTarget,
        joursObjectifProteinesAtteint: stats.daysProteinOk,
        detailParJour: stats.perDay.map((d) => ({ date: d.date, kcal: r0(d.kcal), p: r0(d.p), g: r0(d.c), l: r0(d.f) })),
        alimentsLesPlusCaloriques: stats.topKcal.map((f) => ({ nom: f.name, fois: f.count, kcal: r0(f.kcal) })),
        alimentsLesPlusFrequents: stats.topFreq.map((f) => ({ nom: f.name, fois: f.count })),
        entrainement: { ...stats.training, volume: r0(stats.training.volume), minutes: r0(stats.training.minutes) },
      };
      const { text } = await generateReport(label, payload, { objectifs: s.targets, ...s.profile });
      setReport(text);
      try { localStorage.setItem(cacheKey(key), text); } catch { /* ignore */ }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const maxK = Math.max(s.targets.kcal * 1.2, ...stats.perDay.map((d) => d.kcal));

  return (
    <div className="page">
      <div className="seg">
        {(Object.keys(LABELS) as Period[]).map((p) => (
          <button key={p} className={period === p ? "on" : ""} onClick={() => { setPeriod(p); setReport(null); setErr(""); }}>{LABELS[p]}</button>
        ))}
      </div>
      <div className="muted small center">{label} · {stats.logged}/{stats.days.length} jours renseignés</div>

      <div className="card">
        <div className="card-head"><b>Moyenne par jour</b></div>
        <div className="stats4">
          <Stat v={r0(stats.avg.kcal)} u="kcal" t={s.targets.kcal} />
          <Stat v={r0(stats.avg.p)} u="g prot." t={s.targets.p} cls="p" />
          <Stat v={r0(stats.avg.c)} u="g gluc." t={s.targets.c} cls="c" />
          <Stat v={r0(stats.avg.f)} u="g lip." t={s.targets.f} cls="f" />
        </div>
        <div className="split">
          <div className="p" style={{ flex: stats.split.p }} />
          <div className="c" style={{ flex: stats.split.c }} />
          <div className="f" style={{ flex: stats.split.f }} />
        </div>
        <div className="muted small">
          Répartition : P {r0(stats.split.p * 100)}% · G {r0(stats.split.c * 100)}% · L {r0(stats.split.f * 100)}% · Fibres {r1(stats.avg.fiber)} g/j
        </div>
        <div className="muted small">Objectif kcal (±10%) tenu {stats.daysOnTarget} j · Protéines OK {stats.daysProteinOk} j</div>
      </div>

      <div className="card">
        <div className="card-head"><b>Calories par jour</b><span className="muted small">ligne = objectif</span></div>
        <svg className="chart" viewBox={`0 0 ${stats.perDay.length * 20} 100`} preserveAspectRatio="none">
          {stats.perDay.map((d, i) => {
            const h = (d.kcal / maxK) * 100;
            return <rect key={d.date} x={i * 20 + 3} y={100 - h} width={14} height={h} rx={2} className={d.kcal > s.targets.kcal * 1.1 ? "over" : "ok"}><title>{d.date} : {r0(d.kcal)} kcal</title></rect>;
          })}
          <line x1="0" x2={stats.perDay.length * 20} y1={100 - (s.targets.kcal / maxK) * 100} y2={100 - (s.targets.kcal / maxK) * 100} className="target" />
        </svg>
      </div>

      <div className="card">
        <div className="card-head"><b>Ce qui pèse le plus</b></div>
        <ul className="list compact">
          {stats.topKcal.map((f) => (
            <li key={f.name}><span>{f.name} <span className="muted small">×{f.count}</span></span><span className="small">{r0(f.kcal)} kcal · P{r0(f.p)}</span></li>
          ))}
          {!stats.topKcal.length && <li className="muted">Aucun repas sur cette période.</li>}
        </ul>
      </div>

      <div className="card">
        <div className="card-head"><b>Entraînement</b></div>
        <div className="stats4">
          <Stat v={stats.training.sessions} u="séances" />
          <Stat v={stats.training.sets} u="séries" />
          <Stat v={r0(stats.training.volume / 1000 * 10) / 10} u="t soulevées" />
          <Stat v={r0(stats.training.minutes)} u="min" />
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <b>Compte rendu du coach IA</b>
          <button className="primary" disabled={loading || stats.logged === 0} onClick={run}>{loading ? "Rédaction…" : shown ? "Regénérer" : "Générer"}</button>
        </div>
        {stats.logged === 0 && <div className="muted small">Renseigne au moins un jour pour obtenir un compte rendu.</div>}
        {err && <div className="error">{err}</div>}
        {shown && <Markdown text={shown} />}
      </div>
    </div>
  );
}

function Stat({ v, u, t, cls }: { v: number; u: string; t?: number; cls?: string }) {
  return (
    <div className={"stat " + (cls || "")}>
      <b>{v}</b>
      <span className="muted small">{u}</span>
      {t !== undefined && <span className="small">{t ? r0((v / t) * 100) : 0}% obj.</span>}
    </div>
  );
}

/** Rendu Markdown minimal (titres, listes, gras) sans HTML injecté. */
function Markdown({ text }: { text: string }) {
  const inline = (s: string) => s.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith("**") ? <b key={i}>{part.slice(2, -2)}</b> : part));
  const blocks: ReactElement[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) blocks.push(<ul key={blocks.length}>{list.map((l, i) => <li key={i}>{inline(l)}</li>)}</ul>);
    list = [];
  };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (/^[-*•]\s+/.test(line) || /^\d+\.\s+/.test(line)) { list.push(line.replace(/^([-*•]|\d+\.)\s+/, "")); continue; }
    flush();
    if (!line) continue;
    const h = line.match(/^#{1,4}\s+(.*)/);
    blocks.push(h ? <h4 key={blocks.length}>{inline(h[1])}</h4> : <p key={blocks.length}>{inline(line)}</p>);
  }
  flush();
  return <div className="md">{blocks}</div>;
}
