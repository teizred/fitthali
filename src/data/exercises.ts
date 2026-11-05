import { EXTRA, FEDB_CDN } from "./exercises-extra";
// id d'exercice -> URL de l'illustration Lyfta ("" = cherché, introuvable). Généré une fois via l'API perso.
import LYFTA from "./lyfta-images.json";

const LYFTA_IMAGES: Record<string, string> = LYFTA;
/** Illustration Lyfta connue : URL, "" si introuvable, undefined si jamais cherchée. */
export const knownLyfta = (exId: string): string | undefined => LYFTA_IMAGES[exId];

export type Exercise = { id: string; name: string; muscle: string; equip: string; custom?: boolean; demo?: string; en?: string };

const raw: [string, string, string][] = [
  // Pectoraux
  ["Développé couché", "Pectoraux", "Barre"],
  ["Développé incliné", "Pectoraux", "Barre"],
  ["Développé couché haltères", "Pectoraux", "Haltères"],
  ["Développé incliné haltères", "Pectoraux", "Haltères"],
  ["Développé décliné", "Pectoraux", "Barre"],
  ["Chest press", "Pectoraux", "Machine"],
  ["Chest press incliné", "Pectoraux", "Machine"],
  ["Pec deck / butterfly", "Pectoraux", "Machine"],
  ["Écarté poulie vis-à-vis", "Pectoraux", "Poulie"],
  ["Écarté haltères", "Pectoraux", "Haltères"],
  ["Dips", "Pectoraux", "Poids du corps"],
  ["Pompes", "Pectoraux", "Poids du corps"],
  ["Développé couché Smith", "Pectoraux", "Smith"],
  // Dos
  ["Tractions", "Dos", "Poids du corps"],
  ["Tractions assistées", "Dos", "Machine"],
  ["Tirage vertical", "Dos", "Poulie"],
  ["Tirage vertical prise serrée", "Dos", "Poulie"],
  ["Tirage horizontal (rowing assis)", "Dos", "Poulie"],
  ["Rowing barre", "Dos", "Barre"],
  ["Rowing haltère unilatéral", "Dos", "Haltères"],
  ["Rowing machine", "Dos", "Machine"],
  ["T-bar row", "Dos", "Machine"],
  ["Pull-over poulie", "Dos", "Poulie"],
  ["Soulevé de terre", "Dos", "Barre"],
  ["Lombaires (extension)", "Dos", "Machine"],
  ["Shrugs", "Dos", "Haltères"],
  // Épaules
  ["Développé militaire", "Épaules", "Barre"],
  ["Développé épaules haltères", "Épaules", "Haltères"],
  ["Shoulder press", "Épaules", "Machine"],
  ["Élévations latérales", "Épaules", "Haltères"],
  ["Élévations latérales poulie", "Épaules", "Poulie"],
  ["Élévations latérales machine", "Épaules", "Machine"],
  ["Oiseau (arrière d'épaule)", "Épaules", "Haltères"],
  ["Reverse pec deck", "Épaules", "Machine"],
  ["Face pull", "Épaules", "Poulie"],
  ["Rowing menton", "Épaules", "Barre"],
  // Bras
  ["Curl barre", "Biceps", "Barre"],
  ["Curl barre EZ", "Biceps", "Barre"],
  ["Curl haltères", "Biceps", "Haltères"],
  ["Curl marteau", "Biceps", "Haltères"],
  ["Curl incliné", "Biceps", "Haltères"],
  ["Curl pupitre", "Biceps", "Machine"],
  ["Curl poulie", "Biceps", "Poulie"],
  ["Extension triceps poulie (corde)", "Triceps", "Poulie"],
  ["Extension triceps poulie (barre)", "Triceps", "Poulie"],
  ["Barre au front", "Triceps", "Barre"],
  ["Extension nuque haltère", "Triceps", "Haltères"],
  ["Dips machine", "Triceps", "Machine"],
  ["Développé couché prise serrée", "Triceps", "Barre"],
  ["Kickback", "Triceps", "Haltères"],
  // Jambes
  ["Squat", "Quadriceps", "Barre"],
  ["Front squat", "Quadriceps", "Barre"],
  ["Squat Smith", "Quadriceps", "Smith"],
  ["Hack squat", "Quadriceps", "Machine"],
  ["Presse à cuisses", "Quadriceps", "Machine"],
  ["Leg extension", "Quadriceps", "Machine"],
  ["Fentes", "Quadriceps", "Haltères"],
  ["Fentes bulgares", "Quadriceps", "Haltères"],
  ["Goblet squat", "Quadriceps", "Haltères"],
  ["Soulevé de terre roumain", "Ischios", "Barre"],
  ["Leg curl allongé", "Ischios", "Machine"],
  ["Leg curl assis", "Ischios", "Machine"],
  ["Good morning", "Ischios", "Barre"],
  ["Hip thrust", "Fessiers", "Barre"],
  ["Hip thrust machine", "Fessiers", "Machine"],
  ["Abducteurs", "Fessiers", "Machine"],
  ["Adducteurs", "Fessiers", "Machine"],
  ["Kickback fessier poulie", "Fessiers", "Poulie"],
  ["Mollets debout", "Mollets", "Machine"],
  ["Mollets assis", "Mollets", "Machine"],
  ["Mollets presse", "Mollets", "Machine"],
  // Abdos
  ["Crunch", "Abdos", "Poids du corps"],
  ["Crunch poulie", "Abdos", "Poulie"],
  ["Crunch machine", "Abdos", "Machine"],
  ["Relevés de jambes suspendu", "Abdos", "Poids du corps"],
  ["Gainage (planche)", "Abdos", "Poids du corps"],
  ["Russian twist", "Abdos", "Poids du corps"],
  ["Roulette abdos", "Abdos", "Poids du corps"],
  // Cardio
  ["Tapis de course", "Cardio", "Machine"],
  ["Vélo", "Cardio", "Machine"],
  ["Elliptique", "Cardio", "Machine"],
  ["Rameur", "Cardio", "Machine"],
  ["Stairmaster", "Cardio", "Machine"],
  ["Corde à sauter", "Cardio", "Poids du corps"],
];

