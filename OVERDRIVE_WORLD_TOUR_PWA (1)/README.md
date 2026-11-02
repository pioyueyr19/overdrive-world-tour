# OVERDRIVE: WORLD TOUR — Playable Prototype

A landscape-first, cross-platform browser racing prototype for Android/iOS browsers and desktop browsers.

## Run
- Open `index.html` in a modern browser.
- For best results, serve the folder over HTTP (e.g. `python -m http.server 8000`) because browser security rules vary for local files.
- Controls: WASD / arrow keys, Space handbrake, C camera, R reset.
- Mobile: landscape orientation recommended; on-screen steering, throttle, brake and handbrake.

## Scope
This is a real playable source prototype, not a finished commercial game. It includes a 3D track, chase/cockpit camera toggle, vehicle handling, drift-like rear slip, collision response, lap timing, checkpoint progression, traffic obstacles, responsive touch controls, and a HUD.
It uses Three.js from a CDN, so the first launch needs internet access. Replace the procedural car/track assets with licensed production assets and test performance on target devices before release.


## Install as an app (PWA)
1. Upload the contents of this folder to an HTTPS static host (for example GitHub Pages or Netlify).
2. Open the hosted address in Chrome on Android.
3. Open Chrome's menu and choose "Install app" or "Add to Home screen".
4. On desktop Chrome/Edge, use the install icon in the address bar or the browser menu.

A ZIP opened directly from the phone's Downloads folder cannot be installed as a PWA; it must be served from an HTTPS website first. This package is not an APK.
