/**
 * Family Dashboard — Google Apps Script
 *
 * SETUP INSTRUCTIONS
 * ──────────────────
 * 1. Open your Google Sheet.
 * 2. Create these six tabs named exactly:
 *
 *    Chores (row 1 = headers):
 *      id | label | bucks | icon | active
 *      c1 | Clean bathroom | 10 | 🚿 | TRUE
 *      c2 | Vacuum living room | 8 | 🌀 | TRUE
 *      (one row per chore)
 *
 *    Bucks (row 1 = headers):
 *      child | bucks
 *      Emma  | 0
 *      Liam  | 0
 *      Kid 3 | 0
 *
 *    History (row 1 = headers):
 *      timestamp | child | choreId | choreLabel | bucksEarned | status
 *      (leave empty — script fills this in)
 *      status values: "accepted" (chore spun & claimed) or "completed" (chore done)
 *      Existing rows without a status value are treated as "completed".
 *
 *    SpendHistory (row 1 = headers):
 *      timestamp | child | amount | type
 *      (leave empty — script fills this in)
 *      type is optional; "trade" marks a bucks-for-screen-time transaction
 *
 *    ScreenTime (row 1 = headers):
 *      child | balance
 *      Emma  | 0
 *      Liam  | 0
 *      Kid 3 | 0
 *
 *    Grocery (row 1 = headers):
 *      id | item | addedAt
 *      (leave empty — script fills this in)
 *
 * 3. Extensions → Apps Script → paste this entire file → Save
 * 4. Deploy → New deployment → Web app
 *      Execute as: Me
 *      Who has access: Anyone
 * 5. Copy the deployment URL → paste into src/config/config.js → appsScriptUrl
 *
 * IMPORTANT: Every time you edit this file you must create a NEW deployment
 * (not update the existing one) and paste the new URL into config.js.
 *
 * All actions use GET requests to avoid CORS pre-flight issues.
 */

const TABS = {
  CHORES:        'Chores',
  BUCKS:         'Bucks',
  HISTORY:       'History',
  SPEND_HISTORY: 'SpendHistory',
  SCREEN_TIME:   'ScreenTime',
  GROCERY:       'Grocery',
  CALENDARS:     'Calendars',
  MEALS:         'Meals',
  NOTES:         'Notes',
  ROUTINE_LOG:   'RoutineLog',
  ANNOUNCEMENTS: 'Announcements',
  ROUTINE_DEFS:  'RoutineDefs',
  MOM_STORE:     'MomStore',
  PURCHASES:     'Purchases',
}

function doGet(e) {
  const action = e.parameter.action
  let result

  try {
    if      (action === 'getChores')         result = getChores(e.parameter.includeInactive === 'true')
    else if (action === 'getBucks')          result = getBucks()
    else if (action === 'completeChore')     result = completeChore(e.parameter.child, e.parameter.choreId)
    else if (action === 'acceptChore')       result = acceptChore(e.parameter.child, e.parameter.choreId, decodeURIComponent(e.parameter.choreLabel || ''), Number(e.parameter.bucks))
    else if (action === 'getChoreState')     result = getChoreState(e.parameter.date)
    else if (action === 'adjustBucks')       result = adjustBucks(e.parameter.child, Number(e.parameter.delta))
    else if (action === 'getScreenTime')      result = getScreenTime()
    else if (action === 'addScreenTime')      result = addScreenTime(e.parameter.child, Number(e.parameter.delta))
    else if (action === 'tradeBucksForTime')  result = tradeBucksForTime(e.parameter.child, Number(e.parameter.amount), e.parameter.date)
    else if (action === 'getDailyTradeCount') result = getDailyTradeCount(e.parameter.child, e.parameter.date)
    else if (action === 'getGrocery')        result = getGrocery()
    else if (action === 'addGroceryItem')    result = addGroceryItem(e.parameter.id, e.parameter.item)
    else if (action === 'removeGroceryItem') result = removeGroceryItem(e.parameter.id)
    else if (action === 'clearGrocery')      result = clearGrocery()
    else if (action === 'getCalendarEvents') result = getCalendarEvents()
    else if (action === 'debugCalendar')     result = debugCalendar()
    else if (action === 'getMeals')          result = getMeals()
    else if (action === 'setMeal')           result = setMeal(e.parameter.day, decodeURIComponent(e.parameter.main || ''), decodeURIComponent(e.parameter.note || ''), decodeURIComponent(e.parameter.lunch || ''))
    else if (action === 'getRoutineState')   result = getRoutineState(e.parameter.date)
    else if (action === 'setRoutineItem')    result = setRoutineItem(e.parameter.date, e.parameter.key, e.parameter.value)
    else if (action === 'getNotes')          result = getNotes()
    else if (action === 'addNote')           result = addNote(e.parameter.id, decodeURIComponent(e.parameter.text || ''))
    else if (action === 'removeNote')        result = removeNote(e.parameter.id)
    else if (action === 'addChore')          result = addChore(e.parameter)
    else if (action === 'editChore')         result = editChore(e.parameter)
    else if (action === 'deleteChore')         result = deleteChore(e.parameter.id)
    else if (action === 'getAnnouncements')    result = getAnnouncements()
    else if (action === 'addAnnouncement')     result = addAnnouncement(e.parameter.id, decodeURIComponent(e.parameter.text || ''))
    else if (action === 'removeAnnouncement')  result = removeAnnouncement(e.parameter.id)
    else if (action === 'getRoutineDefs')      result = getRoutineDefs()
    else if (action === 'addRoutineDef')       result = addRoutineDef(e.parameter)
    else if (action === 'editRoutineDef')      result = editRoutineDef(e.parameter)
    else if (action === 'deleteRoutineDef')    result = deleteRoutineDef(e.parameter.id)
    else if (action === 'getMomStore')         result = getMomStore(e.parameter.includeInactive === 'true')
    else if (action === 'addMomStoreItem')     result = addMomStoreItem(e.parameter)
    else if (action === 'editMomStoreItem')    result = editMomStoreItem(e.parameter)
    else if (action === 'deleteMomStoreItem')  result = deleteMomStoreItem(e.parameter.id)
    else if (action === 'buyMomStoreItem')     result = buyMomStoreItem(e.parameter.child, e.parameter.itemId)
    else if (action === 'getPurchases')        result = getPurchases(e.parameter.child, e.parameter.includeRedeemed === 'true')
    else if (action === 'redeemPurchase')      result = redeemPurchase(e.parameter.id)
    else result = { error: 'Unknown action: ' + action }
  } catch (err) {
    result = { error: err.message }
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name)
}

