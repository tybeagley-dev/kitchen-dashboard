# Kitchen Dashboard

A family dashboard for a kitchen iPad. Kids see their daily routines, spin a chore wheel to earn Beagley Bucks, and bank screen time. Parents manage everything from a PIN-gated parent panel — chores, routines, meals, announcements, and balance adjustments — without touching code.

**Live site:** `https://<your-github-username>.github.io/kitchen-dashboard/`

---

## Features

- **Routines** — per-child morning/evening checklists, filtered by schedule (school day, weekend, summer, holiday)
- **Chore wheel** — spin to get assigned chores; earn Beagley Bucks and screen time
- **Beagley Bucks** — tracked per child in Google Sheets; adjustable by parents
- **Screen time** — earned by completing chores; kids trade bucks for extra minutes; countdown timer built in
- **Meal plan** — weekly dinner (and summer lunch) plan, editable from the parent panel
- **Family notes** — announcements shown on the dashboard, managed by parents
- **Grocery list** — add/remove items with a share button
- **Calendar** — reads iCal/CalDAV feeds (iCloud, Google Calendar, etc.)
- **Weather** — current conditions + 8-hour forecast + 7-day outlook via Open-Meteo
- **Tidy timer** — family-wide cleanup countdown with optional Google Cast + YouTube Music
- **Toothbrush timer** — 2-minute per-child timer
- **Parent panel** — PIN-gated; manage chores, routines, meals, announcements, bucks, and screen time from any device on the network

---

## Setup

### 1. Google Sheet

Create a new Google Sheet and add the following tabs with these exact names and headers in row 1:

| Tab | Headers (row 1, in order) |
|---|---|
| `Chores` | `id \| label \| bucks \| icon \| active \| days \| frequency \| required \| instructions` |
| `Bucks` | `child \| bucks` |
| `History` | `timestamp \| child \| choreId \| choreLabel \| bucksEarned \| status` |
| `SpendHistory` | `timestamp \| child \| amount \| type` |
| `ScreenTime` | `child \| balance` |
| `Grocery` | `id \| item \| addedAt` |
| `Calendars` | `name \| url \| color` |
| `Meals` | `day \| main \| note \| lunch` |
| `Notes` | `id \| text` |
| `RoutineLog` | `date \| state` |
| `Announcements` | `id \| text` |
| `RoutineDefs` | `id \| child \| label \| icon \| schedules \| time \| sortOrder` |

**Pre-populate these tabs with one row per child** (the script updates the values but expects the rows to exist):

`Bucks`:
```
Paige | 0
Nolan | 0
Jonah | 0
```

`ScreenTime`:
```
Paige | 0
Nolan | 0
Jonah | 0
```

`Meals` — one row per day:
```
Sunday    | (leave blank)
Monday    | (leave blank)
...
Saturday  | (leave blank)
```

### 2. Apps Script

1. In your Google Sheet: **Extensions → Apps Script**
2. Delete any existing code and paste the entire contents of `scripts/appsscript.gs`
3. Save the project
4. **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the deployment URL — you'll need it in the next step

> **Important:** Every time you edit `appsscript.gs`, you must create a **new deployment** (not update the existing one) and update the `VITE_APPS_SCRIPT_URL` secret with the new URL.

### 3. GitHub Secrets

In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**

| Secret name | Value |
|---|---|
| `VITE_APPS_SCRIPT_URL` | The Web App URL from step 2 |
| `VITE_PARENT_PIN` | A 6-digit PIN for the parent panel |

### 4. GitHub Pages

In your GitHub repo: **Settings → Pages**
- Source: **GitHub Actions**

Push to `main` — the Actions workflow builds and deploys automatically. The dashboard will be live at `https://<your-username>.github.io/kitchen-dashboard/`.

---

## Configuration

Edit `src/config/config.js` to customize the dashboard for your family. No Sheets changes needed for these:

```js
// Family name shown in the header greeting
familyName: 'Beagley Fam',

// Children — name, card color, avatar emoji
children: [
  { name: 'Paige', color: '#f51bf1', emoji: '🐱' },
  { name: 'Nolan', color: '#3e3ee6', emoji: '🧑🏼‍🚀' },
  { name: 'Jonah', color: '#029602', emoji: '⚾️' },
],

// Weather — find lat/lon at latlong.net
weather: { lat: 40.31, lon: -112.01, label: 'Eagle Mountain' },

// School year schedule — drives which routines appear
schedules: {
  summer: { start: '2026-06-12', end: '2026-08-23' },
  breaks: [ /* holidays */ ],
},

// Screen time settings
screenTime: {
  minutesPerChore: 30,      // minutes awarded per chore buck
  timerBufferMinutes: 35,   // countdown duration when timer starts
},
```

Routines, meals, announcements, and chores are all manageable from the parent panel once the Sheets are set up.

---

## Calendar Setup

To show family events, add iCal feed URLs to the `Calendars` tab in your Sheet:

| name | url | color |
|---|---|---|
| Family | `webcal://...` | `#C17A4A` |

iCloud: **Calendar app → share icon → Copy Link** (change `webcal://` to `https://` — the script handles either).
Google: **Calendar settings → Integrations → Secret address in iCal format**.

Events are cached for 15 minutes in Apps Script to avoid rate limits.

---

## Local Development

```bash
npm install
```

Create a `.env.local` file:
```
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
VITE_PARENT_PIN=123456
```

```bash
npm run dev
```

The dashboard runs at `http://localhost:5173/kitchen-dashboard/`. Without a Sheets URL it runs in demo mode with local storage only.

---

## Parent Panel

Tap the **⚙️** button in the header. Requires the 6-digit parent PIN.

| Tab | What you can do |
|---|---|
| Bucks & Time | Adjust Beagley Bucks and screen time balance for any child |
| Chores | Add, edit, or remove chores from the spin wheel |
| Routines | Add, edit, or remove routine items per child (saves to `RoutineDefs` sheet) |
| Meals | Edit the weekly meal plan; add or remove family notes |

> Routines added in the parent panel are loaded from Sheets. Until you add any, the dashboard falls back to the routines defined in `config.js`.

---

## Chore Days and Screen Time Rules

- **Sunday:** No chores — the spin button and required chores are hidden
- **Saturday:** Chores earn Beagley Bucks only — no screen time awarded
- **Weekdays/other:** Chores earn both Beagley Bucks and screen time

These rules are enforced in `src/components/ChildCard.jsx`.
