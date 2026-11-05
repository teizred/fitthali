/* eslint-disable @next/next/no-img-element -- images statiques (locales, CDN ou Lyfta), pas besoin de next/image */
"use client";

import { useEffect, useState } from "react";
import { demoImages, getExercise, knownLyfta, type Exercise } from "@/data/exercises";
import { lyftaCache, lyftaImage } from "@/lib/api";

/** Démo photo animée : alterne la photo de début et de fin du mouvement. */
export function ExerciseDemo({ exId, name }: { exId: string; name: string }) {
  const imgs = demoImages(exId);
  if (!imgs) return <div className="muted small">Pas de démo disponible pour cet exercice.</div>;
  return (
    <div className="demo" role="img" aria-label={`Démonstration : ${name}`}>
      <img src={imgs[0]} alt="" crossOrigin="anonymous" />
      <img src={imgs[1]} alt="" crossOrigin="anonymous" />
    </div>
  );
}

/** Illustration Lyfta : url null = en cours, "" = introuvable ; err = message si l'appel a échoué. */
function useLyftaImage(ex: Exercise) {
  const query = ex.en || ex.name;
  const known = knownLyfta(ex.id);
  const [state, setState] = useState<{ id: string; url: string | null; err?: string }>({ id: "", url: null });
  useEffect(() => {
    if (known !== undefined) return; // déjà dans la liste générée : pas d'appel API
    let alive = true;
    lyftaImage(ex.id, query)
      .then((url) => alive && setState({ id: ex.id, url }))
      .catch((e: Error) => alive && setState({ id: ex.id, url: "", err: e.message }));
    return () => {
      alive = false;
    };
  }, [ex.id, query, known]);
  if (known !== undefined) return { url: known, err: undefined };
  return state.id === ex.id ? state : { url: null, err: undefined };
}

/** Visuel d'un exercice : illustration Lyfta en priorité, photos animées en secours ou sur demande. */
export function ExerciseVisual({ ex }: { ex: Exercise }) {
  const { url, err } = useLyftaImage(ex);
  const [photos, setPhotos] = useState(false);
  if (url === null) return <div className="lyfta loading" />;
  if (!url)
    return (
      <>
        {err && <div className="muted small">Illustration Lyfta indisponible : {err}</div>}
        <ExerciseDemo exId={ex.id} name={ex.name} />
      </>
    );
  return (
    <>
      <div className="lyfta">
        <img src={url} alt={`Illustration : ${ex.name}`} referrerPolicy="no-referrer" />
      </div>
      {demoImages(ex.id) && (
        <button className="ghost small" onClick={() => setPhotos(!photos)}>{photos ? "Masquer les photos" : "Voir en photos"}</button>
      )}
      {photos && <ExerciseDemo exId={ex.id} name={ex.name} />}
    </>
  );
}

/** Même chose à partir d'un id (séance en cours). */
export function ExerciseVisualById({ exId, name }: { exId: string; name: string }) {
  const ex = getExercise(exId) ?? { id: exId, name, muscle: "", equip: "" };
  return <ExerciseVisual ex={ex} />;
}

/** Miniature pour les listes : illustration Lyfta si déjà chargée, sinon photo de départ. */
export function ExerciseThumb({ exId }: { exId: string }) {
  const [lyfta] = useState(() => knownLyfta(exId) || lyftaCache()[exId] || "");
  if (lyfta) return <img className="thumb thumb-lyfta" src={lyfta} alt="" loading="lazy" referrerPolicy="no-referrer" />;
  const imgs = demoImages(exId);
  return imgs ? <img className="thumb" src={imgs[0]} alt="" loading="lazy" crossOrigin="anonymous" /> : <div className="thumb" />;
}