function sheetData(name) {
  const sheet = getSheet(name)
  const [headers, ...rows] = sheet.getDataRange().getValues()
  const idx = col => headers.indexOf(col)
  return { sheet, headers, rows, idx }
}

// ── Chores ────────────────────────────────────────────────────────────────────

function getChores(includeInactive) {
  const { rows, idx } = sheetData(TABS.CHORES)
  return rows
    .filter(r => r[idx('id')] !== '' && (includeInactive || r[idx('active')] === true))
    .map(r => ({
      id:           String(r[idx('id')]),
      label:        r[idx('label')],
      bucks:        Number(r[idx('bucks')]),
      icon:         r[idx('icon')] || '',
      active:       r[idx('active')] === true,
      days:         r[idx('days')] ? String(r[idx('days')]).split(',').map(d => d.trim()).filter(Boolean) : [],
      frequency:    r[idx('frequency')] || 'daily',
      required:     r[idx('required')] === true,
      instructions: r[idx('instructions')] ? String(r[idx('instructions')]).split('|').map(s => s.trim()).filter(Boolean) : [],
    }))
}

function addChore(params) {
  const { sheet, headers } = sheetData(TABS.CHORES)
  const id = 'c' + Date.now()
  const values = {
    id,
    label:        decodeURIComponent(params.label || ''),
    bucks:        Number(params.bucks) || 1,
    icon:         decodeURIComponent(params.icon || ''),
    active:       true,
    days:         decodeURIComponent(params.days || ''),
    frequency:    params.frequency || 'daily',
    required:     params.required === 'true',
    instructions: decodeURIComponent(params.instructions || ''),
  }
  const row = headers.map(h => values[h] !== undefined ? values[h] : '')
  sheet.appendRow(row)
  return { success: true, id }
}

function editChore(params) {
  if (!params.id) return { success: false, error: 'Missing id' }
  const { sheet, rows, idx } = sheetData(TABS.CHORES)
  const rowIdx = rows.findIndex(r => String(r[idx('id')]) === String(params.id))
  if (rowIdx < 0) return { success: false, error: 'Chore not found: ' + params.id }
  const updates = {
    label:        decodeURIComponent(params.label || ''),
    bucks:        Number(params.bucks) || 1,
    icon:         decodeURIComponent(params.icon || ''),
    days:         decodeURIComponent(params.days || ''),
    frequency:    params.frequency || 'daily',
    required:     params.required === 'true',
    instructions: decodeURIComponent(params.instructions || ''),
  }
  if (params.active !== undefined) updates.active = params.active === 'true'
  for (const [col, val] of Object.entries(updates)) {
    const colIdx = idx(col)
    if (colIdx >= 0) sheet.getRange(rowIdx + 2, colIdx + 1).setValue(val)
  }
  return { success: true }
}

function deleteChore(id) {
  if (!id) return { success: false, error: 'Missing id' }
  const { sheet, rows, idx } = sheetData(TABS.CHORES)
  const rowIdx = rows.findIndex(r => String(r[idx('id')]) === String(id))
  if (rowIdx < 0) return { success: false, error: 'Chore not found: ' + id }
  sheet.getRange(rowIdx + 2, idx('active') + 1).setValue(false)
  return { success: true }
}

