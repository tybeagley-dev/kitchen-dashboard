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
  //
  // time (optional): which half of day the routine appears.
  //   'morning' → before noon   'evening' → noon and after   omit → always
  routines: {
    Paige: [
      // Morning
      { id: 'p-bed630',    label: 'Stayed in bed till 6:30', icon: '🛏️', schedules: ['school', 'weekend', 'summer', 'holiday'], time: 'morning' },
      { id: 'p-hair',      label: 'Brush hair',              icon: '💇', schedules: ['school', 'weekend', 'summer', 'holiday'], time: 'morning' },
      { id: 'p-breakfast', label: 'Breakfast',               icon: '🥣', schedules: ['school', 'weekend', 'summer', 'holiday'], time: 'morning' },
      { id: 'p-lunch',     label: 'Pack lunch',              icon: '🥪', schedules: ['school'],                                 time: 'morning' },
      { id: 'p-reading',   label: 'Reading',                 icon: '📖', schedules: ['weekend', 'holiday', 'summer'],           time: 'morning' },
      { id: 'p-outside-m', label: 'Outside time',            icon: '🌳', schedules: ['summer', 'weekend', 'holiday'],           time: 'morning' },
      // Evening
      { id: 'p-outside-e', label: 'Outside time',            icon: '🌳', schedules: ['school'],                                 time: 'evening' },
      { id: 'p-backpack',  label: 'Backpack away',           icon: '🎒', schedules: ['school'],                                 time: 'evening' },
      { id: 'p-lunchbox',  label: 'Lunchbox in sink',        icon: '🍱', schedules: ['school'],                                 time: 'evening' },
      { id: 'p-shoes',     label: 'Shoes away',              icon: '👟', schedules: ['school', 'weekend', 'summer', 'holiday'], time: 'evening' },
      { id: 'p-clothes',   label: 'Clothes changed',         icon: '👕', schedules: ['school', 'weekend', 'summer', 'holiday'], time: 'evening' },
      { id: 'p-teeth',     label: 'Teeth flossed & brushed', icon: '🦷', schedules: ['school', 'weekend', 'summer', 'holiday'], time: 'evening' },
    ],
    Nolan: [
      // Morning
      { id: 'n-bed630',    label: 'Stayed in bed till 6:30', icon: '🛏️', schedules: ['school', 'weekend', 'summer', 'holiday'], time: 'morning' },
      { id: 'n-hair',      label: 'Brush hair',              icon: '💇', schedules: ['school', 'weekend', 'summer', 'holiday'], time: 'morning' },
      { id: 'n-breakfast', label: 'Breakfast',               icon: '🥣', schedules: ['school', 'weekend', 'summer', 'holiday'], time: 'morning' },
      { id: 'n-lunch',     label: 'Pack lunch',              icon: '🥪', schedules: ['school'],                                 time: 'morning' },
      { id: 'n-reading',   label: 'Reading',                 icon: '📖', schedules: ['weekend', 'holiday', 'summer'],           time: 'morning' },
      { id: 'n-outside-m', label: 'Outside time',            icon: '🌳', schedules: ['summer', 'weekend', 'holiday'],           time: 'morning' },
      // Evening
      { id: 'n-outside-e', label: 'Outside time',            icon: '🌳', schedules: ['school'],                                 time: 'evening' },
      { id: 'n-backpack',  label: 'Backpack away',           icon: '🎒', schedules: ['school'],                                 time: 'evening' },
      { id: 'n-lunchbox',  label: 'Lunchbox in sink',        icon: '🍱', schedules: ['school'],                                 time: 'evening' },
      { id: 'n-shoes',     label: 'Shoes away',              icon: '👟', schedules: ['school', 'weekend', 'summer', 'holiday'], time: 'evening' },
      { id: 'n-clothes',   label: 'Clothes changed',         icon: '👕', schedules: ['school', 'weekend', 'summer', 'holiday'], time: 'evening' },
      { id: 'n-teeth',     label: 'Teeth flossed & brushed', icon: '🦷', schedules: ['school', 'weekend', 'summer', 'holiday'], time: 'evening' },
    ],
    Jonah: [
      // Morning
      { id: 'jo-bed630',    label: 'Stayed in bed till 6:30', icon: '🛏️', schedules: ['school', 'weekend', 'summer', 'holiday'], time: 'morning' },
      { id: 'jo-hair',      label: 'Brush hair',              icon: '💇', schedules: ['school', 'weekend', 'summer', 'holiday'], time: 'morning' },
      { id: 'jo-breakfast', label: 'Breakfast',               icon: '🥣', schedules: ['school', 'weekend', 'summer', 'holiday'], time: 'morning' },
      { id: 'jo-lunch',     label: 'Pack lunch',              icon: '🥪', schedules: ['school'],                                 time: 'morning' },
      { id: 'jo-reading',   label: 'Reading',                 icon: '📖', schedules: ['weekend', 'holiday', 'summer'],           time: 'morning' },
      { id: 'jo-outside-m', label: 'Outside time',            icon: '🌳', schedules: ['summer', 'weekend', 'holiday'],           time: 'morning' },
      // Evening
      { id: 'jo-outside-e', label: 'Outside time',            icon: '🌳', schedules: ['school'],                                 time: 'evening' },
      { id: 'jo-backpack',  label: 'Backpack away',           icon: '🎒', schedules: ['school'],                                 time: 'evening' },
      { id: 'jo-lunchbox',  label: 'Lunchbox in sink',        icon: '🍱', schedules: ['school'],                                 time: 'evening' },
      { id: 'jo-shoes',     label: 'Shoes away',              icon: '👟', schedules: ['school', 'weekend', 'summer', 'holiday'], time: 'evening' },
      { id: 'jo-clothes',   label: 'Clothes changed',         icon: '👕', schedules: ['school', 'weekend', 'summer', 'holiday'], time: 'evening' },
      { id: 'jo-teeth',     label: 'Teeth flossed & brushed', icon: '🦷', schedules: ['school', 'weekend', 'summer', 'holiday'], time: 'evening' },
    ],
  },

  // ── Chores (Spinning Wheel) ─────────────────────────────────────────────────
  // Chore completion awards Beagley Bucks (BB).
  // If appsScriptUrl is empty, demoChores are used and BB are stored locally.
  // See scripts/appsscript.gs for how to connect a Google Sheet.
  appsScriptUrl: import.meta.env.VITE_APPS_SCRIPT_URL ?? '',  // ← paste your deployed Apps Script URL here

  demoChores: [],

  // ── Calendar Events ────────────────────────────────────────────────────────
  // Add upcoming family events here. Format: YYYY-MM-DD.
  // color is optional — defaults to the accent color.
  events: [],

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
  parentPin: import.meta.env.VITE_PARENT_PIN ?? '',

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