// Photos de démonstration (début / fin du mouvement), issues de free-exercise-db (domaine public,
// github.com/yuhonas/free-exercise-db), stockées dans public/exercises/<id>-0.jpg et -1.jpg.
const DEMOS: Record<string, string> = {
  "Développé couché": "Barbell_Bench_Press_-_Medium_Grip",
  "Développé incliné": "Barbell_Incline_Bench_Press_-_Medium_Grip",
  "Développé couché haltères": "Dumbbell_Bench_Press",
  "Développé incliné haltères": "Incline_Dumbbell_Press",
  "Développé décliné": "Decline_Barbell_Bench_Press",
  "Chest press": "Leverage_Chest_Press",
  "Chest press incliné": "Leverage_Incline_Chest_Press",
  "Pec deck / butterfly": "Butterfly",
  "Écarté poulie vis-à-vis": "Cable_Crossover",
  "Écarté haltères": "Dumbbell_Flyes",
  "Dips": "Dips_-_Chest_Version",
  "Pompes": "Pushups",
  "Développé couché Smith": "Smith_Machine_Bench_Press",
  "Tractions": "Pullups",
  "Tractions assistées": "Band_Assisted_Pull-Up",
  "Tirage vertical": "Wide-Grip_Lat_Pulldown",
  "Tirage vertical prise serrée": "Close-Grip_Front_Lat_Pulldown",
  "Tirage horizontal (rowing assis)": "Seated_Cable_Rows",
  "Rowing barre": "Bent_Over_Barbell_Row",
  "Rowing haltère unilatéral": "One-Arm_Dumbbell_Row",
  "Rowing machine": "Leverage_Iso_Row",
  "T-bar row": "T-Bar_Row_with_Handle",
  "Pull-over poulie": "Straight-Arm_Pulldown",
  "Soulevé de terre": "Barbell_Deadlift",
  "Lombaires (extension)": "Hyperextensions_Back_Extensions",
  "Shrugs": "Dumbbell_Shrug",
  "Développé militaire": "Standing_Military_Press",
  "Développé épaules haltères": "Dumbbell_Shoulder_Press",
  "Shoulder press": "Machine_Shoulder_Military_Press",
  "Élévations latérales": "Side_Lateral_Raise",
  "Élévations latérales poulie": "Standing_Low-Pulley_Deltoid_Raise",
  "Oiseau (arrière d'épaule)": "Seated_Bent-Over_Rear_Delt_Raise",
  "Reverse pec deck": "Reverse_Machine_Flyes",
  "Face pull": "Face_Pull",
  "Rowing menton": "Upright_Barbell_Row",
  "Curl barre": "Barbell_Curl",
  "Curl barre EZ": "EZ-Bar_Curl",
  "Curl haltères": "Dumbbell_Bicep_Curl",
  "Curl marteau": "Hammer_Curls",
  "Curl incliné": "Incline_Dumbbell_Curl",
  "Curl pupitre": "Machine_Preacher_Curls",
  "Curl poulie": "Standing_Biceps_Cable_Curl",
  "Extension triceps poulie (corde)": "Triceps_Pushdown_-_Rope_Attachment",
  "Extension triceps poulie (barre)": "Triceps_Pushdown",
  "Barre au front": "EZ-Bar_Skullcrusher",
  "Extension nuque haltère": "Standing_Dumbbell_Triceps_Extension",
  "Dips machine": "Dip_Machine",
  "Développé couché prise serrée": "Close-Grip_Barbell_Bench_Press",
  "Kickback": "Tricep_Dumbbell_Kickback",
  "Squat": "Barbell_Squat",
  "Front squat": "Front_Barbell_Squat",
  "Squat Smith": "Smith_Machine_Squat",
  "Hack squat": "Hack_Squat",
  "Presse à cuisses": "Leg_Press",
  "Leg extension": "Leg_Extensions",
  "Fentes": "Dumbbell_Lunges",
  "Fentes bulgares": "Split_Squat_with_Dumbbells",
  "Goblet squat": "Goblet_Squat",
  "Soulevé de terre roumain": "Romanian_Deadlift",
  "Leg curl allongé": "Lying_Leg_Curls",
  "Leg curl assis": "Seated_Leg_Curl",
  "Good morning": "Good_Morning",
  "Hip thrust": "Barbell_Hip_Thrust",
  "Abducteurs": "Thigh_Abductor",
  "Adducteurs": "Thigh_Adductor",
  "Kickback fessier poulie": "One-Legged_Cable_Kickback",
  "Mollets debout": "Standing_Calf_Raises",
  "Mollets assis": "Seated_Calf_Raise",
  "Mollets presse": "Calf_Press_On_The_Leg_Press_Machine",
  "Crunch": "Crunches",
  "Crunch poulie": "Cable_Crunch",
  "Crunch machine": "Ab_Crunch_Machine",
  "Relevés de jambes suspendu": "Hanging_Leg_Raise",
  "Gainage (planche)": "Plank",
  "Russian twist": "Russian_Twist",
  "Roulette abdos": "Ab_Roller",
  "Tapis de course": "Running_Treadmill",
  "Vélo": "Bicycling_Stationary",
  "Elliptique": "Elliptical_Trainer",
  "Rameur": "Rowing_Stationary",
  "Stairmaster": "Stairmaster",
  "Corde à sauter": "Rope_Jumping",
};

