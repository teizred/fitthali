"use client";

import { useEffect, useState } from "react";
import { StoreProvider, useStore } from "@/lib/store";
import { Nutrition } from "./Nutrition";
import { Reports } from "./Reports";
import { Workout } from "./Workout";
import { Settings } from "./Settings";
import { RestTimerBar } from "./RestTimer";

type Tab = "food" | "reports" | "gym" | "settings";
const TABS: [Tab, string, string][] = [
  ["food", "🍛", "Repas"],
  ["reports", "📊", "Bilans"],
  ["gym", "🏋️", "Muscu"],
  ["settings", "⚙️", "Réglages"],
];

function Shell() {
  const { s } = useStore();
  const [tab, setTab] = useState<Tab>(s.active ? "gym" : "food");
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return (
    <div className="app">
      <header>
        <h1>{TABS.find((t) => t[0] === tab)![2]}</h1>
        {s.active && tab !== "gym" && <button className="pill" onClick={() => setTab("gym")}>Séance en cours ›</button>}
      </header>
      <main>
        {tab === "food" && <Nutrition />}
        {tab === "reports" && <Reports />}
        {tab === "gym" && <Workout />}
        {tab === "settings" && <Settings />}
      </main>
      <RestTimerBar />
      <nav>
        {TABS.map(([id, icon, label]) => (
          <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}>
            <span>{icon}</span>
            <small>{label}</small>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
