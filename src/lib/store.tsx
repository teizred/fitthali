"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Food } from "@/data/foods";
import type { Exercise } from "@/data/exercises";

export type Meal = "breakfast" | "lunch" | "dinner" | "snack";
export const MEALS: { id: Meal; label: string }[] = [
  { id: "breakfast", label: "Petit-déjeuner" },
  { id: "lunch", label: "Déjeuner" },
  { id: "dinner", label: "Dîner" },
  { id: "snack", label: "Collations" },
];

export type Macros = { kcal: number; p: number; c: number; f: number; fiber: number };

export type FoodEntry = Macros & {
  id: string;
  date: string; // YYYY-MM-DD
  meal: Meal;
  name: string;
  grams: number;
  portion?: string;
  source: "db" | "photo" | "ai" | "custom";
  foodId?: string;
};

export type SetEntry = { kg: number; reps: number; done: boolean };
export type WorkoutExercise = { exId: string; name: string; rest: number; sets: SetEntry[]; note?: string };
export type Workout = { id: string; name: string; start: number; end?: number; exercises: WorkoutExercise[] };

export type Targets = { kcal: number; p: number; c: number; f: number };
export type Profile = { weightKg?: number; goal: "perte" | "maintien" | "prise"; defaultRest: number };
export type Timer = { endsAt: number; total: number; label: string; pushId?: string } | null;

type State = {
  entries: FoodEntry[];
  customFoods: Food[];
  recentFoodIds: string[];
  workouts: Workout[];
  active: Workout | null;
  customExercises: Exercise[];
  targets: Targets;
  profile: Profile;
  timer: Timer;
  pushSub: PushSubscriptionJSON | null;
};

const DEFAULT: State = {
  entries: [],
  customFoods: [],
  recentFoodIds: [],
  workouts: [],
  active: null,
  customExercises: [],
  targets: { kcal: 2400, p: 150, c: 270, f: 75 },
  profile: { goal: "maintien", defaultRest: 90 },
  timer: null,
  pushSub: null,
};

const KEY = "fitthali:v1";

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    /* stockage indisponible */
  }
  return DEFAULT;
}

type Ctx = { s: State; set: (fn: (s: State) => State) => void };
const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* quota / navigation privée */
    }
  }, [s]);
  return <StoreCtx.Provider value={{ s, set: setS }}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("StoreProvider manquant");
  return ctx;
}

export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export function todayStr(d = new Date()) {
  const z = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

export function sumMacros(list: Macros[]): Macros {
  return list.reduce(
    (a, e) => ({ kcal: a.kcal + e.kcal, p: a.p + e.p, c: a.c + e.c, f: a.f + e.f, fiber: a.fiber + (e.fiber || 0) }),
    { kcal: 0, p: 0, c: 0, f: 0, fiber: 0 },
  );
}

export function scaleFood(f: Food, grams: number): Macros {
  const k = grams / 100;
  return { kcal: f.kcal * k, p: f.p * k, c: f.c * k, f: f.f * k, fiber: f.fiber * k };
}

export const r0 = (n: number) => Math.round(n);
export const r1 = (n: number) => Math.round(n * 10) / 10;

export function exportData() {
  return localStorage.getItem(KEY) || "{}";
}
export function importData(json: string) {
  const d = JSON.parse(json);
  const arrays = ["entries", "customFoods", "recentFoodIds", "workouts", "customExercises"] as const;
  if (!d || typeof d !== "object" || Array.isArray(d) || arrays.some((k) => k in d && !Array.isArray(d[k]))) {
    throw new Error("Fichier invalide");
  }
  localStorage.setItem(KEY, json);
  location.reload();
}
