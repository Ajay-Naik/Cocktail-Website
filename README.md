<img width="1624" height="881" alt="Screenshot 2026-06-12 122618" src="https://github.com/user-attachments/assets/e116b3c4-fd1d-44e2-9ee5-453d136a61de" /><img width="1624" height="881" alt="Screenshot 2026-06-12 122618" src="https://github.com/user-attachments/assets/06724e38-5bc0-482a-99c4-b03ce2f1462a" /><img width="1915" height="1095" alt="Screenshot 2026-06-12 122246" src="https://github.com/user-attachments/assets/2e6dc299-e8af-47e6-bbde-8b33652d7cae" /># 🍹 The Cocktail Lab

> Sip, Shake & Discover — Cocktails Made Easy.

A cocktail discovery web app that lets users search, filter, and save their favourite drink recipes — powered by the free TheCocktailDB API.

**Live Demo → [ajay-naik.github.io/Cocktail-Website](https://ajay-naik.github.io/Cocktail-Website/)**

---

## Features

- **Search** by cocktail name or ingredient in real time
- **Filter by category** — Cocktail, Ordinary Drink, Shot, Punch/Party Drink, Beer, Soft Drink
- **Search** by cocktail name or ingredient in real time
- **View full recipe** in a modal — ingredients, method, glass type, and tags
- **Copy recipe** to clipboard with one click
- **Save favourites** — persisted in localStorage, survives page refresh
- **Progressive loading** — initial drinks appear instantly, rest load in background

---

## Screenshots

| Home | Search | Favourites |
|------|--------|------------|
| ![Home](![Uploading Screenshot 2026-06-12 122246.png…]) | ![Search]![Uploading Screenshot 2026-06-12 122618.png…] | ![Favourites]![Uploading Screenshot 2026-06-12 122618.png…] |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, Vanilla JavaScript |
| API | [TheCocktailDB](https://www.thecocktaildb.com/api.php) (free tier) |
| Storage | localStorage (favourites) |
| Hosting | GitHub Pages |

---

## How It Works

1. On load, the app fetches cocktails from TheCocktailDB by alphabet — first loading `m`, `g`, `s` for fast initial render, then lazily loading the remaining letters in the background
2. Each card displays the drink image, category badge, truncated instructions, and ingredient tags
3. Clicking **View Recipe** opens a modal with full ingredients list and step-by-step method
4. Clicking **♥** saves the drink to localStorage; the Favourites toggle filters to saved drinks only
5. Search queries match against name, category, description, tags, and ingredients simultaneously

---

## Project Structure

```
Cocktail-Website/
├── index.html       # App shell + card template
├── style.css        # Styling and layout
├── script.js        # API fetching, rendering, modal, favourites logic
└── logo.png         # TCL brand logo
```

---

## Known Limitations

- Not responsive — optimised for desktop only
- Relies on TheCocktailDB free tier (rate limits may apply)
- No backend — all state is client-side

---

## Built During

**Codanto Full-Stack Internship** (August – October 2025)

---

## Future Improvements

- [ ] Responsive/mobile layout
- [ ] Random cocktail button