// ── Beagley Bucks ─────────────────────────────────────────────────────────────

function getBucks() {
  const { rows, idx } = sheetData(TABS.BUCKS)
  return rows
    .filter(r => r[idx('child')] !== '')
    .map(r => ({ child: r[idx('child')], bucks: Number(r[idx('bucks')]) }))
}

function completeChore(child, choreId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()

  const { rows: choreRows, idx: cIdx } = sheetData(TABS.CHORES)
  const choreRow = choreRows.find(r => String(r[cIdx('id')]) === String(choreId))
  if (!choreRow) return { success: false, error: 'Chore not found: ' + choreId }

  const bucksEarned = Number(choreRow[cIdx('bucks')])
  const choreLabel  = choreRow[cIdx('label')]

  _addToBucks(child, bucksEarned)

  ss.getSheetByName(TABS.HISTORY).appendRow([
    new Date(), child, choreId, choreLabel, bucksEarned, 'completed'
  ])

  return { success: true, bucksEarned }
}

function acceptChore(child, choreId, choreLabel, bucks) {
  if (!child || !choreId) return { success: false, error: 'Missing params' }
  SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName(TABS.HISTORY)
    .appendRow([new Date(), child, choreId, choreLabel, bucks, 'accepted'])
  return { success: true }
}

// Returns today's chore assignment state (accepted/completed) plus this week's
// completed chore IDs — used by devices to reconcile local cache with Sheets.
//
// Response shape:
//   today:        { childName: { choreId: { choreLabel, bucks, status } } }
//   weekCompleted: { childName: [choreId, ...] }
function getChoreState(date) {
  if (!date) return { today: {}, weekCompleted: {} }

  // Week start = Monday of the given date
  const [dy, dm, dd] = date.split('-').map(Number)
  const ref = new Date(dy, dm - 1, dd)
  const dow = ref.getDay()
  const weekStartDate = new Date(ref)
  weekStartDate.setDate(ref.getDate() + (dow === 0 ? -6 : 1 - dow))
  weekStartDate.setHours(0, 0, 0, 0)

  const { rows, idx } = sheetData(TABS.HISTORY)
  const statusIdx = idx('status')
  const today = {}
  const weekCompleted = {}

  for (const row of rows) {
    const ts = row[idx('timestamp')]
    if (!ts) continue
    const rowDate = ts instanceof Date ? ts : new Date(ts)
    if (rowDate < weekStartDate) continue

    const child     = String(row[idx('child')] || '')
    const choreId   = String(row[idx('choreId')] || '')
    const choreLabel = String(row[idx('choreLabel')] || '')
    const bucks     = Number(row[idx('bucksEarned')] || 0)
    const status    = (statusIdx >= 0 && row[statusIdx]) ? String(row[statusIdx]) : 'completed'
    const rowDateKey = _routineDateKey(rowDate)

    // Today's assignments
    if (rowDateKey === date) {
      if (!today[child]) today[child] = {}
      // completed takes priority over accepted for the same choreId
      if (!today[child][choreId] || status === 'completed') {
        today[child][choreId] = { choreLabel, bucks, status }
      }
    }

    // Weekly completion tracking (for frequency filter)
    if (status === 'completed') {
      if (!weekCompleted[child]) weekCompleted[child] = []
      if (!weekCompleted[child].includes(choreId)) weekCompleted[child].push(choreId)
    }
  }

  return { today, weekCompleted }
}

function adjustBucks(child, delta) {
  if (!child || isNaN(delta) || delta === 0) {
    return { success: false, error: 'Invalid params' }
  }

  _addToBucks(child, delta)

  // Log to SpendHistory — positive delta = award, negative = deduction
  getSheet(TABS.SPEND_HISTORY).appendRow([new Date(), child, delta])

  return { success: true }
}

function _addToBucks(child, delta) {
  const { sheet, rows, idx } = sheetData(TABS.BUCKS)
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][idx('child')] === child) {
      const next = Math.max(0, Number(rows[i][idx('bucks')]) + delta)
      sheet.getRange(i + 2, idx('bucks') + 1).setValue(next)
      return
    }
  }
}

// ── Screen Time ───────────────────────────────────────────────────────────────

function getScreenTime() {
  const { rows, idx } = sheetData(TABS.SCREEN_TIME)
  return rows
    .filter(r => r[idx('child')] !== '')
    .map(r => ({ child: r[idx('child')], balance: Number(r[idx('balance')]) }))
}

function addScreenTime(child, delta) {
  if (!child || isNaN(delta)) return { success: false, error: 'Invalid params' }

  const { sheet, rows, idx } = sheetData(TABS.SCREEN_TIME)
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][idx('child')] === child) {
      const next = Math.max(0, Number(rows[i][idx('balance')]) + delta)
      sheet.getRange(i + 2, idx('balance') + 1).setValue(next)
      return { success: true, balance: next }
    }
  }
  return { success: false, error: 'Child not found: ' + child }
}

