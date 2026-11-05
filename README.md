# FitThali (Next.js 16) – nutrition + muscu avec coach IA

- `src/app/api/*` : route handlers (analyse photo/texte et bilans via Claude, notifications push du minuteur)
- `src/lib/ai.ts`, `src/lib/push.ts` : code serveur uniquement (`server-only`)
- `src/components/*` : l'app (composants client), données dans le localStorage du téléphone
- `src/data/foods.ts` : ~250 aliments dont ~100 plats sri-lankais / sud-indiens

## Lancer

```bash
npm install
cp .env.example .env.local   # mets ta clé ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

Clés VAPID (notifications) : `npx web-push generate-vapid-keys` → `.env.local`.

## Sur l'iPhone

iOS exige HTTPS + l'app ajoutée à l'écran d'accueil (iOS 16.4+).

```bash
npm run build && npm start
ngrok http 3000
```

Ouvre l'URL https dans Safari → Partager → « Sur l'écran d'accueil » → Réglages → « Activer les notifications » → « Tester (10 s) ».

## Déploiement gratuit : Vercel + Upstash QStash

Sur Vercel, le serveur ne tourne pas en continu : chaque minuteur de repos est confié à QStash, qui rappelle `/api/push/send` (vérifié par signature) à la fin du repos.
Variables à définir sur Vercel : voir `.env.example` (`ANTHROPIC_API_KEY`, `CLAUDE_MODEL`, VAPID ×3, `APP_CODE`, QStash ×4, `APP_URL`).
Sans les variables QStash (en local), les minuteurs restent en mémoire du process Node.
