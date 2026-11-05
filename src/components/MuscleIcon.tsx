// Icônes de groupes musculaires : silhouette grise, muscle ciblé en couleur. Dessin original (SVG).

const BODY = (
  <g className="mi-body">
    <circle cx="20" cy="6" r="4.3" />
    <rect x="18.2" y="9.6" width="3.6" height="3.2" rx="1" />
    <path d="M11 14 Q20 11 29 14 L27.2 32 L12.8 32 Z" />
    <path d="M7.2 14.5 L11 14 L10.3 26 L6.4 26 Z" />
    <path d="M32.8 14.5 L29 14 L29.7 26 L33.6 26 Z" />
    <path d="M6.4 26.6 L10.3 26.6 L9.4 37 L5.6 37 Z" />
    <path d="M33.6 26.6 L29.7 26.6 L30.6 37 L34.4 37 Z" />
    <path d="M12.8 32.6 L27.2 32.6 L27.4 37.5 L12.6 37.5 Z" />
    <path d="M12.6 38 L19.6 38 L19 49 L13.6 49 Z" />
    <path d="M27.4 38 L20.4 38 L21 49 L26.4 49 Z" />
    <path d="M13.6 49.6 L19 49.6 L18.4 58.5 L14.8 58.5 Z" />
    <path d="M26.4 49.6 L21 49.6 L21.6 58.5 L25.2 58.5 Z" />
  </g>
);

const HIGHLIGHT: Record<string, React.ReactNode> = {
  Pectoraux: (
    <>
      <ellipse cx="16.6" cy="17.6" rx="3.6" ry="2.6" />
      <ellipse cx="23.4" cy="17.6" rx="3.6" ry="2.6" />
    </>
  ),
  Dos: <path d="M12.6 15 L27.4 15 L24.4 30.5 L20 31.5 L15.6 30.5 Z" />,
  Épaules: (
    <>
      <circle cx="10.4" cy="15.4" r="2.7" />
      <circle cx="29.6" cy="15.4" r="2.7" />
    </>
  ),
  Biceps: (
    <>
      <ellipse cx="9.2" cy="20.5" rx="1.6" ry="4.2" />
      <ellipse cx="30.8" cy="20.5" rx="1.6" ry="4.2" />
    </>
  ),
  Triceps: (
    <>
      <ellipse cx="7.6" cy="20.5" rx="1.3" ry="4.4" />
      <ellipse cx="32.4" cy="20.5" rx="1.3" ry="4.4" />
    </>
  ),
  "Avant-bras": (
    <>
      <path d="M6.6 27.4 L10 27.4 L9.2 35.5 L6 35.5 Z" />
      <path d="M33.4 27.4 L30 27.4 L30.8 35.5 L34 35.5 Z" />
    </>
  ),
  Abdos: <rect x="17.4" y="21" width="5.2" height="10.5" rx="1.6" />,
  Quadriceps: (
    <>
      <path d="M13.4 39 L19.2 39 L18.7 48 L14.2 48 Z" />
      <path d="M26.6 39 L20.8 39 L21.3 48 L25.8 48 Z" />
    </>
  ),
  Ischios: (
    <>
      <path d="M15 40 L18.2 40 L17.9 48.4 L15.4 48.4 Z" />
      <path d="M25 40 L21.8 40 L22.1 48.4 L24.6 48.4 Z" />
    </>
  ),
  Fessiers: (
    <>
      <ellipse cx="16.6" cy="35.6" rx="3.6" ry="2.6" />
      <ellipse cx="23.4" cy="35.6" rx="3.6" ry="2.6" />
    </>
  ),
  Mollets: (
    <>
      <ellipse cx="16.6" cy="53" rx="1.9" ry="4" />
      <ellipse cx="23.4" cy="53" rx="1.9" ry="4" />
    </>
  ),
};

/** Icône d'un groupe musculaire (cœur pour Cardio, silhouette seule si `null`). */
export function MuscleIcon({ muscle }: { muscle: string | null }) {
  if (muscle === "Cardio") {
    return (
      <svg viewBox="0 0 40 60" className="muscle-icon" aria-hidden="true">
        <path className="mi-on" d="M20 42 C8 33 7 25 11.5 21.5 C15 19 18.6 20.6 20 23.6 C21.4 20.6 25 19 28.5 21.5 C33 25 32 33 20 42 Z" />
        <path className="mi-pulse" d="M9 31 H15 L17 27 L20.5 35 L23 30 H31" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 60" className="muscle-icon" aria-hidden="true">
      {BODY}
      <g className="mi-on">{muscle && HIGHLIGHT[muscle]}</g>
    </svg>
  );
}
