# ⏳ Countdown

A small, mobile-first countdown page. Give it a title, a date and a color, and it counts down the days, hours, minutes and seconds for everyone who opens the link.
Built for personal use, shared here in case it's useful to someone else.

<img width="374" height="817" alt="image" src="https://github.com/user-attachments/assets/43037ad5-f52d-465d-aabc-baeea9ca43b5" /> <img width="374" height="816" alt="image" src="https://github.com/user-attachments/assets/23471ad7-795b-428b-85f7-a6bb0014bb06" />



## Features

- Days, hours, minutes and seconds, updating every second
- Mobile-first layout that switches to a single row on wider screens
- Automatic light and dark mode
- "Change countdown" editor for title, date and color, with color presets or a custom color
- Shared settings: when anyone saves, every open page updates instantly
- Same moment for everyone: dates are stored in UTC and shown in each visitor's local time

## Tech

Plain HTML, CSS and JavaScript with no build step. Settings are stored in **Firebase Cloud Firestore** and protected with **security rules**. Hosted on **GitHub Pages**.

```
index.html       page structure and editor dialog
style.css        layout, theme and colors
script.js        countdown logic and Firestore sync
firestore.rules  database rules (paste into the Firebase console)
```

## Run your own

1. Create a Firebase project and a Firestore database.
2. Paste `firestore.rules` into **Firestore → Rules** and publish.
3. Register a web app and copy its config into the top of `script.js`.
4. Optional: set up App Check with a reCAPTCHA v3 key for your domain.
5. Push to GitHub and enable **Settings → Pages** (branch `main`, root).

To test locally, use a local server such as VS Code's Live Server. Opening `index.html` directly from disk won't load the modules.

> The Firebase `apiKey` in `script.js` is a public project identifier, not a secret. Access is controlled by the Firestore rules and App Check.