const TRADE_MINS_PER_BUCK = 10
const TRADE_DAILY_MAX     = 30  // max bucks tradeable per child per day

function getDailyTradeCount(child, date) {
  if (!child || !date) return { traded: 0, remaining: TRADE_DAILY_MAX }
  const { rows, idx } = sheetData(TABS.SPEND_HISTORY)
  const typeIdx = idx('type')
  let traded = 0
  for (const row of rows) {
    const ts = row[idx('timestamp')]
    if (!ts) continue
    if (_routineDateKey(ts instanceof Date ? ts : new Date(ts)) !== date) continue
    if (String(row[idx('child')]) !== child) continue
    if (typeIdx >= 0 && String(row[typeIdx]) === 'trade') {
      traded += Math.abs(Number(row[idx('amount')] || 0))
    }
  }
  return { traded, remaining: Math.max(0, TRADE_DAILY_MAX - traded) }
}

function tradeBucksForTime(child, amount, date) {
  if (!child || isNaN(amount) || amount <= 0) return { success: false, error: 'Invalid params' }
  const { traded } = getDailyTradeCount(child, date)
  const allowed = Math.min(amount, TRADE_DAILY_MAX - traded)
  if (allowed <= 0) return { success: false, error: 'Daily trade limit reached' }
  _addToBucks(child, -allowed)
  const stResult = addScreenTime(child, allowed * TRADE_MINS_PER_BUCK)
  getSheet(TABS.SPEND_HISTORY).appendRow([new Date(), child, -allowed, 'trade'])
  return { success: true, bucksTrade: allowed, minutesAdded: allowed * TRADE_MINS_PER_BUCK, newBalance: stResult.balance }
}

// ── Grocery ───────────────────────────────────────────────────────────────────

function getGrocery() {
  const { rows, idx } = sheetData(TABS.GROCERY)
  return rows
    .filter(r => r[idx('id')] !== '')
    .map(r => ({ id: String(r[idx('id')]), item: r[idx('item')] }))
}

function addGroceryItem(id, item) {
  if (!id || !item) return { success: false, error: 'Invalid params' }
  getSheet(TABS.GROCERY).appendRow([id, item, new Date()])
  return { success: true }
}

function removeGroceryItem(id) {
  if (!id) return { success: false, error: 'Missing id' }

  const { sheet, rows, idx } = sheetData(TABS.GROCERY)
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][idx('id')]) === String(id)) {
      sheet.deleteRow(i + 2)
      return { success: true }
    }
  }
  return { success: false, error: 'Item not found: ' + id }
}

function clearGrocery() {
  const sheet = getSheet(TABS.GROCERY)
  const lastRow = sheet.getLastRow()
  if (lastRow > 1) sheet.deleteRows(2, lastRow - 1)
  return { success: true }
}

// ── Meals ─────────────────────────────────────────────────────────────────────

function getMeals() {
  const { rows, idx } = sheetData(TABS.MEALS)
  return rows
    .filter(r => r[idx('day')] !== '')
    .map(r => ({
      day:   r[idx('day')],
      main:  r[idx('main')]  || '',
      note:  r[idx('note')]  || '',
      lunch: idx('lunch') >= 0 ? (r[idx('lunch')] || '') : '',
    }))
}

function setMeal(day, main, note, lunch) {
  if (!day) return { success: false, error: 'Missing day' }
  const { sheet, rows, idx } = sheetData(TABS.MEALS)
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][idx('day')] === day) {
      sheet.getRange(i + 2, idx('main') + 1).setValue(main)
      sheet.getRange(i + 2, idx('note') + 1).setValue(note)
      if (idx('lunch') >= 0) sheet.getRange(i + 2, idx('lunch') + 1).setValue(lunch || '')
      return { success: true }
    }
  }
  // Upsert — day row didn't exist yet (sheet should always be pre-populated)
  sheet.appendRow([day, main, note])
  return { success: true }
}

// ── Routine Log ───────────────────────────────────────────────────────────────
// RoutineLog tab columns: date | state
// state is a JSON string: {"Paige__brush-teeth":true, ...}

function _routineDateKey(val) {
  if (val instanceof Date) {
    const y = val.getFullYear()
    const m = String(val.getMonth() + 1).padStart(2, '0')
    const d = String(val.getDate()).padStart(2, '0')
    return y + '-' + m + '-' + d
  }
  return String(val)
}

function getRoutineState(date) {
  if (!date) return { date: '', completed: {} }
  const { rows, idx } = sheetData(TABS.ROUTINE_LOG)
  const row = rows.find(r => _routineDateKey(r[idx('date')]) === date)
  if (!row) return { date, completed: {} }
  try {
    return { date, completed: JSON.parse(row[idx('state')] || '{}') }
  } catch {
    return { date, completed: {} }
  }
}

