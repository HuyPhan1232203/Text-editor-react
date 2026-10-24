# Signaling server

Lets browsers find each other for **Share** in Text Editor React (the y-webrtc signaling protocol). It only relays encrypted connection offers; documents never pass through it.

```bash
npm install
npm start          # PORT defaults to 4444
```

Then build the editor with `VITE_SIGNALING_URLS=wss://your-host` (comma-separated for several servers).

## Deploy on Render (free)

1. render.com → **New → Web Service** → connect this GitHub repository.
2. **Root Directory**: `signaling` · **Runtime**: Node · **Build Command**: `npm install` · **Start Command**: `npm start` · **Instance type**: Free.
3. After the deploy, open `https://<your-service>.onrender.com`: it answers `okay`.
4. In Vercel → Project → Settings → Environment Variables, add `VITE_SIGNALING_URLS` = `wss://<your-service>.onrender.com`, then redeploy.

A free Render service sleeps after about 15 minutes without traffic and takes up to a minute to wake up; the editor shows "Connecting…" meanwhile and connects once it is up.
