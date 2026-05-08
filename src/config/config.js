// ─────────────────────────────────────────────────────────────────────────────
// FAMILY DASHBOARD CONFIG
// Edit this file to customize everything about the dashboard.
// ─────────────────────────────────────────────────────────────────────────────

export const CONFIG = {

  // ── Family ─────────────────────────────────────────────────────────────────
  familyName: 'Beagley Fam',

  // ── Children ───────────────────────────────────────────────────────────────
  // color: used for the avatar background and card accent
  // emoji: shown in the avatar (until you add a real photo)
  children: [
    { name: 'Paige',   color: '#f51bf1', emoji: '🐱' },
    { name: 'Nolan',   color: '#3e3ee6', emoji: '🧑🏼‍🚀' },
    { name: 'Jonah',  color: '#029602', emoji: '🐶' }, // ← update name & emoji
  ],

  // ── Weather ────────────────────────────────────────────────────────────────
  // Find your lat/lon at https://www.latlong.net
  weather: {
    lat: 40.310871,
    lon: -112.012589,
    label: 'Eagle Mountain',
  },

  // ── Schedule Modes ─────────────────────────────────────────────────────────
  // The dashboard auto-detects which mode today falls into and shows the
  // matching routines. Dates are YYYY-MM-DD strings (inclusive on both ends).
  schedules: {
    summer: { start: '2026-06-12', end: '2026-08-23' },
    breaks: [
      { name: 'Winter Break',    start: '2025-12-23', end: '2026-01-05' },
      { name: 'Spring Break',    start: '2026-03-30', end: '2026-04-05' },
      { name: 'Thanksgiving',    start: '2026-11-26', end: '2026-11-29' },
      { name: 'MLK Day',         start: '2026-01-19', end: '2026-01-19' },
      { name: 'Presidents Day',  start: '2026-02-16', end: '2026-02-16' },
      { name: 'Memorial Day',    start: '2026-05-25', end: '2026-05-25' },
    ],
  },

  // ── Routines ───────────────────────────────────────────────────────────────
  // schedules array: which modes the routine appears on.
  // Options: 'school'  → weekdays during the school year
  //          'weekend' → Saturday & Sunday
  //          'summer'  → within the summer date range above
  //          'holiday' → within any break date range above
  routines: {
    Paige: [
      { id: 'e-bed',      label: 'Make bed',          icon: '🛏️', schedules: ['school', 'weekend', 'summer', 'holiday'] },
      { id: 'e-lunch',    label: 'Pack lunch',         icon: '🥪', schedules: ['school'] },
      { id: 'e-shoes',    label: 'Shoes & socks on',   icon: '👟', schedules: ['school'] },
      { id: 'e-backpack', label: 'Backpack ready',     icon: '🎒', schedules: ['school'] },
      { id: 'e-homework', label: 'Homework done',      icon: '📚', schedules: ['school'] },
      { id: 'e-piano',    label: 'Piano practice',     icon: '🎹', schedules: ['school', 'weekend'] },
      { id: 'e-reading',  label: 'Free reading',       icon: '📖', schedules: ['summer', 'holiday', 'weekend'] },
      { id: 'e-screen',   label: 'Screen-free morning',icon: '📵', schedules: ['summer', 'holiday'] },
    ],
    Nolan: [
      { id: 'l-bed',      label: 'Make bed',           icon: '🛏️', schedules: ['school', 'weekend', 'summer', 'holiday'] },
      { id: 'l-dog',      label: 'Feed the dog',       icon: '🐕', schedules: ['school', 'weekend', 'summer', 'holiday'] },
      { id: 'l-lunch',    label: 'Pack lunch',         icon: '🥪', schedules: ['school'] },
      { id: 'l-backpack', label: 'Backpack put away',  icon: '🎒', schedules: ['school'] },
      { id: 'l-homework', label: 'Homework done',      icon: '📚', schedules: ['school'] },
      { id: 'l-outside',  label: 'Outside time',       icon: '🌳', schedules: ['summer', 'holiday', 'weekend'] },
    ],
    // ← rename key to match the child's name above, then add their routines
    'Jonah': [
      { id: 'k3-bed',      label: 'Make bed',       icon: '🛏️', schedules: ['school', 'weekend', 'summer', 'holiday'] },
      { id: 'k3-lunch',    label: 'Pack lunch',     icon: '🥪', schedules: ['school'] },
      { id: 'k3-backpack', label: 'Backpack ready', icon: '🎒', schedules: ['school'] },
      { id: 'k3-homework', label: 'Homework done',  icon: '📚', schedules: ['school'] },
    ],
  },

  // ── Chores (Spinning Wheel) ─────────────────────────────────────────────────
  // Chore completion awards Beagley Bucks (BB).
  // If appsScriptUrl is empty, demoChores are used and BB are stored locally.
  // See scripts/appsscript.gs for how to connect a Google Sheet.
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbxpTfLj9EfcEvzeq8nlY7WxTGeOgKp6PLcyli6GGjPUivq5YszQb4q4hKOx06MaJYTRpQ/exec',  // ← paste your deployed Apps Script URL here

  demoChores: [
    { id: 'c1', label: 'Clean bathroom',          icon: '🚿', bucks: 10 },
    { id: 'c2', label: 'Vacuum living room',      icon: '🌀', bucks: 8  },
    { id: 'c3', label: 'Empty all trash',         icon: '🗑️', bucks: 6  },
    { id: 'c4', label: 'Wipe down counters',      icon: '✨', bucks: 5  },
    { id: 'c5', label: 'Sweep porch',             icon: '🧹', bucks: 6  },
    { id: 'c6', label: 'Unload dishwasher',       icon: '🍽️', bucks: 5  },
    { id: 'c7', label: 'Fold & put away laundry', icon: '👕', bucks: 8  },
    { id: 'c8', label: 'Water the plants',        icon: '🌿', bucks: 4  },
  ],

  // ── Calendar Events ────────────────────────────────────────────────────────
  // Add upcoming family events here. Format: YYYY-MM-DD.
  // color is optional — defaults to the accent color.
  events: [
    { date: '2026-05-09', title: 'Soccer Practice',    time: '4:00 PM',  color: '#C17A4A' },
    { date: '2026-05-10', title: 'Piano — Emma',       time: '10:00 AM', color: '#9B6B8F' },
    { date: '2026-05-12', title: 'Library books due',  time: '',         color: '#6B8F71' },
    { date: '2026-05-14', title: 'Dentist — Liam',     time: '2:30 PM',  color: '#6B82A0' },
    { date: '2026-05-16', title: 'Soccer Game',        time: '11:00 AM', color: '#C17A4A' },
  ],

  // ── Meal Plan ──────────────────────────────────────────────────────────────
  // Keys must match JS day names: Sunday Monday Tuesday Wednesday Thursday Friday Saturday
  meals: {
    Sunday:    { main: 'Roast Chicken',           note: 'with roasted veggies' },
    Monday:    { main: 'Spaghetti Bolognese',     note: 'garlic bread on the side' },
    Tuesday:   { main: 'Chicken Tacos',           note: 'fish option too' },
    Wednesday: { main: 'Stir-fry & Rice',         note: 'use up the veggies' },
    Thursday:  { main: 'Grilled Cheese & Soup',   note: 'tomato bisque' },
    Friday:    { main: 'Homemade Pizza',          note: '🍕 everyone picks a topping' },
    Saturday:  { main: "Everyone's Choice",       note: 'leftovers or takeout' },
  },

  // ── Announcements ──────────────────────────────────────────────────────────
  announcements: [
    'Library books due Tuesday',
    'Soccer cleats need to be washed this weekend',
    'Grandma visits next Saturday — help clean up Friday!',
  ],

  // ── Screen Time ────────────────────────────────────────────────────────────
  // minutesPerChore: how much screen time is awarded per completed chore
  // timerBufferMinutes: countdown duration when kids choose "Start Timer"
  //   (slightly more than minutesPerChore to give them time to get set up)
  screenTime: {
    minutesPerChore: 30,
    timerBufferMinutes: 35,
  },

  // ── Parent PIN ─────────────────────────────────────────────────────────────
  // Required to confirm Beagley Bucks deductions (Mom Store, real-money exchange)
  parentPin: '052115',

  // ── Tidy Timer ─────────────────────────────────────────────────────────────
  // defaultMinutes: pre-selected duration when the popover opens
  //
  // castAppId: your Google Cast receiver App ID.
  //   Leave empty to skip Cast (tidy timer still works, just no music).
  //   Setup steps:
  //     1. Go to cast.google.com/publish → New Application → Custom Receiver
  //     2. Receiver URL: https://YOUR-USERNAME.github.io/kitchen-dashboard/cast-receiver.html
  //     3. Copy the App ID and paste it below
  //     4. Allow up to 15 min for it to propagate to your devices
  //
  // musicPlaylistUrl: a YouTube Music playlist URL
  //   e.g. 'https://music.youtube.com/playlist?list=PLxxxxxx'
  tidyTimer: {
    defaultMinutes: 10,
    castAppId: '',
    musicPlaylistUrl: 'https://www.youtube.com/watch?v=xDK6RA65Rxw&list=RDxDK6RA65Rxw&start_radio=1',
  },

}