function setRoutineItem(date, key, value) {
  if (!date || !key) return { success: false, error: 'Missing params' }
  const lock = LockService.getScriptLock()
  lock.waitLock(10000)
  try {
    const boolVal = value === 'true' || value === true
    const { sheet, rows, idx } = sheetData(TABS.ROUTINE_LOG)
    for (let i = 0; i < rows.length; i++) {
      if (_routineDateKey(rows[i][idx('date')]) === date) {
        let state = {}
        try { state = JSON.parse(rows[i][idx('state')] || '{}') } catch { /* ignore */ }
        state[key] = boolVal
        sheet.getRange(i + 2, idx('state') + 1).setValue(JSON.stringify(state))
        return { success: true }
      }
    }
    // First completion for this date — store date as plain text to avoid auto-conversion
    sheet.appendRow(["'" + date, JSON.stringify({ [key]: boolVal })])
    return { success: true }
  } finally {
    lock.releaseLock()
  }
}

// ── Notes ─────────────────────────────────────────────────────────────────────

function getNotes() {
  const { rows, idx } = sheetData(TABS.NOTES)
  return rows
    .filter(r => r[idx('id')] !== '')
    .map(r => ({ id: String(r[idx('id')]), text: r[idx('text')] || '' }))
}

function addNote(id, text) {
  if (!id || !text) return { success: false, error: 'Invalid params' }
  getSheet(TABS.NOTES).appendRow([id, text])
  return { success: true }
}

function removeNote(id) {
  if (!id) return { success: false, error: 'Missing id' }
  const { sheet, rows, idx } = sheetData(TABS.NOTES)
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][idx('id')]) === String(id)) {
      sheet.deleteRow(i + 2)
      return { success: true }
    }
  }
  return { success: false, error: 'Note not found: ' + id }
}

// ── Announcements ─────────────────────────────────────────────────────────────

function getAnnouncements() {
  const { rows, idx } = sheetData(TABS.ANNOUNCEMENTS)
  return rows
    .filter(r => r[idx('id')] !== '')
    .map(r => ({ id: String(r[idx('id')]), text: r[idx('text')] || '' }))
}

function addAnnouncement(id, text) {
  if (!id || !text) return { success: false, error: 'Invalid params' }
  getSheet(TABS.ANNOUNCEMENTS).appendRow([id, text])
  return { success: true }
}

function removeAnnouncement(id) {
  if (!id) return { success: false, error: 'Missing id' }
  const { sheet, rows, idx } = sheetData(TABS.ANNOUNCEMENTS)
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][idx('id')]) === String(id)) {
      sheet.deleteRow(i + 2)
      return { success: true }
    }
  }
  return { success: false, error: 'Announcement not found: ' + id }
}

// ── Routine Definitions ───────────────────────────────────────────────────────
// RoutineDefs tab columns: id | child | label | icon | schedules | time | sortOrder