// `demo` = préfixe d'URL des photos : `${demo}0.jpg` (début) et `${demo}1.jpg` (fin).
export const EXERCISES: Exercise[] = [
  // Exercices de base (ids figés : ils sont référencés par l'historique des séances), photos locales.
  ...raw.map(([name, muscle, equip], i) => ({
    id: "ex" + i,
    name,
    muscle,
    equip,
    demo: DEMOS[name] ? `/exercises/${DEMOS[name]}-` : undefined,
    en: DEMOS[name]?.replace(/_/g, " "), // nom anglais pour chercher l'illustration Lyfta
  })),
  // Bibliothèque étendue (noms d'origine en anglais), photos via CDN.
  ...EXTRA.map(([id, name, muscle, equip]) => ({ id: "fe-" + id, name, muscle, equip, demo: `${FEDB_CDN}/${id}/`, en: name })),
];

const BY_ID = new Map(EXERCISES.map((e) => [e.id, e]));
export const getExercise = (id: string) => BY_ID.get(id);

/** Photos de démo d'un exercice (début, fin), si disponibles. */
export function demoImages(exId: string): [string, string] | null {
  const demo = BY_ID.get(exId)?.demo;
  return demo ? [`${demo}0.jpg`, `${demo}1.jpg`] : null;
}

export const MUSCLES = ["Pectoraux", "Dos", "Épaules", "Biceps", "Triceps", "Avant-bras", "Quadriceps", "Ischios", "Fessiers", "Mollets", "Abdos", "Cardio"];
export const EQUIPMENT = ["Barre", "Haltères", "Machine", "Poulie", "Smith", "Poids du corps", "Kettlebell"];
