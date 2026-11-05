"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { cancelPush, localNotify, schedulePush } from "@/lib/api";

let audioCtx: AudioContext | null = null;
/** Doit être appelé pendant un geste utilisateur (iOS bloque l'audio sinon). */
export function unlockAudio() {
  try {
    audioCtx ??= new AudioContext();
    if (audioCtx.state === "suspended") audioCtx.resume();
  } catch {
    /* pas d'audio */
  }
}

function beep() {
  if (!audioCtx) return;
  const t0 = audioCtx.currentTime;
  [0, 0.35, 0.7].forEach((dt) => {
    const o = audioCtx!.createOscillator();
    const g = audioCtx!.createGain();
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.0001, t0 + dt);
    g.gain.exponentialRampToValueAtTime(0.5, t0 + dt + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dt + 0.25);
    o.connect(g).connect(audioCtx!.destination);
    o.start(t0 + dt);
    o.stop(t0 + dt + 0.3);
  });
}

const TITLE = "⏱️ Repos terminé";

// Push programmé dont l'id n'est peut-être pas encore revenu du serveur.
let pendingPush: Promise<string | undefined> | null = null;
function cancelScheduled(knownId?: string) {
  if (knownId) cancelPush(knownId);
  const p = pendingPush;
  pendingPush = null;
  p?.then((id) => cancelPush(id));
}

export function useRestTimer() {
  const { s, set } = useStore();

  const start = useCallback(
    async (seconds: number, label: string) => {
      unlockAudio();
      cancelScheduled(s.timer?.pushId);
      const endsAt = Date.now() + seconds * 1000;
      set((st) => ({ ...st, timer: { endsAt, total: seconds, label } }));
      if (s.pushSub) {
        const p = schedulePush(s.pushSub, endsAt, TITLE, `C'est reparti : ${label}`);
        pendingPush = p;
        const pushId = await p;
        if (pendingPush === p) pendingPush = null;
        set((st) => (st.timer?.endsAt === endsAt ? { ...st, timer: { ...st.timer, pushId } } : st));
      }
    },
    [s.timer, s.pushSub, set],
  );

  const adjust = useCallback(
    (delta: number) => {
      const t = s.timer;
      if (!t) return;
      const remaining = Math.max(1, Math.round((t.endsAt - Date.now()) / 1000) + delta);
      start(remaining, t.label);
    },
    [s.timer, start],
  );

  const stop = useCallback(() => {
    cancelScheduled(s.timer?.pushId);
    set((st) => ({ ...st, timer: null }));
  }, [s.timer, set]);

  return { timer: s.timer, start, adjust, stop };
}

export function RestTimerBar() {
  const { timer, adjust, stop } = useRestTimer();
  const { set } = useStore();
  const [now, setNow] = useState(() => Date.now());
  const firedFor = useRef<number | null>(null);

  // Au chargement : un minuteur déjà expiré (app fermée entre-temps) est simplement retiré.
  useEffect(() => {
    if (timer && timer.endsAt < Date.now() - 2000) set((st) => ({ ...st, timer: null }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!timer) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [timer]);

  useEffect(() => {
    if (!timer || now < timer.endsAt || firedFor.current === timer.endsAt) return;
    firedFor.current = timer.endsAt;
    beep();
    navigator.vibrate?.([300, 100, 300, 100, 300]);
    if (document.visibilityState !== "visible") localNotify(TITLE, `C'est reparti : ${timer.label}`);
    // Pas de cleanup : l'effet se relance à chaque tick, il ne doit pas annuler la fermeture.
    setTimeout(() => set((st) => (st.timer?.endsAt === timer.endsAt ? { ...st, timer: null } : st)), 2500);
  }, [now, timer, set]);

  if (!timer) return null;
  const left = Math.max(0, Math.ceil((timer.endsAt - now) / 1000));
  const pct = Math.min(1, 1 - left / timer.total);
  const done = left === 0;
  return (
    <div className={"rest-bar" + (done ? " done" : "")}>
      <div className="rest-progress" style={{ width: `${pct * 100}%` }} />
      <div className="rest-content">
        <button onClick={() => adjust(-15)}>−15</button>
        <div className="rest-time">
          <b>{done ? "GO !" : `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`}</b>
          <span className="small">{timer.label}</span>
        </div>
        <button onClick={() => adjust(15)}>+15</button>
        <button className="skip" onClick={stop}>Passer</button>
      </div>
    </div>
  );
}