function getRoutineDefs() {
  const { rows, idx } = sheetData(TABS.ROUTINE_DEFS)
  return rows
    .filter(r => r[idx('id')] !== '')
    .map(r => ({
      id:        String(r[idx('id')]),
      child:     r[idx('child')] || '',
      label:     r[idx('label')] || '',
      icon:      r[idx('icon')] || '',
      schedules: r[idx('schedules')] ? String(r[idx('schedules')]).split(',').map(s => s.trim()).filter(Boolean) : [],
      time:      r[idx('time')] || '',
      sortOrder: Number(r[idx('sortOrder')] || 0),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

function addRoutineDef(params) {
  const { sheet, headers } = sheetData(TABS.ROUTINE_DEFS)
  const id = 'r' + Date.now()
  const values = {
    id,
    child:     decodeURIComponent(params.child || ''),
    label:     decodeURIComponent(params.label || ''),
    icon:      decodeURIComponent(params.icon || ''),
    schedules: decodeURIComponent(params.schedules || ''),
    time:      params.time || '',
    sortOrder: Number(params.sortOrder || 0),
  }
  const row = headers.map(h => values[h] !== undefined ? values[h] : '')
  sheet.appendRow(row)
  return { success: true, id }
}

function editRoutineDef(params) {
  if (!params.id) return { success: false, error: 'Missing id' }
  const { sheet, rows, idx } = sheetData(TABS.ROUTINE_DEFS)
  const rowIdx = rows.findIndex(r => String(r[idx('id')]) === String(params.id))
  if (rowIdx < 0) return { success: false, error: 'Routine not found: ' + params.id }
  const updates = {
    child:     decodeURIComponent(params.child || ''),
    label:     decodeURIComponent(params.label || ''),
    icon:      decodeURIComponent(params.icon || ''),
    schedules: decodeURIComponent(params.schedules || ''),
    time:      params.time || '',
    sortOrder: Number(params.sortOrder || 0),
  }
  for (const [col, val] of Object.entries(updates)) {
    const colIdx = idx(col)
    if (colIdx >= 0) sheet.getRange(rowIdx + 2, colIdx + 1).setValue(val)
  }
  return { success: true }
}

function deleteRoutineDef(id) {
  if (!id) return { success: false, error: 'Missing id' }
  const { sheet, rows, idx } = sheetData(TABS.ROUTINE_DEFS)
  const rowIdx = rows.findIndex(r => String(r[idx('id')]) === String(id))
  if (rowIdx < 0) return { success: false, error: 'Routine not found: ' + id }
  sheet.deleteRow(rowIdx + 2)
  return { success: true }
}

// ── Mom Store ─────────────────────────────────────────────────────────────────

function getMomStore(includeInactive) {
  const { rows, idx } = sheetData(TABS.MOM_STORE)
  return rows
    .filter(r => r[idx('id')] !== '' && (includeInactive || r[idx('active')] === true))
    .map(r => ({
      id:               String(r[idx('id')]),
      label:            r[idx('label')] || '',
      icon:             r[idx('icon')] || '',
      cost:             Number(r[idx('cost')]) || 0,
      requiresApproval: r[idx('requiresApproval')] === true,
      active:           r[idx('active')] === true,
    }))
}

function addMomStoreItem(params) {
  const { sheet, headers } = sheetData(TABS.MOM_STORE)
  const id = 'ms' + Date.now()
  const values = {
    id,
    label:            decodeURIComponent(params.label || ''),
    icon:             decodeURIComponent(params.icon || ''),
    cost:             Number(params.cost) || 1,
    requiresApproval: params.requiresApproval === 'true',
    active:           true,
  }
  const row = headers.map(h => values[h] !== undefined ? values[h] : '')
  sheet.appendRow(row)
  return { success: true, id }
}

function editMomStoreItem(params) {
  if (!params.id) return { success: false, error: 'Missing id' }
  const { sheet, rows, idx } = sheetData(TABS.MOM_STORE)
  const rowIdx = rows.findIndex(r => String(r[idx('id')]) === String(params.id))
  if (rowIdx < 0) return { success: false, error: 'Item not found: ' + params.id }
  const updates = {
    label:            decodeURIComponent(params.label || ''),
    icon:             decodeURIComponent(params.icon || ''),
    cost:             Number(params.cost) || 1,
    requiresApproval: params.requiresApproval === 'true',
  }
  if (params.active !== undefined) updates.active = params.active === 'true'
  for (const [col, val] of Object.entries(updates)) {
    const colIdx = idx(col)
    if (colIdx >= 0) sheet.getRange(rowIdx + 2, colIdx + 1).setValue(val)
  }
  return { success: true }
}

function deleteMomStoreItem(id) {
  if (!id) return { success: false, error: 'Missing id' }
  const { sheet, rows, idx } = sheetData(TABS.MOM_STORE)
  const rowIdx = rows.findIndex(r => String(r[idx('id')]) === String(id))
  if (rowIdx < 0) return { success: false, error: 'Item not found: ' + id }
  sheet.getRange(rowIdx + 2, idx('active') + 1).setValue(false)
  return { success: true }
}

function buyMomStoreItem(child, itemId) {
  if (!child || !itemId) return { success: false, error: 'Missing params' }
  const { rows, idx } = sheetData(TABS.MOM_STORE)
  const item = rows.find(r => String(r[idx('id')]) === String(itemId))
  if (!item) return { success: false, error: 'Item not found: ' + itemId }
  const cost  = Number(item[idx('cost')]) || 0
  const label = item[idx('label')] || ''
  const icon  = item[idx('icon')] || ''
  _addToBucks(child, -cost)
  getSheet(TABS.SPEND_HISTORY).appendRow([new Date(), child, cost, 'momstore'])
  // Create a redeemable purchase record
  const purchaseId = 'p' + Date.now()
  const { sheet: ps, headers: ph } = sheetData(TABS.PURCHASES)
  const pv = { id: purchaseId, timestamp: new Date(), child, itemId, itemLabel: label, itemIcon: icon, cost, redeemed: false, redeemedAt: '' }
  ps.appendRow(ph.map(h => pv[h] !== undefined ? pv[h] : ''))
  return { success: true, cost, label, purchaseId }
}

function getPurchases(child, includeRedeemed) {
  const { rows, idx } = sheetData(TABS.PURCHASES)
  return rows
    .filter(r => {
      if (r[idx('id')] === '') return false
      if (child && String(r[idx('child')]) !== child) return false
      if (!includeRedeemed && r[idx('redeemed')] === true) return false
      return true
    })
    .map(r => ({
      id:         String(r[idx('id')]),
      timestamp:  r[idx('timestamp')] ? (r[idx('timestamp')] instanceof Date ? r[idx('timestamp')].toISOString() : String(r[idx('timestamp')])) : '',
      child:      String(r[idx('child')] || ''),
      itemId:     String(r[idx('itemId')] || ''),
      itemLabel:  String(r[idx('itemLabel')] || ''),
      itemIcon:   String(r[idx('itemIcon')] || ''),
      cost:       Number(r[idx('cost')] || 0),
      redeemed:   r[idx('redeemed')] === true,
    }))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

function redeemPurchase(id) {
  if (!id) return { success: false, error: 'Missing id' }
  const { sheet, rows, idx } = sheetData(TABS.PURCHASES)
  const rowIdx = rows.findIndex(r => String(r[idx('id')]) === String(id))
  if (rowIdx < 0) return { success: false, error: 'Purchase not found: ' + id }
  sheet.getRange(rowIdx + 2, idx('redeemed') + 1).setValue(true)
  sheet.getRange(rowIdx + 2, idx('redeemedAt') + 1).setValue(new Date())
  return { success: true }
}

// ── Calendars (CalDAV/iCal) ───────────────────────────────────────────────────
//
// Reads calendar URLs from the Calendars tab, fetches each iCal feed,
// parses events, and returns them merged and sorted for the next 60 days.
// Results are cached for 15 minutes to avoid hammering iCloud on every load.

function getCalendarEvents() {
  const cache = CacheService.getScriptCache()
  const cached = cache.get('cal_events')
  if (cached) return JSON.parse(cached)

  const { rows, idx } = sheetData(TABS.CALENDARS)
  const calendars = rows
    .filter(r => r[idx('url')] && String(r[idx('url')]).trim() !== '')
    .map(r => ({
      name:  String(r[idx('name')]),
      url:   String(r[idx('url')]).trim().replace(/^webcal:\/\//i, 'https://'),
      color: String(r[idx('color')] || '#C17A4A'),
    }))

  const now     = new Date()
  const cutoff  = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
  const allEvents = []

  for (const cal of calendars) {
    try {
      const res = UrlFetchApp.fetch(cal.url, { muteHttpExceptions: true })
      if (res.getResponseCode() !== 200) continue
      const parsed = _parseIcal(res.getContentText(), cal.color, now, cutoff)
      allEvents.push(...parsed)
    } catch (e) {
      // skip calendars that fail to fetch
    }
  }

  allEvents.sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))

  cache.put('cal_events', JSON.stringify(allEvents), 900) // 15 min
  return allEvents
}

function debugCalendar() {
  // Clears the cache and returns raw fetch info for the first calendar
  CacheService.getScriptCache().remove('cal_events')

  const { rows, idx } = sheetData(TABS.CALENDARS)
  const row = rows.find(r => r[idx('url')] && String(r[idx('url')]).trim() !== '')
  if (!row) return { error: 'No calendar URLs found in Calendars tab' }

  const url = String(row[idx('url')]).trim().replace(/^webcal:\/\//i, 'https://')
  try {
    const res  = UrlFetchApp.fetch(url, { muteHttpExceptions: true })
    const code = res.getResponseCode()
    const body = res.getContentText().slice(0, 1000)
    const now  = new Date()
    const cutoff = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
    const parsed = _parseIcal(res.getContentText(), '#ff0000', now, cutoff)
    return { url, httpStatus: code, rawPreview: body, parsedCount: parsed.length, firstFew: parsed.slice(0, 3) }
  } catch (e) {
    return { url, error: e.message }
  }
}

// ── iCal parser ───────────────────────────────────────────────────────────────

function _parseIcal(text, color, now, cutoff) {
  // Unfold continuation lines (RFC 5545: CRLF + whitespace = fold)
  const unfolded = text.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '')
  const lines    = unfolded.split(/\r\n|\n/)

  const events = []
  let inEvent  = false
  let props    = {}

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true
      props   = {}
    } else if (line === 'END:VEVENT') {
      inEvent = false
      const expanded = _expandEvent(props, color, now, cutoff)
      events.push(...expanded)
    } else if (inEvent) {
      const colon = line.indexOf(':')
      if (colon === -1) continue
      const keyFull = line.slice(0, colon)
      const val     = line.slice(colon + 1).replace(/\\,/g, ',').replace(/\\n/g, ' ').replace(/\\;/g, ';').replace(/\\\\/g, '\\')
      const key     = keyFull.split(';')[0].toUpperCase()
      props[key]    = val
      // Also store raw key with params for DTSTART/DTEND timezone hints
      if (!props['_raw']) props['_raw'] = {}
      props['_raw'][key] = keyFull
    }
  }

  return events
}

function _expandEvent(props, color, now, cutoff) {
  const summary = props['SUMMARY'] || '(No title)'
  const dtstart = _parseIcalDate(props['DTSTART'])
  const dtend   = _parseIcalDate(props['DTEND'])
  if (!dtstart) return []

  // Duration in ms — used to compute end time for each recurring occurrence
  const durationMs = (dtend && !dtstart.allDay)
    ? dtend.jsDate.getTime() - dtstart.jsDate.getTime()
    : 0

  const results = []

  if (props['RRULE']) {
    const occurrences = _expandRRule(dtstart, props['RRULE'], now, cutoff)
    for (const d of occurrences) {
      const endDate = durationMs > 0 ? new Date(d.getTime() + durationMs) : null
      results.push({
        date:    _fmtDate(d),
        title:   summary,
        time:    dtstart.allDay ? '' : _fmtTimeShort(d),
        endTime: endDate ? _fmtTimeShort(endDate) : '',
        color,
      })
    }
  } else {
    const d = dtstart.jsDate
    if (d >= _dayStart(now) && d < cutoff) {
      const endDate = (dtend && !dtstart.allDay) ? dtend.jsDate : null
      results.push({
        date:    _fmtDate(d),
        title:   summary,
        time:    dtstart.allDay ? '' : _fmtTimeShort(d),
        endTime: endDate ? _fmtTimeShort(endDate) : '',
        color,
      })
    }
  }

  return results
}

function _parseIcalDate(str) {
  if (!str) return null

  // All-day: 20260509
  if (/^\d{8}$/.test(str)) {
    const y = +str.slice(0,4), m = +str.slice(4,6) - 1, d = +str.slice(6,8)
    return { jsDate: new Date(y, m, d, 0, 0, 0), allDay: true }
  }

  // UTC datetime: 20260509T160000Z
  if (/^\d{8}T\d{6}Z$/.test(str)) {
    const iso = `${str.slice(0,4)}-${str.slice(4,6)}-${str.slice(6,8)}T${str.slice(9,11)}:${str.slice(11,13)}:${str.slice(13,15)}Z`
    return { jsDate: new Date(iso), allDay: false }
  }

  // Local datetime (with or without TZID param): 20260509T160000
  if (/^\d{8}T\d{6}$/.test(str)) {
    const y = +str.slice(0,4), mo = +str.slice(4,6) - 1, d = +str.slice(6,8)
    const h = +str.slice(9,11), mi = +str.slice(11,13)
    return { jsDate: new Date(y, mo, d, h, mi, 0), allDay: false }
  }

  return null
}

function _expandRRule(dtstart, rruleStr, now, cutoff) {
  const parts = {}
  rruleStr.split(';').forEach(p => {
    const [k, v] = p.split('=')
    parts[k] = v
  })

  const freq     = parts['FREQ']
  const interval = parseInt(parts['INTERVAL'] || '1', 10)
  const count    = parts['COUNT']    ? parseInt(parts['COUNT'], 10)    : Infinity
  const until    = parts['UNTIL']    ? (_parseIcalDate(parts['UNTIL'].replace('Z','')) || {}).jsDate : null
  const byDay    = parts['BYDAY']    ? parts['BYDAY'].split(',')       : null

  const windowEnd = until && until < cutoff ? until : cutoff
  const start     = new Date(dtstart.jsDate)
  const occurrences = []
  let current    = new Date(start)
  let n          = 0

  // Advance current to on/after now
  while (current < _dayStart(now)) {
    current = _advanceByFreq(current, freq, interval, byDay, start)
    if (!current) return occurrences
  }

  while (current < windowEnd && n < count) {
    occurrences.push(new Date(current))
    current = _advanceByFreq(current, freq, interval, byDay, start)
    if (!current) break
    n++
    if (n > 500) break // safety cap
  }

  return occurrences
}

function _advanceByFreq(d, freq, interval, byDay, originalStart) {
  const next = new Date(d)

  if (freq === 'DAILY') {
    next.setDate(next.getDate() + interval)
    return next
  }

  if (freq === 'WEalEKLY') {
    if (byDay && byDay.length > 1) {
      // Multiple days per week (e.g. MO,WE,FR) — advance to next matching day
      const dayMap = { SU:0, MO:1, TU:2, WE:3, TH:4, FR:5, SA:6 }
      const targetDays = byDay.map(d => dayMap[d.slice(-2)]).sort((a,b)=>a-b)
      const cur = next.getDay()
      const nextDay = targetDays.find(td => td > cur)
      if (nextDay !== undefined) {
        next.setDate(next.getDate() + (nextDay - cur))
      } else {
        // Wrap to next week's first target day
        next.setDate(next.getDate() + (7 * interval - cur + targetDays[0]))
      }
      return next
    }
    next.setDate(next.getDate() + 7 * interval)
    return next
  }

  if (freq === 'MONTHLY') {
    next.setMonth(next.getMonth() + interval)
    return next
  }

  if (freq === 'YEARLY') {
    next.setFullYear(next.getFullYear() + interval)
    return next
  }

  return null
}

function _dayStart(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)
}

function _fmtDate(d) {
  const y  = d.getFullYear()
  const m  = String(d.getMonth() + 1).padStart(2, '0')
  const dy = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dy}`
}

function _fmtTime(d) {
  let h    = d.getHours()
  const mi = String(d.getMinutes()).padStart(2, '0')
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${mi} ${ap}`
}

function _fmtTimeShort(d) {
  let h    = d.getHours()
  const mi = d.getMinutes()
  const ap = h >= 12 ? 'pm' : 'am'
  h = h % 12 || 12
  return mi === 0 ? `${h}${ap}` : `${h}:${String(mi).padStart(2, '0')}${ap}`
}
