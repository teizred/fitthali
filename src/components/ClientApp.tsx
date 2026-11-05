"use client";

import dynamic from "next/dynamic";

// Toutes les données vivent dans le localStorage du téléphone : l'app est rendue uniquement côté client.
const App = dynamic(() => import("./App"), { ssr: false, loading: () => <div className="splash">FitThali</div> });

export default function ClientApp() {
  return <App />;
}
