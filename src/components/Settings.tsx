"use client";

import { useState } from "react";
import { exportData, importData, r0, useStore, type Profile } from "@/lib/store";
import { enablePush, getAccessCode, localNotify, setAccessCode } from "@/lib/api";
import { unlockAudio, useRestTimer } from "./RestTimer";

export function Settings() {
  const { s, set } = useStore();
  const { start } = useRestTimer();
  const [msg, setMsg] = useState("");
  const [code, setCode] = useState(getAccessCode);
  const t = s.targets;
  const kcalFromMacros = t.p * 4 + t.c * 4 + t.f * 9;

  const num = (v: string) => Number(v) || 0;
  const setT = (k: keyof typeof t, v: string) => set((st) => ({ ...st, targets: { ...st.targets, [k]: num(v) } }));
  const setP = <K extends keyof Profile>(k: K, v: Profile[K]) => set((st) => ({ ...st, profile: { ...st.profile, [k]: v } }));

  const suggest = () => {
    const w = s.profile.weightKg;
    if (!w) return setMsg("Renseigne ton poids d'abord.");
    const base = w * 33;
    const kcal = r0(s.profile.goal === "perte" ? base - 450 : s.profile.goal === "prise" ? base + 300 : base);
    const p = r0(w * 2);
    const f = r0(w * 0.9);
    const c = r0((kcal - p * 4 - f * 9) / 4);
    set((st) => ({ ...st, targets: { kcal, p, c, f } }));
    setMsg("Objectifs estimés (à ajuster selon ta balance après 2–3 semaines).");
  };

  const notif = async () => {
    unlockAudio();
    try {
      const sub = await enablePush();
      set((st) => ({ ...st, pushSub: sub }));
      setMsg("Notifications activées ✅");
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <div className="card-head"><b>Code d'accès</b></div>
        <div className="muted small">Le code défini sur le serveur (APP_CODE). Nécessaire pour l'IA et les notifications.</div>
        <div className="row gap">
          <input className="grow" type="password" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} />
          <button className="primary" onClick={() => { setAccessCode(code); setMsg("Code enregistré ✅"); }}>OK</button>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><b>Profil</b></div>
        <div className="grid2">
          <label className="field">Poids (kg)<input type="number" inputMode="decimal" value={s.profile.weightKg ?? ""} onChange={(e) => setP("weightKg", num(e.target.value) || undefined)} /></label>
          <label className="field">Objectif
            <select value={s.profile.goal} onChange={(e) => setP("goal", e.target.value as Profile["goal"])}>
              <option value="perte">Perte de gras</option>
              <option value="maintien">Maintien / recompo</option>
              <option value="prise">Prise de muscle</option>
            </select>
          </label>
        </div>
        <button className="ghost" onClick={suggest}>Calculer des objectifs à partir de mon poids</button>
      </div>

      <div className="card">
        <div className="card-head"><b>Objectifs journaliers</b><span className="muted small">macros = {r0(kcalFromMacros)} kcal</span></div>
        <div className="grid2">
          <label className="field">Calories<input type="number" value={t.kcal} onChange={(e) => setT("kcal", e.target.value)} /></label>
          <label className="field">Protéines (g)<input type="number" value={t.p} onChange={(e) => setT("p", e.target.value)} /></label>
          <label className="field">Glucides (g)<input type="number" value={t.c} onChange={(e) => setT("c", e.target.value)} /></label>
          <label className="field">Lipides (g)<input type="number" value={t.f} onChange={(e) => setT("f", e.target.value)} /></label>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><b>Minuteur de repos</b></div>
        <label className="field">Repos par défaut (s)<input type="number" value={s.profile.defaultRest} onChange={(e) => setP("defaultRest", num(e.target.value) || 90)} /></label>
        <div className="muted small">
          Notifications : {s.pushSub ? "activées sur cet appareil" : "désactivées"}. Sur iPhone, ajoute d'abord l'app à l'écran d'accueil (Partager → « Sur l'écran d'accueil ») et ouvre-la depuis l'icône.
        </div>
        <div className="row gap">
          <button className="primary" onClick={notif}>{s.pushSub ? "Réactiver" : "Activer les notifications"}</button>
          <button className="ghost" onClick={() => { start(10, "Test du minuteur"); setMsg("Minuteur de test de 10 s lancé : verrouille ton téléphone pour tester."); }}>Tester (10 s)</button>
          <button className="ghost" onClick={() => localNotify("FitThali", "Notification locale OK")}>Notif locale</button>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><b>Données</b></div>
        <div className="muted small">Tout est stocké sur ce téléphone. Exporte régulièrement une sauvegarde.</div>
        <div className="row gap">
          <button className="ghost" onClick={() => {
            const blob = new Blob([exportData()], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `fitthali-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
          }}>Exporter</button>
          <label className="ghost file-btn">Importer
            <input type="file" accept="application/json" hidden onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f && confirm("Remplacer toutes les données actuelles ?")) {
                try { importData(await f.text()); } catch { setMsg("Fichier invalide"); }
              }
            }} />
          </label>
        </div>
      </div>
      {msg && <div className="toast" onClick={() => setMsg("")}>{msg}</div>}
    </div>
  );
}
