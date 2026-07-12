import { supabase } from './supabase.js';

// 1. Konstanten
const LS_KEY = 'momentum_app_data_v2'; 
const ACHIEVEMENTS = [
  {id:'first_task', emoji:'🌱', name:'Erste Aufgabe erledigt', cond:s=>s.totalCompleted>=1},
  {id:'tasks_5', emoji:'✅', name:'5 Aufgaben erledigt', cond:s=>s.totalCompleted>=5},
  {id:'tasks_10', emoji:'🎯', name:'10 Aufgaben erledigt', cond:s=>s.totalCompleted>=10},
  {id:'tasks_25', emoji:'📌', name:'25 Aufgaben erledigt', cond:s=>s.totalCompleted>=25},
  {id:'tasks_50', emoji:'🚀', name:'50 Aufgaben erledigt', cond:s=>s.totalCompleted>=50},
  {id:'tasks_100', emoji:'💯', name:'100 Aufgaben erledigt', cond:s=>s.totalCompleted>=100},
  {id:'xp_250', emoji:'⚡', name:'250 XP erreicht', cond:s=>s.totalXp>=250},
  {id:'xp_500', emoji:'🔋', name:'500 XP erreicht', cond:s=>s.totalXp>=500},
  {id:'xp_1000', emoji:'⚡', name:'1000 XP erreicht', cond:s=>s.totalXp>=1000},
  {id:'xp_2500', emoji:'💎', name:'2500 XP erreicht', cond:s=>s.totalXp>=2500},
  {id:'xp_5000', emoji:'👑', name:'5000 XP erreicht', cond:s=>s.totalXp>=5000},
  {id:'streak_3', emoji:'🔥', name:'3 Tage Streak', cond:s=>s.longestStreak>=3},
  {id:'streak_7', emoji:'🔥', name:'7 Tage Streak', cond:s=>s.longestStreak>=7},
  {id:'streak_14', emoji:'🏔️', name:'14 Tage Streak', cond:s=>s.longestStreak>=14},
  {id:'streak_30', emoji:'🌋', name:'30 Tage Streak', cond:s=>s.longestStreak>=30},
  {id:'streak_100', emoji:'🏆', name:'100 Tage Streak', cond:s=>s.longestStreak>=100},
  {id:'level_3', emoji:'🧠', name:'Level 3 erreicht', cond:s=>s.level>=3},
  {id:'level_5', emoji:'🚀', name:'Level 5 erreicht', cond:s=>s.level>=5},
  {id:'level_10', emoji:'🪐', name:'Level 10 erreicht', cond:s=>s.level>=10},
  {id:'goals_5', emoji:'📝', name:'5 Ziele angelegt', cond:s=>s.totalGoals>=5},
  {id:'goals_15', emoji:'📚', name:'15 Ziele angelegt', cond:s=>s.totalGoals>=15},
  {id:'perfect_day', emoji:'🌟', name:'Perfekter Tag', cond:s=>s.perfectDays>=1},
  {id:'perfect_week', emoji:'🗓️', name:'7 perfekte Tage', cond:s=>s.perfectDays>=7},
  {id:'habit_master', emoji:'🌳', name:'Erste Gewohnheit gemeistert', cond:s=>s.habitsCompleted>=1},
  {id:'habit_master_3', emoji:'🌲', name:'3 Gewohnheiten gemeistert', cond:s=>s.habitsCompleted>=3},
  {id:'category_master', emoji:'🧩', name:'Alle Kategorien geschafft', cond:s=>s.categoriesCompleted>=CATEGORIES.length},
  {id:'subquests_10', emoji:'🗺️', name:'10 Sidequests erledigt', cond:s=>s.subquestDone>=10},
  {id:'titles_3', emoji:'👔', name:'3 Titel gesammelt', cond:s=>s.ownedTitles>=3},
  {id:'season_500', emoji:'🥉', name:'500 Saison-XP', cond:s=>s.seasonXp>=500},
  {id:'season_1500', emoji:'🥇', name:'1500 Saison-XP', cond:s=>s.seasonXp>=1500}
];

// 2. Funktionen (müssen vor dem Aufruf definiert sein)
function loadState(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(!raw) return defaultState();
    let s = JSON.parse(raw);
if(!s.shop) s.shop = { shields: 0, habitShields: 0, ownedTitles: [], shieldedDays: [], habitShieldedMisses: [] };
if(s.shop.habitShields===undefined) s.shop.habitShields = 0;
if(!s.shop.habitShieldedMisses) s.shop.habitShieldedMisses = [];    if(!s.overrides) s.overrides = {};
    if(!s.subquestCompletions) s.subquestCompletions = {};
    if(!s.unlockedAchievements) s.unlockedAchievements = [];
    if(s.availableXp===undefined) s.availableXp = s.totalXp;
    if(!s.season || s.season.id !== getCurrentSeasonId()) s.season = { id: getCurrentSeasonId(), xp: 0 };
    return Object.assign(defaultState(), s);
  }catch(e){ return defaultState(); }
}
async function saveState(){
  localStorage.setItem(LS_KEY, JSON.stringify(state));

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { error } = await supabase
      .from('daten')
      .upsert({ user_id: user.id, inhalt: JSON.stringify(state) }, { onConflict: 'user_id' });
    if (error) console.error("Speichern in Supabase fehlgeschlagen:", error.message);
  }
}

// 3. Globaler State
let state = loadState();

async function loadStateFromSupabase(){
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('daten')
    .select('inhalt')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error("Laden aus Supabase fehlgeschlagen:", error.message);
    return;
  }

  if (data && data.inhalt) {
    try {
      const remoteState = JSON.parse(data.inhalt);
      state = Object.assign(defaultState(), remoteState);
      localStorage.setItem(LS_KEY, JSON.stringify(state));
      if (typeof renderDashboard === 'function') renderDashboard();
      if (typeof renderSettings === 'function') renderSettings();
    } catch(e) {
      console.error("Fehler beim Parsen der Supabase-Daten:", e);
    }
  }
}
loadStateFromSupabase();
// 5. Restlicher Code

    console.log("Das Theme ist:", state.settings.theme); 
const ICONS = {
  home:'<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9"/>',
  calendar:'<rect x="3.5" y="5" width="17" height="16" rx="3"/><path d="M3.5 10h17"/><path d="M8 3v4"/><path d="M16 3v4"/>',
  chart:'<path d="M4 20V10"/><path d="M11 20V4"/><path d="M18 20v-7"/>',
  sparkle:'<path d="M12 3l1.6 4.9L18 9.5l-4.4 1.6L12 16l-1.6-4.9L6 9.5l4.4-1.6L12 3Z"/><path d="M19 15l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1Z"/>',
  settings:'<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.4M12 18.6V21M21 12h-2.4M5.4 12H3M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7M18.4 18.4l-1.7-1.7M7.3 7.3 5.6 5.6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  check:'<path d="M5 13l4 4L19 7"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  flame:'<path d="M12 2c1 4-4 5-4 9a4 4 0 0 0 8 0c0-1.5-1-2-1-3.5 2 1 3 3.5 3 6a6 6 0 0 1-12 0C6 8 9 6 12 2Z"/>',
  edit:'<path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="M13.5 6.5l4 4"/>',
  trash:'<path d="M5 7h14"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M7 7l1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13"/><path d="M10 11v6M14 11v6"/>',
  copy:'<rect x="9" y="9" width="11" height="11" rx="2.2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  move:'<path d="M5 9l-3 3 3 3M19 9l3 3-3 3M9 5l3-3 3 3M9 19l3 3 3-3M2 12h20M12 2v20"/>',
  dots:'<circle cx="12" cy="6" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="18" r="1.4"/>',
  chevronLeft:'<path d="M15 5l-7 7 7 7"/>',
  chevronRight:'<path d="M9 5l7 7-7 7"/>',
  target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".6" fill="currentColor"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  sun:'<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.3M12 19.2v2.3M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.3M19.2 12h2.3M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/>',
  palette:'<circle cx="12" cy="12" r="9"/><circle cx="8.2" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="7.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="15.8" cy="10" r="1.2" fill="currentColor" stroke="none"/><path d="M12 21a9 9 0 0 0 0-18 2 2 0 0 0 0 4 2 2 0 0 1 0 4 2 2 0 0 0 0 10Z"/>',
  database:'<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
  bolt:'<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>'
};

function iconSVG(name,size=20){ return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]||''}</svg>`; }
function mountIcons(){ document.querySelectorAll('[data-icon]').forEach(el=>{ el.innerHTML = iconSVG(el.dataset.icon); }); }

const CATEGORIES = [{id:'fitness', label:'Fitness', emoji:'💪'}, {id:'lernen', label:'Lernen', emoji:'📚'}, {id:'arbeit', label:'Arbeit', emoji:'💼'}, {id:'gesundheit', label:'Gesundheit', emoji:'🩺'}, {id:'kreativitaet', label:'Kreativität', emoji:'🎨'}, {id:'sonstiges', label:'Sonstiges', emoji:'✨'}];
const EMOJIS = ['💪','🏃','🧘','📚','✍️','💻','💼','📈','🎯','🩺','🥗','💧','😴','🎨','🎵','🧹','🛒','🌱'];
const GOAL_COLORS = ['#5B8CFF','#7C4DFF','#22C55E','#F59E0B','#EF4444','#EC4899'];
const DIFFICULTY_XP = {leicht:10, mittel:25, schwer:50, episch:100};
const DIFFICULTY_LABELS = {leicht:'🟢 Leicht', mittel:'🟡 Mittel', schwer:'🟠 Schwer', episch:'🔴 Episch'};
window.currentWisdom = null;

async function loadWisdom(){
  try{
    const cached = JSON.parse(localStorage.getItem('m_wisdom') || 'null');
    const nowSlot = Math.floor(Date.now() / (6*3600*1000));
    if(cached && cached.slot === nowSlot){
      window.currentWisdom = cached;
    } else {
      const res = await fetch('/dailyWisdom');
      const data = await res.json();
      localStorage.setItem('m_wisdom', JSON.stringify(data));
      window.currentWisdom = data;
    }
  } catch(e){
    window.currentWisdom = {
      type:'hadith', ar:'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ',
      text:'Handlungen werden allein nach ihren Absichten bewertet.',
      ref:'Überliefert bei Bukhari und Muslim'
    };
  }
  if (typeof renderDashboard === 'function') renderDashboard();
}

// 4. TEST-BLOCK (hier ist er sicher platziert)
async function testConnection() {
    const { data, error } = await supabase.from('daten').select('*').limit(1);
    if (error) {
        console.error("Verbindung fehlgeschlagen:", error.message);
    } else {
        console.log("Verbindung steht! Supabase ist bereit.");
    }
}

const WEEKDAY_LABELS = ['So','Mo','Di','Mi','Do','Fr','Sa'];


/* STATE */
function pad(n){return String(n).padStart(2,'0')}
function fmtDate(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function parseDate(str){ const [y,m,d]=str.split('-').map(Number); return new Date(y,m-1,d); }
function addDays(dateStr, n){ const d=parseDate(dateStr); d.setDate(d.getDate()+n); return fmtDate(d); }
function getEffectiveToday(){ const rh = state.settings.resetHour||0; const now = new Date(); return fmtDate(new Date(now.getTime() - rh*3600000)); }
function getWeekStart(dateStr){ const d = parseDate(dateStr); let day = d.getDay(); day = day===0? 7 : day; d.setDate(d.getDate() - (day-1)); return fmtDate(d); }
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,8); }
function getCurrentSeasonId(){ const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}`; }
function defaultState(){
  return {
    goals: [], completions: {}, overrides: {}, dayOrder: {}, totalXp: 0, availableXp: 0,
    unlockedAchievements: [], habitsCompleted: 0, completedCategories: [], subquestCompletions: {},
    shop: { shields: 0, habitShields: 0, ownedTitles: [], shieldedDays: [], habitShieldedMisses: [] },
    settings: { accent: '#5B8CFF', theme: 'dark', resetHour: 0 },
    equipped: { title: null },
    season: { xp: 0 }
  };
}


/* LOGIC */
function weeklyDoneBefore(goal, dateStr){
  const weekStart = getWeekStart(dateStr); let count=0, cursor=weekStart;
  while(cursor<dateStr){ if(isTaskDone(cursor, goal.id)) count++; cursor = addDays(cursor,1); }
  return count;
}
function matchesRepeatRule(goal, dateStr){
  if(dateStr < goal.createdDate) return false;
  if(goal.habit && goal.habit.enabled){ const elapsed = daysBetween(goal.habit.startDate, dateStr); if(elapsed<0 || elapsed>=goal.habit.days) return false; }
  const r = goal.repeat;
  if(r.type==='once' || r.type==='date') return r.date === dateStr;
  if(r.type==='daily') return true;
  if(r.type==='weekdays') return r.weekdays.includes(parseDate(dateStr).getDay());
  if(r.type==='weekly') return weeklyDoneBefore(goal, dateStr) < (r.timesPerWeek||2) || isTaskDone(dateStr, goal.id);
  if(r.type==='interval'){ const diff = daysBetween(r.startDate, dateStr); return diff>=0 && diff % r.intervalDays === 0; }
  return false;
}
function getTasksForDate(dateStr){
  const ov = state.overrides[dateStr] || {add:[],remove:[]};
  let ids = state.goals.filter(g=>matchesRepeatRule(g,dateStr) && !(ov.remove||[]).includes(g.id)).map(g=>g.id);
  (ov.add||[]).forEach(id=>{ if(state.goals.find(g=>g.id===id) && !ids.includes(id)) ids.push(id); });
  const order = state.dayOrder[dateStr];
  if(order){ ids.sort((a,b)=> order.indexOf(a) - order.indexOf(b)); ids.forEach(id=>{ if(!order.includes(id)) order.push(id); }); }
  return ids.map(id=>state.goals.find(g=>g.id===id)).filter(Boolean);
}
function isTaskDone(dateStr, goalId){ return !!(state.completions[dateStr] && state.completions[dateStr][goalId] && state.completions[dateStr][goalId].done); }
function isSubquestDone(dateStr, goalId, subId){ return !!(state.subquestCompletions[dateStr] && state.subquestCompletions[dateStr][goalId] && state.subquestCompletions[dateStr][goalId][subId]); }

function toggleSubquestDone(dateStr, goalId, subId){
  if(!state.subquestCompletions[dateStr]) state.subquestCompletions[dateStr] = {};
  if(!state.subquestCompletions[dateStr][goalId]) state.subquestCompletions[dateStr][goalId] = {};
  state.subquestCompletions[dateStr][goalId][subId] = !state.subquestCompletions[dateStr][goalId][subId];
  saveState(); renderDashboard(); if(!document.getElementById('view-calendar').hidden) renderDayPanel();
}
function subquestProgress(goal, dateStr){
  if(!goal.subquests || goal.subquests.length===0) return null;
  const done = goal.subquests.filter(sq=>isSubquestDone(dateStr, goal.id, sq.id)).length;
  return {done, total:goal.subquests.length};
}
function daysBetween(a,b){ return Math.round((parseDate(b)-parseDate(a))/86400000); }

function dayStats(dateStr){
  const tasks = getTasksForDate(dateStr);
  const done = tasks.filter(g=>isTaskDone(dateStr,g.id));
  let totalWeight = tasks.reduce((sum, t) => sum + t.xp, 0);
  let doneWeight = done.reduce((sum, t) => sum + t.xp, 0);
  let pct = totalWeight > 0 ? Math.round((doneWeight / totalWeight) * 100) : 0;
  return { total: tasks.length, done: done.length, totalWeight, doneWeight, pct };
}

function checkShields(){
  const today = getEffectiveToday();
  const yesterday = addDays(today, -1);
  const s = dayStats(yesterday);
  if(s.total > 0 && s.done < s.total && state.shop.shields > 0 && !state.shop.shieldedDays.includes(yesterday)){
    state.shop.shields--; state.shop.shieldedDays.push(yesterday);
    toast("Dein Streak-Schild hat dich gestern gerettet! 🛡️", "info"); saveState();
  }
}

function computeCurrentStreak(){
  let streak=0; let cursor = getEffectiveToday();
  const todayS = dayStats(cursor);
  if(!(todayS.total>0 && todayS.done===todayS.total)){ cursor = addDays(cursor,-1); }
  for(let i=0;i<3650;i++){
    const s = dayStats(cursor);
    if(s.total===0){ cursor = addDays(cursor,-1); continue; }
    if((s.done===s.total) || state.shop.shieldedDays.includes(cursor)){ streak++; cursor=addDays(cursor,-1); } else break;
  }
  return streak;
}
function computeLongestStreak(){
  const dates = Object.keys(state.completions); if(dates.length===0) return 0;
  let earliest = getEffectiveToday();
  dates.forEach(d=>{ if(d<earliest) earliest=d; });
  let longest=0, run=0; let cursor = earliest; const today = getEffectiveToday();
  while(cursor<=today){
    const s = dayStats(cursor);
    if(s.total>0){ if((s.done===s.total)||state.shop.shieldedDays.includes(cursor)){ run++; longest=Math.max(longest,run); } else run=0; }
    cursor = addDays(cursor,1);
  }
  return longest;
}

function xpForLevel(level){ return Math.round(100 * Math.pow(level, 1.6)); }
function levelFromXp(xp){ let l=1; while(xp >= xpForLevel(l)) l++; return l; }
function levelProgress(xp){ const l = levelFromXp(xp); const p = l>1 ? xpForLevel(l-1) : 0; const n = xpForLevel(l); return { level: l, pct: Math.round((xp-p)/(n-p)*100) }; }

/* HABITS & ACHIEVEMENTS */
function checkHabits(){
  const today = getEffectiveToday();
  let changed = false;

  state.goals.forEach(g=>{
    if(g.habit && g.habit.enabled && !g.habit.completedNotified){
      const elapsed = daysBetween(g.habit.startDate, today);

      if(elapsed >= g.habit.days){
        g.habit.completedNotified = true;
        state.habitsCompleted = (state.habitsCompleted || 0) + 1;
        changed = true;
        showAchievementPopup({emoji:'🌳', name:`Gewohnheit gemeistert: ${g.title}`});
      } else {
        const windowEnd = addDays(g.habit.startDate, g.habit.days-1);
        const scanEnd = addDays(today,-1) < windowEnd ? addDays(today,-1) : windowEnd;
        let lastMiss = null;
        let cursor = g.habit.startDate;

        while(cursor <= scanEnd){
          const missKey = `${g.id}_${cursor}`;
          const protectedMiss = state.shop.habitShieldedMisses.includes(missKey);

          if(matchesRepeatRule(g, cursor) && !isTaskDone(cursor, g.id) && !protectedMiss){
            lastMiss = cursor;
          }

          cursor = addDays(cursor, 1);
        }

        if(lastMiss){
          const missKey = `${g.id}_${lastMiss}`;

          if(state.shop.habitShields > 0){
            state.shop.habitShields--;
            state.shop.habitShieldedMisses.push(missKey);
            changed = true;
            toast(`Habit-Schutz hat deine Gewohnheit „${g.title}“ gerettet! 🛡️🌱`, 'success');
          } else {
            g.habit.startDate = addDays(lastMiss, 1);
            changed = true;
            toast(`Gewohnheit verpasst — Zähler Neustart 🔄`, 'error');
          }
        }
      }
    }
  });

  if(changed) saveState();
}
function checkAchievements(){
  const totalCompleted = Object.values(state.completions)
    .flatMap(d => Object.values(d))
    .filter(t => t.done).length;

  const subquestDone = Object.values(state.subquestCompletions || {})
    .flatMap(day => Object.values(day))
    .flatMap(goal => Object.values(goal))
    .filter(Boolean).length;

  let perfectDays = 0;
  Object.keys(state.completions).forEach(date => {
    const s = dayStats(date);
    if(s.total > 0 && s.done === s.total) perfectDays++;
  });

  const stats = {
    totalCompleted,
    longestStreak: computeLongestStreak(),
    totalXp: state.totalXp,
    habitsCompleted: state.habitsCompleted || 0,
    categoriesCompleted: state.completedCategories.length,
    level: levelProgress(state.totalXp).level,
    totalGoals: state.goals.length,
    perfectDays,
    subquestDone,
    ownedTitles: (state.shop?.ownedTitles || []).length,
    seasonXp: state.season?.xp || 0
  };

  ACHIEVEMENTS.forEach(a=>{
    if(!state.unlockedAchievements.includes(a.id) && a.cond(stats)){
      state.unlockedAchievements.push(a.id);
      showAchievementPopup(a);
      saveState();
    }
  });
}
function showAchievementPopup(a){
  const pop = document.getElementById('achvPopup');
  document.getElementById('achvEmoji').textContent = a.emoji; document.getElementById('achvName').textContent = a.name;
  pop.classList.add('show'); setTimeout(()=>pop.classList.remove('show'), 3600);
}

/* SEARCH & FILTER */
let searchQuery=''; let categoryFilter='all';
function filterTasks(tasks){
  return tasks.filter(g=>{
    const matchesSearch = !searchQuery || g.title.toLowerCase().includes(searchQuery) || (g.description||'').toLowerCase().includes(searchQuery);
    const matchesCat = categoryFilter==='all' || g.category===categoryFilter;
    return matchesSearch && matchesCat;
  });
}
document.getElementById('searchInput').addEventListener('input', e=>{ searchQuery = e.target.value.trim().toLowerCase(); renderDashboard(); });
document.getElementById('categoryFilter').addEventListener('change', e=>{ categoryFilter = e.target.value; renderDashboard(); });

/* RENDER DASHBOARD */
const expandedCards = new Set(); let openDropdownId = null;
let wisdomExpanded = false;
function toggleWisdom(){
  wisdomExpanded = !wisdomExpanded;
  const details = document.getElementById('wisdomDetails');
  const hint = document.getElementById('wisdomHint');
  if(details) details.classList.toggle('show', wisdomExpanded);
  if(hint) hint.textContent = wisdomExpanded ? '▲ Übersetzung verbergen' : '▼ Tippen für Übersetzung';
}

function renderDashboard(){
  checkShields(); checkHabits(); checkAchievements();
  const today = getEffectiveToday(); const tasks = getTasksForDate(today); const s = dayStats(today);

  document.getElementById('greetingText').textContent = "Guten Tag!";
  document.getElementById('dateText').textContent = today;
  const wisdom = window.currentWisdom || { ar:'', text:'', ref:'', type:'hadith' };
  const wisdomLabel = wisdom.type === 'quran' ? '📖 Koran' : '🕌 Hadith';
  document.getElementById('quoteText').innerHTML = `
    <div class="wisdom-arabic" id="wisdomToggle">${wisdom.ar || wisdom.text || ''}</div>
    <div class="wisdom-hint" id="wisdomHint">${wisdomExpanded ? '▲ Übersetzung verbergen' : '▼ Tippen für Übersetzung'}</div>
    <div class="wisdom-details ${wisdomExpanded ? 'show' : ''}" id="wisdomDetails">
      <div class="wisdom-label">${wisdomLabel} — ${wisdom.ref || ''}</div>
      <div class="wisdom-translation">„${wisdom.text || ''}"</div>
    </div>`;
  document.getElementById('wisdomToggle').addEventListener('click', toggleWisdom);
  document.getElementById('wisdomHint').addEventListener('click', toggleWisdom);

  document.getElementById('statDone').textContent = `${s.done}/${s.total}`;
  document.getElementById('statStreak').textContent = computeCurrentStreak();
  document.getElementById('statXpToday').textContent = s.doneWeight;

  const circumference = 2*Math.PI*68; const ring = document.getElementById('progressRing');
  ring.setAttribute('stroke-dasharray', circumference); ring.setAttribute('stroke-dashoffset', circumference - (s.pct/100)*circumference);
  document.getElementById('ringPct').textContent = s.pct+'%';
  
  document.getElementById('levelBadge').textContent = `Level ${levelProgress(state.totalXp).level}`;
  document.getElementById('sidebarStreak').textContent = `${computeCurrentStreak()} Tage`;
  if(state.shop.shields > 0) document.getElementById('sidebarShieldIcon').classList.remove('hidden'); else document.getElementById('sidebarShieldIcon').classList.add('hidden');

  if(state.equipped.title){ const tb = document.getElementById('topbarTitle'); tb.innerHTML = `⭐ ${state.equipped.title}`; tb.classList.remove('hidden'); } else { document.getElementById('topbarTitle').classList.add('hidden'); }

  const grid = document.getElementById('todayTaskGrid'); grid.innerHTML='';
  const filtered = filterTasks(tasks); document.getElementById('todayCount').textContent = tasks.length;

  if(filtered.length===0){
    grid.innerHTML = `<div class="empty-state"><span class="icon">${iconSVG('target',38)}</span><h3>Keine Treffer</h3><p>Passe deine Suche oder den Filter an.</p></div>`;
  } else {
    filtered.forEach(g=> grid.appendChild(renderTaskCard(g, today)) );
  }
  attachDragContainer(grid, today);
}

function escapeHtml(str){ const d=document.createElement('div'); d.textContent=str; return d.innerHTML; }

function renderTaskCard(goal, dateStr){
  const done = isTaskDone(dateStr, goal.id);
  const cat = CATEGORIES.find(c=>c.id===goal.category);
  const sqProgress = subquestProgress(goal, dateStr);
  let extraTags = '';
  if(goal.repeat.type==='weekly'){ extraTags += `<span class="tag" style="color:var(--secondary)">📅 ${weeklyDoneBefore(goal, dateStr) + (done?1:0)}/${goal.repeat.timesPerWeek} diese Woche</span>`; }
  if(goal.habit && goal.habit.enabled){ extraTags += `<span class="tag" style="color:var(--success)">🌱 Tag ${Math.min(goal.habit.days, daysBetween(goal.habit.startDate, dateStr)+1)}/${goal.habit.days}</span>`; }
  if(sqProgress) extraTags += `<span class="tag subquest-progress-tag">🧩 ${sqProgress.done}/${sqProgress.total}</span>`;
  
  const cardKey = goal.id+'_'+dateStr; const isExpanded = expandedCards.has(cardKey);
  const div = document.createElement('div');
  div.className = 'task-card glass' + (done? ' done':'');
  div.style.setProperty('--accent-c', goal.color);
  div.dataset.goalId = goal.id; div.draggable = true;

  const subquestListHtml = (sqProgress && isExpanded) ? `<div class="subquest-list">${goal.subquests.map(sq=>{
    const subDone = isSubquestDone(dateStr, goal.id, sq.id);
    return `<div class="subquest-item ${subDone?'done':''}"><div class="subquest-check ${subDone?'done':''}" data-sub-toggle="${sq.id}">${iconSVG('check',11)}</div><span class="subquest-title">${escapeHtml(sq.title)}</span></div>`;
  }).join('')}</div>` : '';

  div.innerHTML = `
    <div class="task-check" data-action="toggle">${iconSVG('check',14)}</div>
    <div class="task-body">
      <div class="task-top"><span class="task-emoji">${goal.icon}</span><span class="task-title">${escapeHtml(goal.title)}</span></div>
      ${goal.description? `<div class="task-desc">${escapeHtml(goal.description)}</div>` : ''}
      <div class="task-meta">
        <span class="tag">${cat.emoji} ${cat.label}</span><span class="tag">${DIFFICULTY_LABELS[goal.difficulty||'mittel']}</span>
        <span class="tag xp-tag">+${goal.xp} XP</span>${extraTags}
      </div>
      ${subquestListHtml}
    </div>
    <div style="display:flex;align-items:center;gap:2px">
      ${sqProgress? `<button class="subquest-toggle-btn ${isExpanded?'expanded':''}" data-action="toggle-sub">${iconSVG('chevronRight',16)}</button>` : ''}
      <button class="task-menu-btn" data-action="menu">${iconSVG('dots',16)}</button>
    </div>
  `;
  div.querySelector('[data-action="toggle"]').addEventListener('click', (e)=>{ e.stopPropagation(); toggleTaskDone(dateStr, goal.id, div); });
  div.querySelector('[data-action="menu"]').addEventListener('click', (e)=>{ e.stopPropagation(); toggleDropdown(div, goal, dateStr); });
  const subToggleBtn = div.querySelector('[data-action="toggle-sub"]');
  if(subToggleBtn){ subToggleBtn.addEventListener('click', (e)=>{ e.stopPropagation(); if(expandedCards.has(cardKey)) expandedCards.delete(cardKey); else expandedCards.add(cardKey); renderDashboard(); }); }
  div.querySelectorAll('[data-sub-toggle]').forEach(el=>{ el.addEventListener('click', (e)=>{ e.stopPropagation(); toggleSubquestDone(dateStr, goal.id, el.dataset.subToggle); }); });
  
  div.addEventListener('dragstart', ()=>{ div.classList.add('dragging'); window.dragState={goalId:goal.id, date:dateStr}; });
  div.addEventListener('dragend', ()=>{ div.classList.remove('dragging'); window.dragState=null; });
  return div;
}

function toggleTaskDone(dateStr, goalId, cardElement){
  const goal = state.goals.find(g=>g.id===goalId); if(!goal) return;
  if(!state.completions[dateStr]) state.completions[dateStr] = {};
  const newDone = !(state.completions[dateStr][goalId]?.done);
  state.completions[dateStr][goalId] = {done:newDone, xp:goal.xp};
  
if(newDone){
    state.totalXp += goal.xp; state.availableXp += goal.xp; state.season.xp += goal.xp;
    if(!state.completedCategories.includes(goal.category)) state.completedCategories.push(goal.category);
    fireCardConfetti(cardElement);
  } else {
    state.totalXp = Math.max(0, state.totalXp - goal.xp); state.availableXp = Math.max(0, state.availableXp - goal.xp); state.season.xp = Math.max(0, state.season.xp - goal.xp);
  }
  saveState(); renderDashboard();
}

function clearOpenMenus(){
  document.querySelectorAll('.dropdown').forEach(d=>d.remove());
  document.querySelectorAll('.task-card.menu-open').forEach(c=>c.classList.remove('menu-open'));
  openDropdownId = null;
}

function toggleDropdown(cardEl, goal, dateStr){
  clearOpenMenus();
  if(openDropdownId===goal.id+dateStr){ openDropdownId=null; return; }
  openDropdownId = goal.id+dateStr;
  cardEl.classList.add('menu-open');
  const dd = document.createElement('div'); dd.className='dropdown';
  dd.innerHTML = `
    <button data-a="edit">${iconSVG('edit',15)} Bearbeiten</button>
    <button data-a="duplicate">${iconSVG('copy',15)} Duplizieren</button>
    <button data-a="copy">${iconSVG('copy',15)} Auf Datum kopieren</button>
    <button data-a="move">${iconSVG('move',15)} Auf Datum verschieben</button>
    <hr><button data-a="removeday">${iconSVG('x',15)} Für heute entfernen</button>
    <button data-a="delete" class="danger">${iconSVG('trash',15)} Ganzes Ziel löschen</button>
  `;
  cardEl.style.position='relative'; cardEl.appendChild(dd);
  dd.addEventListener('click', e=>{
    const btn = e.target.closest('button'); if(!btn) return;
    const a = btn.dataset.a; dd.remove(); openDropdownId=null;
    if(a==='edit') openGoalModal(goal);
    else if(a==='duplicate'){ const c=JSON.parse(JSON.stringify(goal)); c.id=uid(); c.title+=' (Kopie)'; c.createdDate=getEffectiveToday(); state.goals.push(c); saveState(); renderDashboard(); toast('Dupliziert','success'); }
    else if(a==='copy') openDateModal('Auf welchen Tag kopieren?', dateStr, t=>{ if(!state.overrides[t]) state.overrides[t]={add:[],remove:[]}; state.overrides[t].add.push(goal.id); saveState(); renderDashboard(); });
    else if(a==='move') openDateModal('Auf welchen Tag verschieben?', dateStr, t=>{ if(goal.repeat.type==='once') goal.repeat.date=t; else { if(!state.overrides[dateStr]) state.overrides[dateStr]={add:[],remove:[]}; state.overrides[dateStr].remove.push(goal.id); if(!state.overrides[t]) state.overrides[t]={add:[],remove:[]}; state.overrides[t].add.push(goal.id); } saveState(); renderDashboard(); });
    else if(a==='removeday'){ if(!state.overrides[dateStr]) state.overrides[dateStr]={add:[],remove:[]}; state.overrides[dateStr].remove.push(goal.id); saveState(); renderDashboard(); toast('Entfernt','success'); }
    else if(a==='delete') openConfirm('Ziel löschen?', 'Ganzes Ziel löschen?', ()=>{ state.goals=state.goals.filter(g=>g.id!==goal.id); saveState(); renderDashboard(); toast('Gelöscht','success'); });
  });
}
document.addEventListener('click', ()=>{ clearOpenMenus(); });
function attachDragContainer(container, dateStr){
  container.addEventListener('dragover', e=>{ e.preventDefault(); const after = getDragAfterElement(container, e.clientY); const dragging = container.querySelector('.dragging'); if(!dragging) return; if(after==null) container.appendChild(dragging); else container.insertBefore(dragging, after); });
  container.addEventListener('drop', ()=>{ if(!window.dragState) return; const ids = [...container.querySelectorAll('.task-card')].map(c=>c.dataset.goalId); state.dayOrder[dateStr] = ids; saveState(); });
}
function getDragAfterElement(container, y){ const els = [...container.querySelectorAll('.task-card:not(.dragging)')]; return els.reduce((closest, child)=>{ const box = child.getBoundingClientRect(); const offset = y - box.top - box.height/2; if(offset<0 && offset>closest.offset) return {offset, element:child}; return closest; }, {offset:-Infinity, element:null}).element; }

function fireCardConfetti(cardElement){
  const rect = cardElement.getBoundingClientRect(); const cvs = document.getElementById('confettiCanvas'); const cctx = cvs.getContext('2d');
  cvs.width = window.innerWidth; cvs.height = window.innerHeight;
  const cx = rect.left + 20, cy = rect.top + rect.height/2;
  const particles = Array.from({length:30}, ()=>({ x: cx, y: cy, vx: (Math.random()-0.3)*10, vy: (Math.random()-0.8)*10, size: 4+Math.random()*4, color: GOAL_COLORS[Math.floor(Math.random()*GOAL_COLORS.length)] }));
  let frame = 0;
  function loop(){
    cctx.clearRect(0,0,cvs.width,cvs.height); let alive = false;
    particles.forEach(p=>{ p.x += p.vx; p.y += p.vy; p.vy += 0.4; if(p.y < cvs.height) alive = true; cctx.fillStyle = p.color; cctx.beginPath(); cctx.arc(p.x, p.y, p.size, 0, Math.PI*2); cctx.fill(); });
    if(alive && frame++ < 60) requestAnimationFrame(loop); else cctx.clearRect(0,0,cvs.width,cvs.height);
  }
  loop();
}

/* RENDER CALENDAR */
let calViewDate = new Date(); let selectedDate = getEffectiveToday();
function renderCalendar(){
  const y = calViewDate.getFullYear(), m = calViewDate.getMonth();
  const MONTH_NAMES = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  document.getElementById('calMonthLabel').textContent = `${MONTH_NAMES[m]} ${y}`;
  const dowRow = document.getElementById('calDowRow'); dowRow.innerHTML = ['Mo','Di','Mi','Do','Fr','Sa','So'].map(d=>`<div class="cal-dow">${d}</div>`).join('');
  const grid = document.getElementById('calGrid'); grid.innerHTML='';
  const firstDay = new Date(y,m,1); let startOffset = firstDay.getDay()-1; if(startOffset<0) startOffset=6;
  const daysInMonth = new Date(y,m+1,0).getDate(); const today = getEffectiveToday();
  
  for(let i=0;i<startOffset;i++) grid.innerHTML += `<div class="cal-day pad"></div>`;
  for(let i=1; i<=daysInMonth; i++){
    const dateStr = `${y}-${pad(m+1)}-${pad(i)}`; const s = dayStats(dateStr);
    const cell = document.createElement('button'); cell.className = 'cal-day';
    if(dateStr===today) cell.classList.add('today'); if(dateStr===selectedDate) cell.classList.add('selected');
    if(s.total>0 && s.done===s.total) cell.classList.add('done-all'); else if(s.done>0) cell.classList.add('done-partial');
    cell.innerHTML = `<span>${i}</span>` + (s.total>0? `<span class="dot-row"><span class="dot"></span></span>`:'<span class="dot-row"></span>');
    cell.addEventListener('click', ()=>{ selectedDate=dateStr; renderCalendar(); renderDayPanel(); });
    grid.appendChild(cell);
  }
  renderDayPanel();
}
document.getElementById('calPrevBtn').addEventListener('click', ()=>{ calViewDate.setMonth(calViewDate.getMonth()-1); renderCalendar(); });
document.getElementById('calNextBtn').addEventListener('click', ()=>{ calViewDate.setMonth(calViewDate.getMonth()+1); renderCalendar(); });
document.getElementById('calTodayBtn').addEventListener('click', ()=>{ calViewDate=new Date(); selectedDate=getEffectiveToday(); renderCalendar(); });

function renderDayPanel(){
  document.getElementById('dayPanelTitle').textContent = selectedDate === getEffectiveToday() ? "Heute" : selectedDate;
  const tasks = getTasksForDate(selectedDate); const list = document.getElementById('daySummaryList'); list.innerHTML='';
  if(tasks.length===0){ list.innerHTML = `<div style="text-align:center; padding: 20px; color:var(--text-faint)">Keine Ziele.</div>`; return; }

  tasks.forEach(t=>{
    const done = isTaskDone(selectedDate, t.id); const shielded = !done && state.shop.shieldedDays.includes(selectedDate);
    let statusText = done ? "Erledigt" : (shielded ? "Geschützt 🛡️" : (selectedDate < getEffectiveToday() ? "Verpasst" : "Offen"));
    let statusClass = done ? "status-done" : (shielded ? "status-done" : (selectedDate < getEffectiveToday() ? "status-missed" : "status-open"));
    
    let subquestsHtml = "";
    if(t.subquests && t.subquests.length > 0) {
      subquestsHtml = `<div class="ds-details"><b>Unteraufgaben:</b><br>` + t.subquests.map(sq=>`- ${sq.title} ` + (isSubquestDone(selectedDate, t.id, sq.id)? '✅':'❌')).join('<br>') + `</div>`;
    }

    const item = document.createElement('div');
    item.className = `day-summary-item ${done?'done':''}`;
    item.innerHTML = `
      <div class="ds-top">
        <div class="day-summary-icon">${t.icon}</div>
        <div class="day-summary-text"><div class="title">${t.title}</div><div class="sub">+${t.xp} XP</div></div>
        <div class="day-summary-status ${statusClass}">${statusText}</div>
      </div>
      ${t.description ? `<div class="ds-details">${t.description}</div>` : ''}
      ${subquestsHtml}
    `;
    item.addEventListener('click', ()=>item.classList.toggle('expanded'));
    list.appendChild(item);
  });
}

/* RENDER STATS & HEATMAP */
let currentChartRange = 'week';
function renderStats(){
  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card glass"><div class="lbl">Aktuelle Streak</div><div class="num" style="color:var(--warning)">${computeCurrentStreak()} 🔥</div></div>
    <div class="stat-card glass"><div class="lbl">Gesamt XP</div><div class="num" style="color:var(--secondary)">${state.totalXp} ⚡</div></div>
  `;

  let catCounts = {}; let dayCounts = [0,0,0,0,0,0,0]; let weekXp = {};
  Object.keys(state.completions).forEach(date => {
    const dayObj = state.completions[date]; const dateDate = parseDate(date);
    const weekKey = `${dateDate.getFullYear()}-W${Math.floor(dateDate.getDate()/7)}`;
    Object.keys(dayObj).forEach(gId => {
      if(dayObj[gId].done) {
        const goal = state.goals.find(g=>g.id===gId);
        if(goal) { catCounts[goal.category] = (catCounts[goal.category]||0) + 1; dayCounts[dateDate.getDay()]++; weekXp[weekKey] = (weekXp[weekKey]||0) + goal.xp; }
      }
    });
  });

  let topCat = Object.keys(catCounts).sort((a,b)=>catCounts[b]-catCounts[a])[0];
  document.getElementById('statTopCat').textContent = topCat ? CATEGORIES.find(c=>c.id===topCat)?.label || topCat : "-";
  let topDayIdx = dayCounts.indexOf(Math.max(...dayCounts));
  document.getElementById('statTopDay').textContent = Math.max(...dayCounts) > 0 ? WEEKDAY_LABELS[topDayIdx] : "-";
  document.getElementById('statBestWeek').textContent = `${Math.max(0, ...Object.values(weekXp))} XP`;

  renderLineChart(currentChartRange);
  renderHeatmap();
  
  // Badges
  const stats = { totalCompleted: Object.values(state.completions).flatMap(d=>Object.values(d)).filter(t=>t.done).length, longestStreak: computeLongestStreak(), totalXp: state.totalXp, level: levelProgress(state.totalXp).level, habitsCompleted: state.habitsCompleted||0, categoriesCompleted: state.completedCategories.length };
  document.getElementById('badgesGrid').innerHTML = ACHIEVEMENTS.map(a=>{
    const unlocked = state.unlockedAchievements.includes(a.id);
    return `<div class="badge-card ${unlocked?'':'locked'}"><div class="badge-emoji">${a.emoji}</div><h4>${a.name}</h4><p>${unlocked? 'Freigeschaltet ✓' : 'Noch gesperrt'}</p></div>`;
  }).join('');
}

function renderLineChart(range='week'){
  const svg = document.getElementById('lineChart');
  const days = range === 'week' ? 7 : range === 'month' ? 30 : 365;
  const points=[]; let cursor = getEffectiveToday();
  for(let i=0;i<days;i++){ points.unshift({date:cursor, done:dayStats(cursor).doneWeight}); cursor=addDays(cursor,-1); }
  const max = Math.max(1, ...points.map(p=>p.done));
  const W=800,H=220, padding=20, stepX = (W-padding*2)/Math.max(1, points.length-1); let path='';
  points.forEach((p,i)=>{ const x = padding + i*stepX; const y = H-padding - (p.done/max)*(H-padding*2); path += (i===0? `M${x},${y}` : ` L${x},${y}`); });
  svg.innerHTML = `<path d="${path}" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linecap="round"></path>`;
}

function renderHeatmap(){
  const grid = document.getElementById('heatmapGrid'); grid.innerHTML='';
  let cursor = addDays(getEffectiveToday(), -(370));
  for(let i=0;i<371;i++){
    const s = dayStats(cursor); const cell = document.createElement('div'); cell.className='heatmap-cell';
    let bg = 'rgba(255,255,255,0.05)';
    if(s.done>0) bg = `rgba(var(--success-rgb), ${0.25+Math.min(1, s.done/4)*0.65})`;
    cell.style.background = bg; cell.title = `${cursor}: ${s.done} erledigt`; grid.appendChild(cell);
    cursor = addDays(cursor,1);
  }
}

/* SHOP & SEASON PASS */
const SHOP_ITEMS = [
{id:'streak_shield', type:'consumable', icon:'🛡️', title:'Streak-Schild', desc:'Rettet deine normale Tages-Streak bei einem verpassten Tag.', price:800, levelReq:1, key:'shields', amount:1},
  {id:'habit_guard', type:'consumable', icon:'🌱', title:'Habit-Schutz', desc:'Rettet eine Gewohnheit, wenn du einen Habit-Tag verpasst.', price:1200, levelReq:4, key:'habitShields', amount:1},
  {id:'streak_pack', type:'consumable', icon:'📦', title:'Streak-Schild Pack', desc:'3 Streak-Schilde auf einmal.', price:2200, levelReq:8, key:'shields', amount:3},
  {id:'habit_pack', type:'consumable', icon:'🧰', title:'Habit-Schutz Pack', desc:'3 Habit-Schutz-Ladungen auf einmal.', price:3200, levelReq:10, key:'habitShields', amount:3},
  {id:'title_zen', type:'title', icon:'🧘', title:'Zen-Mönch', desc:'Ruhiger Fokus durch Beständigkeit.', price:1500, levelReq:8},
  {id:'title_morgen', type:'title', icon:'🌅', title:'Morgenstarter', desc:'Für frühe Produktivität.', price:1000, levelReq:5},
  {id:'title_fokus', type:'title', icon:'⚡', title:'Fokusmeister', desc:'Konzentriert und entschlossen.', price:3800, levelReq:16},
  {id:'title_hueter', type:'title', icon:'🔥', title:'Streak-Hüter', desc:'Du lässt Serien nicht sterben.', price:2800, levelReq:13},
  {id:'title_sidequest', type:'title', icon:'🗺️', title:'Sidequest-Held', desc:'Auch kleine Schritte zählen.', price:1900, levelReq:9},
  {id:'title_zieljaeger', type:'title', icon:'🎯', title:'Zieljäger', desc:'Immer auf das Wesentliche.', price:2500, levelReq:11},
  {id:'title_rhythmus', type:'title', icon:'🥁', title:'Rhythmus-König', desc:'Disziplin mit Takt.', price:3300, levelReq:14},
  {id:'title_architekt', type:'title', icon:'🏗️', title:'Disziplin-Architekt', desc:'Du baust Routinen mit System.', price:4500, levelReq:19},
  {id:'title_xp', type:'title', icon:'💎', title:'XP-Sammler', desc:'Jede Aufgabe zahlt sich aus.', price:2100, levelReq:10},
  {id:'title_ruhe', type:'title', icon:'🌙', title:'Ruhepol', desc:'Gelassen trotz vollem Plan.', price:1700, levelReq:8},
  {id:'title_taktiker', type:'title', icon:'♟️', title:'Taktiker', desc:'Erst denken, dann machen.', price:3100, levelReq:13},
  {id:'title_lern', type:'title', icon:'📚', title:'Lernmaschine', desc:'Wissen ist dein täglicher Treibstoff.', price:2900, levelReq:12},
  {id:'title_ausdauer', type:'title', icon:'🏃', title:'Ausdauer-Ass', desc:'Du bleibst dran.', price:3400, levelReq:14},
  {id:'title_prio', type:'title', icon:'📌', title:'Prioritäten-Profi', desc:'Wichtige Dinge zuerst.', price:3700, levelReq:16},
  {id:'title_planer', type:'title', icon:'🗓️', title:'Planungs-Guru', desc:'Dein Kalender gehorcht dir.', price:4200, levelReq:18},
  {id:'title_habit', type:'title', icon:'🌳', title:'Gewohnheits-Schmied', desc:'Routinen werden bei dir geschmiedet.', price:4800, levelReq:20},
  {id:'title_deep', type:'title', icon:'🧠', title:'Deep-Work-Meister', desc:'Tiefe Arbeit, große Wirkung.', price:5400, levelReq:23},
  {id:'title_sprint', type:'title', icon:'🏁', title:'Sprint-Kommandant', desc:'Kurze Sprints, starke Ergebnisse.', price:2900, levelReq:11},
  {id:'title_konsistenz', type:'title', icon:'🪨', title:'Konsistenz-Legende', desc:'Du bist verlässlich wie ein Uhrwerk.', price:6200, levelReq:26},
  {id:'title_falke', type:'title', icon:'🦅', title:'Fortschritts-Falke', desc:'Du erkennst Chancen früh.', price:4000, levelReq:17},
  {id:'title_kalender', type:'title', icon:'📆', title:'Kalendermagier', desc:'Zeit wird bei dir planbar.', price:3100, levelReq:13},
  {id:'title_sensei', type:'title', icon:'🥋', title:'Struktur-Sensei', desc:'Ordnung ist deine Superkraft.', price:5900, levelReq:25},
  {id:'title_erfolg', type:'title', icon:'🏆', title:'Erfolgsingenieur', desc:'Du konstruierst Erfolg.', price:6800, levelReq:28},
  {id:'title_routine', type:'title', icon:'🔁', title:'Meister der Routine', desc:'Beständigkeit auf höchstem Niveau.', price:7500, levelReq:31},
  {id:'title_elite', type:'title', icon:'🛸', title:'Elite-Fokussierer', desc:'Ablenkung hat bei dir kaum Chancen.', price:8800, levelReq:36},
  {id:'title_momentum', type:'title', icon:'👑', title:'Momentum-Ikone', desc:'Der ultimative Titel deiner Reise.', price:11000, levelReq:45}
];

function renderShop(){
  document.getElementById('shopAvailableXp').textContent = state.availableXp;
  document.getElementById('ownedShields').textContent = state.shop.shields;
  document.getElementById('ownedHabitShields').textContent = state.shop.habitShields || 0;

  document.getElementById('seasonXpDisplay').textContent = `${state.season.xp} / 2000 XP`;
  const track = document.getElementById('seasonTrack');
  track.innerHTML = '';
  const rewards = [{xp:750, emoji:'🌱', n:'Bronze'}, {xp:1500, emoji:'🥈', n:'Silber'}, {xp:3000, emoji:'👑', n:'Gold'}];
  rewards.forEach(r=>{
    const unlocked = state.season.xp >= r.xp;
    track.innerHTML += `<div class="season-reward ${unlocked?'unlocked':''}"><div class="req">${r.xp} XP</div><div style="font-size:28px">${r.emoji}</div><div style="font-size:12px; font-weight:700">${r.n}</div></div>`;
  });

  const grid = document.getElementById('shopGrid');
  grid.innerHTML = SHOP_ITEMS.map(item=>{
    const level = levelProgress(state.totalXp).level;
    const owned = item.type === 'title' ? (state.shop.ownedTitles || []).includes(item.title) : false;
    const locked = level < item.levelReq;

    const buttonHtml = item.type === 'title'
      ? (owned
          ? `<button class="btn-secondary" onclick="equipTitle('${item.title.replace(/'/g,"\\'")}')">${state.equipped.title===item.title?'Ausgerüstet':'Ausrüsten'}</button>`
          : `<button class="btn-primary" onclick="buyShopItem('${item.id}')">Kaufen</button>`)
      : `<button class="btn-primary" onclick="buyShopItem('${item.id}')">Kaufen</button>`;

    const ownedInfo = item.type === 'consumable'
      ? `<div style="margin-top:10px;font-size:11px;color:var(--text-faint)">Im Besitz: <span>${state.shop[item.key] || 0}</span></div>`
      : (owned ? `<div style="margin-top:10px;font-size:11px;color:var(--success)">Freigeschaltet ✓</div>` : '');

    return `<div class="shop-item glass ${locked && !owned ? 'locked' : ''}">
      <div class="shop-icon">${item.icon}</div>
      <div class="shop-title">${item.title}</div>
      <div class="shop-desc">${item.desc}</div>
      <div class="shop-price">${item.price} XP · ab Level ${item.levelReq}</div>
      ${buttonHtml}
      ${ownedInfo}
    </div>`;
  }).join('');
}

window.buyShopItem = function(id){
  const item = SHOP_ITEMS.find(x=>x.id===id);
  if(!item) return;

  const level = levelProgress(state.totalXp).level;
  if(level < item.levelReq){
    toast(`Benötigt Level ${item.levelReq}`, 'error');
    return;
  }

  if(state.availableXp < item.price){
    toast('Nicht genug XP!', 'error');
    return;
  }

  state.availableXp -= item.price;

  if(item.type === 'consumable'){
    state.shop[item.key] = (state.shop[item.key] || 0) + (item.amount || 1);
    toast(`${item.title} gekauft!`, 'success');
  } else if(item.type === 'title'){
    if(!state.shop.ownedTitles.includes(item.title)) state.shop.ownedTitles.push(item.title);
    toast(`Titel „${item.title}“ freigeschaltet!`, 'success');
  }

  saveState();
  renderShop();
  renderDashboard();
};

window.buyShield = function(){ buyShopItem('streak_shield'); };
window.buyTitle = function(name){
  const item = SHOP_ITEMS.find(x=>x.title===name && x.type==='title');
  if(item) buyShopItem(item.id);
};
window.equipTitle = function(name){
  state.equipped.title = state.equipped.title === name ? null : name;
  saveState();
  renderShop();
  renderDashboard();
};
/* AI ASSISTANT */
const aiFab = document.getElementById('aiFab');
const aiWin = document.getElementById('aiChatWindow');
const aiInput = document.getElementById('aiInput');
const aiBody = document.getElementById('aiChatBody');
const aiStatus = document.getElementById('aiStatus');
const AI_HISTORY_KEY = 'momentum_ai_history_v1';
const AI_STATE_KEY = 'momentum_ai_state_v1';
let aiHistory = loadAiHistory();
let aiState = loadAiState();

aifabInit();
function aifabInit(){
  aiFab.addEventListener('click', ()=> aiWin.classList.toggle('open'));
  document.getElementById('aiCloseBtn').addEventListener('click', ()=> aiWin.classList.remove('open'));
  document.getElementById('aiSendBtn').addEventListener('click', ()=>sendAiMsg());
  aiInput.addEventListener('keydown', e=>{ if(e.key==='Enter') sendAiMsg(); });
  renderAiHistory();
  setAiStatus('local');
}
function loadAiHistory(){
  try { return JSON.parse(localStorage.getItem(AI_HISTORY_KEY) || '[]'); }
  catch(e){ return []; }
}
function loadAiState(){
  try {
    return JSON.parse(localStorage.getItem(AI_STATE_KEY) || '{"lastTopic":null,"lastWeatherScope":null,"lastSuggestedTask":null,"lastPlanIndex":0}');
  } catch(e){
    return { lastTopic:null, lastWeatherScope:null, lastSuggestedTask:null, lastPlanIndex:0 };
  }
}
function saveAiState(){
  localStorage.setItem(AI_STATE_KEY, JSON.stringify(aiState));
}
function saveAiHistory(){
  localStorage.setItem(AI_HISTORY_KEY, JSON.stringify(aiHistory.slice(-20)));
}
function renderAiHistory(){
  aiBody.innerHTML = '';
  const seed = aiHistory.length ? aiHistory : [{role:'assistant', content:'Hallo! Ich bin deine kleine Fokus-KI.\nIch helfe dir kostenlos bei Motivation, Tagesplanung, Wetter in Chemnitz, Fokus und praktischen Tipps zu deinen Aufgaben.'}];
  seed.forEach(m=> appendAiMsg(m.content, m.role==='user'?'user':'bot', false));
}
function appendAiMsg(text, sender='bot', store=true){
  const div = document.createElement('div');
  div.className = `ai-msg ${sender}`;
  div.textContent = text;
  aiBody.appendChild(div);
  aiBody.scrollTop = aiBody.scrollHeight;
  if(store){
    aiHistory.push({role: sender==='user'?'user':'assistant', content:text});
    aiHistory = aiHistory.slice(-20);
    saveAiHistory();
  }
}
function setAiStatus(mode='local'){
  if(!aiStatus) return;
  aiStatus.textContent = 'Lokal';
  aiStatus.className = 'ai-status local';
}
async function getWeatherContext(){
  try {
    const res = await fetch('https://wttr.in/Chemnitz?format=j1');
    const data = await res.json();
    const current = data.current_condition?.[0] || {};
    const weatherDays = data.weather || [];
    const currentDesc = current.lang_de?.[0]?.value || current.weatherDesc?.[0]?.value || 'unbekannt';
    const currentTemp = Number(current.temp_C || 0);
    const currentFeels = Number(current.FeelsLikeC || currentTemp);
    const currentRain = Number(current.precipMM || 0) > 0 || String(currentDesc).toLowerCase().includes('regen');
    const currentWind = Number(current.windspeedKmph || 0);

    const makeDay = (day, label) => {
      if(!day) return null;
      const noon = day.hourly?.find(h => String(h.time).padStart(4,'0') === '1200') || day.hourly?.[4] || day.hourly?.[0] || {};
      const desc = noon.lang_de?.[0]?.value || noon.weatherDesc?.[0]?.value || 'unbekannt';
      const rainChance = Number(noon.chanceofrain || 0);
      const wind = Number(noon.windspeedKmph || 0);
      const max = Number(day.maxtempC || 0);
      const min = Number(day.mintempC || 0);
      return {
        label,
        date: day.date,
        description: desc,
        minTempC: min,
        maxTempC: max,
        rainChance,
        windKmph: wind,
        avgTempC: Math.round((min + max) / 2),
        goodOutdoor: rainChance < 40 && max >= 8 && max <= 29 && wind < 35
      };
    };

    const todayForecast = makeDay(weatherDays[0], 'heute');
    const tomorrowForecast = makeDay(weatherDays[1], 'morgen');
    const dayAfterForecast = makeDay(weatherDays[2], 'übermorgen');

    return {
      ok: true,
      city: 'Chemnitz',
      current: {
        description: currentDesc,
        tempC: currentTemp,
        feelsLikeC: currentFeels,
        raining: currentRain,
        windKmph: currentWind,
        goodOutdoor: !currentRain && currentTemp >= 6 && currentTemp <= 29 && currentWind < 35
      },
      today: todayForecast,
      tomorrow: tomorrowForecast,
      dayAfterTomorrow: dayAfterForecast
    };
  } catch(e){
    return {
      ok:false,
      city:'Chemnitz',
      current:{ description:'unbekannt', tempC:null, feelsLikeC:null, raining:false, windKmph:null, goodOutdoor:null },
      today:null,
      tomorrow:null,
      dayAfterTomorrow:null
    };
  }
}
function getAiContext(weather){
  const today = getEffectiveToday();
  const todayTasks = getTasksForDate(today);
  const openTasks = todayTasks.filter(t=>!isTaskDone(today, t.id));
  const doneTasks = todayTasks.filter(t=>isTaskDone(today, t.id));
  const topOpen = [...openTasks].sort((a,b)=>(b.xp||0)-(a.xp||0)).slice(0,8).map(t=>({
    title:t.title, category:t.category, difficulty:t.difficulty, xp:t.xp, duration:t.duration || 30,
    priority:t.priority || 'mittel', description:t.description || ''
  }));
  return {
    today,
    currentLevel: levelProgress(state.totalXp).level,
    totalXp: state.totalXp,
    availableXp: state.availableXp,
    streak: computeCurrentStreak(),
    longestStreak: computeLongestStreak(),
    equippedTitle: state.equipped?.title || null,
    shields: state.shop?.shields || 0,
    tasksOpenCount: openTasks.length,
    tasksDoneCount: doneTasks.length,
    openTasks: topOpen,
    weather
  };
}
function formatWeatherDay(day){
  if(!day) return 'Dafür habe ich gerade keine Wetterdaten.';
  return `${day.label[0].toUpperCase()+day.label.slice(1)} in Chemnitz: ${day.minTempC}–${day.maxTempC}°C, ${day.description}, Regenwahrscheinlichkeit ${day.rainChance}%, Wind ${day.windKmph} km/h.`;
}
function getRequestedWeatherScope(lower){
  if(/übermorgen|uebermorgen/.test(lower)) return 'dayAfterTomorrow';
  if(/morgen/.test(lower)) return 'tomorrow';
  if(/heute/.test(lower)) return 'today';
  if(/jetzt|aktuell|gerade im moment|im moment/.test(lower)) return 'current';
  return 'auto';
}
function getDayMap(weather){
  return {
    current: weather.current,
    today: weather.today,
    tomorrow: weather.tomorrow,
    dayAfterTomorrow: weather.dayAfterTomorrow
  };
}
function getClothingAdvice(scope, weather){
  if(scope === 'current'){
    const cur = weather.current;
    if(cur.tempC == null) return 'Ich kann gerade keine Kleidungsempfehlung geben.';
    if(cur.raining) return 'Nimm besser eine Regenjacke oder einen Schirm mit. ☔';
    if(cur.tempC <= 5) return 'Ja — heute solltest du auf jeden Fall eine warme Jacke tragen. 🧥';
    if(cur.tempC <= 12) return 'Eine leichte bis normale Jacke wäre heute sinnvoll.';
    if(cur.tempC >= 25) return 'Eher keine Jacke nötig — eher leichte Kleidung.';
    return 'Eine dünne Jacke ist optional, aber nicht zwingend nötig.';
  }
  const day = getDayMap(weather)[scope];
  if(!day) return 'Dafür habe ich gerade keine Wetterdaten.';
  if(day.rainChance >= 50) return `${day.label[0].toUpperCase()+day.label.slice(1)} würde ich eine Regenjacke oder einen Schirm empfehlen. ☔`;
  if(day.maxTempC <= 6) return `${day.label[0].toUpperCase()+day.label.slice(1)} auf jeden Fall warm anziehen — Jacke ist Pflicht. 🧥`;
  if(day.maxTempC <= 13) return `${day.label[0].toUpperCase()+day.label.slice(1)} ist eine Jacke sinnvoll.`;
  if(day.maxTempC >= 25) return `${day.label[0].toUpperCase()+day.label.slice(1)} brauchst du wahrscheinlich keine Jacke.`;
  return `${day.label[0].toUpperCase()+day.label.slice(1)} reicht eher normale Kleidung, Jacke nur wenn du schnell frierst.`;
}
function getLearningWeatherAdvice(scope, weather){
  const day = scope==='current' ? weather.current : getDayMap(weather)[scope];
  if(!day) return 'Dafür habe ich gerade keine Wetterdaten.';
  const label = scope==='current' ? 'Gerade' : `${day.label[0].toUpperCase()+day.label.slice(1)}`;
  const badOutdoor = scope==='current' ? !day.goodOutdoor : !day.goodOutdoor;
  if(badOutdoor) return `${label} ist eher gutes Lernwetter: ${scope==='current' ? `${day.tempC}°C und ${day.description}` : `${day.description}, ${day.minTempC}–${day.maxTempC}°C`}. Perfekt für konzentrierte Indoor-Aufgaben. 📚`;
  return `${label} ist das Wetter eher verlockend für draußen. Wenn du lernen willst, plane lieber einen klaren Fokusblock und geh danach raus. ☀️`;
}
function compareOutdoorDays(weather, includeDayAfter=false){
  const days = [weather.today, weather.tomorrow, ...(includeDayAfter ? [weather.dayAfterTomorrow] : [])].filter(Boolean);
  if(days.length===0) return 'Ich habe gerade nicht genug Wetterdaten für einen Vergleich.';
  const scored = days.map(d=>({
    ...d,
    score: (d.goodOutdoor ? 50 : 0) + (30 - Math.abs((d.maxTempC ?? d.avgTempC ?? 18) - 20)) - d.rainChance * 0.4 - d.windKmph * 0.25
  })).sort((a,b)=>b.score-a.score);
  const best = scored[0];
  return `Am besten für Outdoor wirkt ${best.label} in Chemnitz: ${best.description}, ${best.minTempC}–${best.maxTempC}°C, ${best.rainChance}% Regenchance, ${best.windKmph} km/h Wind.`;
}
function answerWeatherQuestion(lower, weather){
  if(!weather?.ok) return 'Ich konnte die Wetterdaten für Chemnitz gerade nicht laden.';
  const scope = getRequestedWeatherScope(lower);
  const wantsTemp = /temperatur|grad|warm|kalt|heiß|heiss/.test(lower);
  const wantsRain = /regen|regnet|niederschlag|schirm/.test(lower);
  const wantsWind = /wind|windig|sturm/.test(lower);
  const wantsOutdoor = /outdoor|raus|draußen|draussen|spazieren|joggen|laufen|sport/.test(lower);
  const wantsJacket = /jacke|anziehen|kleidung|mütze|schal/.test(lower);
  const wantsLearning = /lernwetter|lernen|lernen heute|lernen morgen|konzentriert lernen/.test(lower);
  const wantsCompare = /(heute oder morgen|morgen oder heute|besser.*heute.*morgen|besser.*morgen.*heute|wann.*besser.*raus|welcher tag.*besser.*draußen|beste tag.*draußen|outdoor.*heute.*morgen|sport.*heute.*morgen)/.test(lower);
  const wantsCompare3 = /(übermorgen.*morgen|morgen.*übermorgen|heute.*übermorgen|bester tag|welcher tag ist am besten)/.test(lower);

  if(wantsCompare) return compareOutdoorDays(weather, false);
  if(wantsCompare3) return compareOutdoorDays(weather, true);
  if(wantsJacket) return getClothingAdvice(scope === 'auto' ? 'current' : scope, weather);
  if(wantsLearning) return getLearningWeatherAdvice(scope === 'auto' ? 'today' : scope, weather);

  if(scope === 'current' || scope === 'auto'){
    if(scope === 'current' || (!/heute|morgen|übermorgen|uebermorgen/.test(lower) && (wantsTemp || wantsRain || wantsWind || wantsOutdoor || /wetter|chemnitz/.test(lower)))){
      const cur = weather.current;
      if(wantsTemp) return `Aktuell in Chemnitz: ${cur.tempC}°C, gefühlt ${cur.feelsLikeC}°C, ${cur.description}.`;
      if(wantsRain) return cur.raining ? `Ja, aktuell regnet es in Chemnitz. (${cur.description}) 🌧️` : `Nein, aktuell regnet es in Chemnitz nicht. Es ist ${cur.description}.`;
      if(wantsWind) return `Aktuell hat Chemnitz etwa ${cur.windKmph} km/h Wind bei ${cur.description}.`;
      if(wantsOutdoor) return cur.goodOutdoor ? `Gerade ist das Wetter in Chemnitz gut für draußen: ${cur.tempC}°C und ${cur.description}. ☀️` : `Gerade ist das Wetter in Chemnitz eher nicht ideal für draußen: ${cur.tempC}°C und ${cur.description}.`;
      return `Aktuell in Chemnitz: ${cur.tempC}°C, gefühlt ${cur.feelsLikeC}°C, ${cur.description}, Wind ${cur.windKmph} km/h.`;
    }
  }

  const map = {
    today: weather.today,
    tomorrow: weather.tomorrow,
    dayAfterTomorrow: weather.dayAfterTomorrow
  };
  const day = map[scope];
  if(!day) return 'Dafür habe ich gerade keine Wetterdaten.';

  if(wantsTemp) return `${day.label[0].toUpperCase()+day.label.slice(1)} werden in Chemnitz etwa ${day.minTempC} bis ${day.maxTempC}°C erwartet.`;
  if(wantsRain) return `${day.label[0].toUpperCase()+day.label.slice(1)} liegt die Regenwahrscheinlichkeit in Chemnitz bei etwa ${day.rainChance}%. (${day.description})`;
  if(wantsWind) return `${day.label[0].toUpperCase()+day.label.slice(1)} wird in Chemnitz ungefähr ${day.windKmph} km/h Wind erwartet.`;
  if(wantsOutdoor) return day.goodOutdoor
    ? `${day.label[0].toUpperCase()+day.label.slice(1)} sieht das Wetter in Chemnitz gut für draußen aus: ${day.description}, ${day.minTempC}–${day.maxTempC}°C.`
    : `${day.label[0].toUpperCase()+day.label.slice(1)} ist das Wetter in Chemnitz eher nicht optimal für draußen: ${day.description}, ${day.minTempC}–${day.maxTempC}°C, ${day.rainChance}% Regenchance.`;
  return formatWeatherDay(day);
}
function inferAiTopic(lower){
  if(/motivier|motivation|keine lust|unmotiviert|ich will nicht/.test(lower)) return 'motivation';
  if(/welche aufgabe|was soll ich|jetzt machen|nächste aufgabe|womit anfangen/.test(lower)) return 'task';
  if(/plan meinen tag|plan mein tag|tagesplan|tag planen|erstelle mir einen plan/.test(lower)) return 'plan';
  if(/wetter|chemnitz|regen|raus|outdoor|temperatur|wind|übermorgen|uebermorgen|morgen|heute|aktuell|jetzt|jacke|anziehen|kleidung|lernen|lernwetter|sport/.test(lower)) return 'weather';
  if(/fokus|konzentrier|ablenk|konzentration/.test(lower)) return 'focus';
  if(/streak|level|xp/.test(lower)) return 'progress';
  if(/tipp|tipps|rat|besser werden|produktiver/.test(lower)) return 'tips';
  if(/pause|erschöpft|müde/.test(lower)) return 'pause';
  return 'general';
}
function isFollowUp(lower){
  return /^(und|okay und|gut und|was ist mit|wie sieht es aus mit|und wie|und morgen|und heute|und übermorgen|und was danach|was danach|danach\??|welcher davon|was ist besser|besser heute oder morgen)/.test(lower.trim());
}
function chooseStudyVsSport(ctx){
  const open = ctx.openTasks || [];
  const study = open.filter(t=>['lernen','arbeit'].includes(t.category));
  const sport = open.filter(t=>['fitness','gesundheit'].includes(t.category));
  const bestStudy = [...study].sort((a,b)=>(b.xp||0)-(a.xp||0))[0];
  const bestSport = [...sport].sort((a,b)=>(b.xp||0)-(a.xp||0))[0];
  const weatherOk = ctx.weather?.current?.goodOutdoor;
  if(bestSport && weatherOk && !bestStudy) return {choice:'sport', reason:`Du hast eine passende Bewegungsaufgabe offen („${bestSport.title}“) und das Wetter ist gerade gut dafür.`};
  if(bestStudy && !bestSport) return {choice:'lernen', reason:`Gerade ist eine Lern-/Arbeitsaufgabe sinnvoller, z. B. „${bestStudy.title}“.`};
  if(bestSport && bestStudy){
    if(weatherOk && (bestSport.xp >= bestStudy.xp || bestSport.priority === 'hoch')){
      return {choice:'sport', reason:`Das Wetter passt und „${bestSport.title}“ ist gerade besonders attraktiv (${bestSport.xp} XP). Danach kannst du mit „${bestStudy.title}“ weitermachen.`};
    }
    return {choice:'lernen', reason:`Ich würde zuerst lernen/arbeiten: „${bestStudy.title}“. Das ist meist besser für den Kopf, solange du noch frisch bist.${weatherOk ? ' Sport kannst du danach draußen machen.' : ' Das Wetter ist gerade außerdem nicht perfekt für draußen.'}`};
  }
  return {choice:'lernen', reason:'Wenn du zwischen Lernen und Sport schwankst, fang mit dem wichtigeren offenen Ziel an und nutze Sport als aktiven Reset danach.'};
}
function buildFollowUpReply(lower, ctx){
  const topic = aiState.lastTopic;
  if(topic === 'weather') return answerWeatherQuestion(lower, ctx.weather);
  if(topic === 'task'){
    const open = ctx.openTasks || [];
    if(/danach|was danach|und danach/.test(lower)){
      const next = open.find(t=>t.title !== aiState.lastSuggestedTask) || open[0];
      return next ? `Danach würde ich mit „${next.title}“ weitermachen. So bleibst du im Flow.` : 'Danach wäre eine kurze Pause sinnvoll.';
    }
  }
  if(topic === 'plan' && /und danach|danach|was danach/.test(lower)){
    return 'Nach deinem ersten Block: 5–10 Minuten Pause, Wasser trinken und dann die nächste Aufgabe mit hoher Priorität angehen.';
  }
  if(topic === 'motivation' && /und wie fange ich an|wie anfangen|erster schritt/.test(lower)){
    const top = ctx.openTasks?.[0];
    return `Erster Schritt: ${top ? `Starte nur mit „${top.title}“ für 10 Minuten.` : 'Starte mit einem sehr kleinen Schritt für 10 Minuten.'} Kein Perfektionismus — nur anfangen.`;
  }
  return null;
}
function buildLocalAiReply(message, ctx){
  const lower = message.toLowerCase();
  const tasks = ctx.openTasks;
  const weather = ctx.weather;
  const top = tasks[0];
  const weatherText = weather?.ok ? `${weather.current.tempC}°C, ${weather.current.description}` : 'Wetterdaten gerade nicht verfügbar';
  const streakText = `Du bist bei ${ctx.streak} Tagen Streak und Level ${ctx.currentLevel}.`;
  const topic = inferAiTopic(lower);

  if(isFollowUp(lower)){
    const followUpReply = buildFollowUpReply(lower, ctx);
    if(followUpReply) return followUpReply;
  }

  if(/lernen oder sport|sport oder lernen|soll ich.*lernen.*sport|soll ich.*sport.*lernen/.test(lower)){
    const choice = chooseStudyVsSport(ctx);
    aiState.lastTopic = 'decision';
    saveAiState();
    return `Meine Entscheidung: ${choice.choice === 'sport' ? 'eher Sport' : 'eher Lernen/Arbeit'}.

${choice.reason}`;
  }

  if(/motivier|motivation|keine lust|unmotiviert|ich will nicht/.test(lower)){
    aiState.lastTopic = 'motivation';
    saveAiState();
    if(ctx.tasksOpenCount===0) return `Stark — du hast heute schon alles erledigt. 🎉\n${streakText}\nJetzt ist Erholung keine Schwäche, sondern Teil vom Fortschritt.`;
    return `Okay, ganz einfach: Du musst heute nicht alles schaffen — nur den nächsten Schritt.\n\n${streakText}\nStarte mit ${top ? `„${top.title}“` : 'einer kleinen Aufgabe'} für nur ${top?.duration || 15} Minuten. Danach schauen wir weiter. 🔥`;
  }
  if(/welche aufgabe|was soll ich|jetzt machen|nächste aufgabe|womit anfangen/.test(lower)){
    aiState.lastTopic = 'task';
    aiState.lastSuggestedTask = top?.title || null;
    saveAiState();
    if(!top) return 'Du hast gerade keine offenen Aufgaben mehr. Sehr stark. ✅';
    const weatherHint = weather?.current?.goodOutdoor===false && ['fitness','gesundheit'].includes(top.category)
      ? '\nDas Wetter in Chemnitz ist dafür gerade nicht ideal — wenn möglich, nimm eine Indoor-Alternative.' : '';
    return `Meine Empfehlung: Fang jetzt mit „${top.title}“ an.\nGrund: Priorität ${top.priority}, Schwierigkeit ${top.difficulty}, ${top.xp} XP Belohnung.${weatherHint}`;
  }
  if(/plan meinen tag|plan mein tag|tagesplan|tag planen|erstelle mir einen plan/.test(lower)){
    aiState.lastTopic = 'plan';
    aiState.lastPlanIndex = 0;
    saveAiState();
    if(tasks.length===0) return 'Für heute ist nichts Offenes mehr da — dein Tag ist schon gut abgeschlossen. 🎉';
    let clock = new Date();
    clock.setMinutes(Math.ceil(clock.getMinutes()/15)*15, 0, 0);
    const schedule = tasks.slice(0,5).map(t=>{
      const start = new Date(clock);
      clock.setMinutes(clock.getMinutes() + (t.duration||30));
      const end = new Date(clock);
      clock.setMinutes(clock.getMinutes() + 10);
      const f = d => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
      const weatherFlag = (['fitness','gesundheit'].includes(t.category) && weather?.current?.goodOutdoor===false) ? ' · besser drinnen' : '';
      return `${f(start)}–${f(end)}  ${t.title} (${t.priority}, ${t.xp} XP${weatherFlag})`;
    }).join('\n');
    return `Hier ist dein kompakter Plan:\n\n${schedule}\n\nWetter in Chemnitz gerade: ${weatherText}.${weather?.current?.goodOutdoor ? '\nOutdoor ist aktuell okay.' : weather?.current?.goodOutdoor===false ? '\nIch würde zuerst Indoor-Aufgaben machen.' : ''}`;
  }
  if(/wetter|chemnitz|regen|raus|outdoor|temperatur|wind|übermorgen|uebermorgen|morgen|heute|aktuell|jetzt|jacke|anziehen|kleidung|lernen|lernwetter|sport/.test(lower)){
    aiState.lastTopic = 'weather';
    aiState.lastWeatherScope = getRequestedWeatherScope(lower);
    saveAiState();
    return answerWeatherQuestion(lower, weather);
  }
  if(/fokus|konzentrier|ablenk|konzentration/.test(lower)){
    aiState.lastTopic = 'focus';
    saveAiState();
    return `Mini-Fokusplan:\n1. Eine Aufgabe wählen\n2. 25 Minuten Timer\n3. Handy außer Sicht\n4. Kein Multitasking\n5. Danach 5 Minuten Pause\n\nMein Vorschlag jetzt: ${top ? `mit „${top.title}“ anfangen.` : 'mit der kleinsten offenen Aufgabe anfangen.'}`;
  }
  if(/streak|level|xp/.test(lower)){
    aiState.lastTopic = 'progress';
    saveAiState();
    return `Status-Check:\n- Level: ${ctx.currentLevel}\n- Gesamt-XP: ${ctx.totalXp}\n- Shop-XP: ${ctx.availableXp}\n- Aktuelle Streak: ${ctx.streak} Tage\n- Längste Streak: ${ctx.longestStreak} Tage\n- Streak-Schilde: ${ctx.shields}`;
  }
  if(/tipp|tipps|rat|besser werden|produktiver/.test(lower)){
    aiState.lastTopic = 'tips';
    saveAiState();
    return `Drei schnelle Produktivitäts-Tipps:\n1. Erst hohe Priorität oder viel XP\n2. Große Aufgaben in 20–30 Minuten Blöcke teilen\n3. Nach jeder erledigten Aufgabe kurz resetten\n\nHeute wäre ${top ? `„${top.title}“` : 'die nächste kleine Aufgabe'} ein guter Start.`;
  }
  if(/pause|erschöpft|müde/.test(lower)){
    aiState.lastTopic = 'pause';
    saveAiState();
    return `Dann geh kurz runter vom Gas.\nMach 5–10 Minuten Pause, trink Wasser und starte danach mit etwas Leichtem.\nWenn du willst, kann ich dir direkt die entspannteste nächste Aufgabe nennen.`;
  }
  aiState.lastTopic = topic;
  saveAiState();
  return `Ich kann dir helfen bei:\n- Motivation\n- Tagesplanung\n- Wetter in Chemnitz (jetzt, heute, morgen, übermorgen)\n- Kleidung / Jacke\n- Fokus & Konzentration\n- Outdoor-Sport & Lernwetter\n- Lernen oder Sport\n- Nächste Aufgabe\n- Tipps zu deinen Zielen\n\nProbier z. B.:\n„Brauche ich heute eine Jacke?“\n„Regnet es morgen?“\n„Ist morgen gutes Lernwetter?“\n„Soll ich Outdoor-Sport heute oder morgen machen?“\n„Soll ich jetzt lernen oder Sport machen?“`;
}
window.sendAiMsg = async function(text){
  if(!text) text = aiInput.value.trim();
  if(!text) return;
  aiInput.value = '';
  appendAiMsg(text, 'user');

  const loadDiv = document.createElement('div');
  loadDiv.className = 'ai-msg bot';
  loadDiv.textContent = '...denkt nach...';
  aiBody.appendChild(loadDiv);
  aiBody.scrollTop = aiBody.scrollHeight;

  const weather = await getWeatherContext();
  const ctx = getAiContext(weather);
  const reply = buildLocalAiReply(text, ctx);

  setTimeout(()=>{
    loadDiv.remove();
    setAiStatus('local');
    appendAiMsg(reply, 'bot');
  }, 350);
};

/* GOAL MODAL & FORMS */
let formState = { editingId:null, emoji:'🎯', color:GOAL_COLORS[0], repeatType:'once', subquests:[], isHabit:false };

function renderSubquestEditor(){
  const list = document.getElementById('subquestEditorList');
  list.innerHTML = formState.subquests.map(sq=>`<div class="subquest-editor-item" data-sub-id="${sq.id}"><span>${escapeHtml(sq.title)}</span><button type="button" data-remove-sub="${sq.id}">${iconSVG('x',14)}</button></div>`).join('');
  list.querySelectorAll('[data-remove-sub]').forEach(btn=>btn.addEventListener('click', ()=>{ formState.subquests = formState.subquests.filter(sq=>sq.id!==btn.dataset.removeSub); renderSubquestEditor(); }));
}
document.getElementById('addSubquestBtn').addEventListener('click', ()=>{ const inp = document.getElementById('fSubquestInput'); if(!inp.value.trim()) return; formState.subquests.push({id:uid(), title:inp.value.trim()}); inp.value=''; renderSubquestEditor(); });

function buildPickers(){
  document.getElementById('fCategory').innerHTML = CATEGORIES.map(c=>`<option value="${c.id}">${c.emoji} ${c.label}</option>`).join('');
  document.getElementById('categoryFilter').innerHTML = `<option value="all">Alle Kategorien</option>` + CATEGORIES.map(c=>`<option value="${c.id}">${c.emoji} ${c.label}</option>`).join('');
  document.getElementById('emojiPicker').innerHTML = EMOJIS.map(e=>`<button type="button" class="emoji-opt">${e}</button>`).join('');
  document.getElementById('emojiPicker').addEventListener('click', e=>{ if(e.target.tagName==='BUTTON'){ document.querySelectorAll('.emoji-opt').forEach(b=>b.classList.remove('active')); e.target.classList.add('active'); formState.emoji = e.target.textContent; } });
  document.getElementById('weekdayPicker').innerHTML = WEEKDAY_LABELS.map((l,i)=>`<button type="button" class="chip" data-day="${i}">${l}</button>`).join('');
  document.getElementById('weekdayPicker').addEventListener('click', e=>{ if(e.target.tagName==='BUTTON') e.target.classList.toggle('active'); });
  document.getElementById('repeatTypeGroup').addEventListener('click', e=>{ if(e.target.tagName==='BUTTON'){ document.querySelectorAll('#repeatTypeGroup .chip').forEach(b=>b.classList.remove('active')); e.target.classList.add('active'); formState.repeatType = e.target.dataset.repeat; updateRepeatFields(); } });
  document.getElementById('fDifficulty').addEventListener('change', e=>{ document.getElementById('fXp').value = DIFFICULTY_XP[e.target.value] ?? 25; });
  document.getElementById('habitToggle').addEventListener('click', ()=>{ formState.isHabit = !formState.isHabit; document.getElementById('habitToggle').classList.toggle('on', formState.isHabit); document.getElementById('habitDaysField').classList.toggle('hidden', !formState.isHabit); });
  document.getElementById('accentSwatches').innerHTML = GOAL_COLORS.map(c=>`<button type="button" class="swatch" data-accent="${c}" style="background:${c}"></button>`).join('');
  document.getElementById('accentSwatches').addEventListener('click', e=>{ if(e.target.tagName==='BUTTON'){ state.settings.accent = e.target.dataset.accent; applyTheme(); saveState(); renderSettings(); } });
}
function updateRepeatFields(){
  document.getElementById('weekdayField').classList.toggle('hidden', formState.repeatType!=='weekdays');
  document.getElementById('weeklyField').classList.toggle('hidden', formState.repeatType!=='weekly');
  document.getElementById('dateField').classList.toggle('hidden', formState.repeatType!=='date');
  document.getElementById('intervalField').classList.toggle('hidden', formState.repeatType!=='interval');
}

function openGoalModal(editGoal=null){
  formState = { editingId: editGoal?editGoal.id:null, emoji: editGoal?editGoal.icon:'🎯', repeatType: editGoal?editGoal.repeat.type:'once', subquests: editGoal?.subquests?JSON.parse(JSON.stringify(editGoal.subquests)):[], isHabit: !!(editGoal?.habit?.enabled) };
  renderSubquestEditor();
  document.getElementById('goalModalTitle').textContent = editGoal? 'Ziel bearbeiten' : 'Neues Ziel';
  document.getElementById('fTitle').value = editGoal?.title || ''; document.getElementById('fDesc').value = editGoal?.description || '';
  document.getElementById('fCategory').value = editGoal?.category || CATEGORIES[0].id; document.getElementById('fPriority').value = editGoal?.priority || 'mittel';
  document.getElementById('fDifficulty').value = editGoal?.difficulty || 'mittel'; document.getElementById('fXp').value = editGoal?.xp ?? 25;
  document.getElementById('fDuration').value = editGoal?.duration ?? 30; document.getElementById('fDate').value = editGoal?.repeat?.date || getEffectiveToday();
  document.querySelectorAll('.emoji-opt').forEach(b=>b.classList.toggle('active', b.textContent===formState.emoji));
  document.querySelectorAll('#repeatTypeGroup .chip').forEach(b=>b.classList.toggle('active', b.dataset.repeat===formState.repeatType));
  document.querySelectorAll('#weekdayPicker .chip').forEach(b=>{ b.classList.toggle('active', !!(editGoal?.repeat?.type==='weekdays' && editGoal.repeat.weekdays.includes(Number(b.dataset.day)))); });
  document.getElementById('habitToggle').classList.toggle('on', formState.isHabit); document.getElementById('habitDaysField').classList.toggle('hidden', !formState.isHabit);
  updateRepeatFields(); document.getElementById('goalModalOverlay').classList.add('open');
}
function closeGoalModal(){ document.getElementById('goalModalOverlay').classList.remove('open'); }

document.getElementById('newGoalBtn').addEventListener('click', ()=>openGoalModal());
document.getElementById('goalCancelBtn').addEventListener('click', closeGoalModal);
document.getElementById('goalModalClose').addEventListener('click', closeGoalModal);

document.getElementById('goalSaveBtn').addEventListener('click', ()=>{
  const title = document.getElementById('fTitle').value.trim(); if(!title){ toast("Titel fehlt!", "error"); return; }
  let repeat = {type: formState.repeatType};
  if(formState.repeatType==='once' || formState.repeatType==='date') repeat.date = document.getElementById('fDate').value || getEffectiveToday();
  else if(formState.repeatType==='weekdays') repeat.weekdays = [...document.querySelectorAll('#weekdayPicker .chip.active')].map(b=>Number(b.dataset.day));
  else if(formState.repeatType==='interval') { repeat.intervalDays = Number(document.getElementById('fInterval').value)||2; repeat.startDate = getEffectiveToday(); }
  else if(formState.repeatType==='weekly') repeat.timesPerWeek = Number(document.getElementById('fWeeklyCount').value)||2;
  
  let habit = null; if(formState.isHabit) habit = { enabled: true, days: Number(document.getElementById('fHabitDays').value)||70, startDate: getEffectiveToday(), completedNotified: false };

  const goalData = { title, description: document.getElementById('fDesc').value.trim(), category: document.getElementById('fCategory').value, priority: document.getElementById('fPriority').value, difficulty: document.getElementById('fDifficulty').value, xp: Number(document.getElementById('fXp').value)||25, duration: Number(document.getElementById('fDuration').value)||30, icon: formState.emoji, color: state.settings.accent, repeat, habit, subquests: formState.subquests };
  if(formState.editingId){ Object.assign(state.goals.find(g=>g.id===formState.editingId), goalData); toast('Aktualisiert', 'success'); } 
  else { goalData.id = uid(); goalData.createdDate = getEffectiveToday(); state.goals.push(goalData); toast('Erstellt', 'success'); }
  saveState(); closeGoalModal(); renderDashboard();
});

/* MODALS */
let dateCb=null;
function openDateModal(title, defaultDate, cb){ document.getElementById('dateModalTitle').textContent=title; document.getElementById('targetDateInput').value=addDays(defaultDate,1); dateCb=cb; document.getElementById('dateModalOverlay').classList.add('open'); }
document.getElementById('dateConfirmBtn').addEventListener('click', ()=>{ const v=document.getElementById('targetDateInput').value; if(v){ document.getElementById('dateModalOverlay').classList.remove('open'); if(dateCb) dateCb(v); }});
document.getElementById('dateCancelBtn').addEventListener('click', ()=>document.getElementById('dateModalOverlay').classList.remove('open')); document.getElementById('dateModalClose').addEventListener('click', ()=>document.getElementById('dateModalOverlay').classList.remove('open'));

let confCb=null;
function openConfirm(title, text, cb){ document.getElementById('confirmTitle').textContent=title; document.getElementById('confirmText').textContent=text; confCb=cb; document.getElementById('confirmModalOverlay').classList.add('open'); }
document.getElementById('confirmOkBtn').addEventListener('click', ()=>{ document.getElementById('confirmModalOverlay').classList.remove('open'); if(confCb) confCb(); });
document.getElementById('confirmCancelBtn').addEventListener('click', ()=>document.getElementById('confirmModalOverlay').classList.remove('open'));

/* SETTINGS & UTILS */
function applyTheme(){
  document.documentElement.setAttribute('data-theme', state.settings.theme);
  document.getElementById('themeToggleBtn').innerHTML = iconSVG('sun',17);
  document.documentElement.style.setProperty('--primary', state.settings.accent);
  let hex = state.settings.accent.replace('#','');
  let r = parseInt(hex.substring(0,2), 16), g = parseInt(hex.substring(2,4), 16), b = parseInt(hex.substring(4,6), 16);
  document.documentElement.style.setProperty('--primary-rgb', `${r},${g},${b}`);
}

function renderSettings(){
  document.querySelectorAll('#accentSwatches .swatch').forEach(s=>s.classList.toggle('active', s.dataset.accent===state.settings.accent));
  document.getElementById('lightModeToggle').classList.toggle('on', state.settings.theme==='light');
  document.getElementById('resetHourSelect').value = state.settings.resetHour;
}
document.getElementById('lightModeToggle').addEventListener('click', ()=>{ state.settings.theme = state.settings.theme==='light'?'dark':'light'; applyTheme(); saveState(); renderSettings(); });
document.getElementById('resetHourSelect').addEventListener('change', e=>{ state.settings.resetHour = Number(e.target.value); saveState(); renderDashboard(); });
document.getElementById('exportBtn').addEventListener('click', ()=>{ const url = URL.createObjectURL(new Blob([JSON.stringify(state,null,2)], {type:'application/json'})); const a = document.createElement('a'); a.href=url; a.download=`momentum-backup-${getEffectiveToday()}.json`; a.click(); URL.revokeObjectURL(url); toast('Exportiert','success'); });
document.getElementById('importBtn').addEventListener('click', ()=>document.getElementById('importFile').click());
document.getElementById('importFile').addEventListener('change', e=>{ const f = e.target.files[0]; if(!f) return; const r = new FileReader(); r.onload=()=>{ try{ const d=JSON.parse(r.result); if(!d.goals)throw 1; state=Object.assign(defaultState(),d); saveState(); applyTheme(); renderDashboard(); renderSettings(); toast('Importiert','success'); }catch(err){toast('Fehler','error');} }; r.readAsText(f); e.target.value=''; });
document.getElementById('resetBtn').addEventListener('click', ()=>openConfirm('Alles löschen?','Unwiderruflich!',()=>{ state=defaultState(); saveState(); applyTheme(); renderDashboard(); renderSettings(); toast('Gelöscht','success'); }));

document.querySelectorAll('.chart-tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('.chart-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    currentChartRange = tab.dataset.range || 'week';
    renderStats();
  });
});

document.getElementById('goalModalOverlay').addEventListener('click', (e)=>{ if(e.target.id === 'goalModalOverlay') closeGoalModal(); });
document.getElementById('dateModalOverlay').addEventListener('click', (e)=>{ if(e.target.id === 'dateModalOverlay') document.getElementById('dateModalOverlay').classList.remove('open'); });
document.getElementById('confirmModalOverlay').addEventListener('click', (e)=>{ if(e.target.id === 'confirmModalOverlay') document.getElementById('confirmModalOverlay').classList.remove('open'); });

function switchView(view){
  document.querySelectorAll('.view').forEach(v=>v.hidden=true); document.getElementById('view-'+view).hidden=false;
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active', n.dataset.view===view));
  if(view==='dashboard') renderDashboard(); if(view==='calendar') renderCalendar(); if(view==='stats') renderStats(); if(view==='shop') renderShop(); if(view==='settings') renderSettings();
}
document.querySelectorAll('.nav-item').forEach(btn=>{ btn.addEventListener('click', ()=>switchView(btn.dataset.view)); });

function toast(msg, type='info'){
  const stack = document.getElementById('toastStack'); const el = document.createElement('div'); el.className = `toast ${type}`;
  el.innerHTML = `<span class="icon">${iconSVG('check',18)}</span><span>${msg}</span>`;
  stack.appendChild(el); setTimeout(()=>{ el.classList.add('out'); setTimeout(()=>el.remove(),320); }, 3200);
}

function init(){
  mountIcons(); buildPickers(); applyTheme();
  if(state.goals.length===0 && !localStorage.getItem('m_seed')){
    state.goals.push(
      {id:uid(), title:'30 Min. Sport', description:'Joggen im Freien', category:'fitness', priority:'hoch', difficulty:'mittel', icon:'💪', color:'#5B8CFF', xp:30, repeat:{type:'daily'}, createdDate:getEffectiveToday()},
      {id:uid(), title:'Lesen', description:'15 Seiten', category:'lernen', priority:'mittel', difficulty:'leicht', icon:'📖', color:'#7C4DFF', xp:15, repeat:{type:'daily'}, createdDate:getEffectiveToday()}
    ); localStorage.setItem('m_seed','1'); saveState();
  }
  renderDashboard(); renderSettings();
}

init();
loadWisdom()
testConnection()
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebarEl = document.querySelector('.sidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');

hamburgerBtn?.addEventListener('click', () => {
  sidebarEl.classList.toggle('open');
  sidebarBackdrop.classList.toggle('show');
});
sidebarBackdrop?.addEventListener('click', () => {
  sidebarEl.classList.remove('open');
  sidebarBackdrop.classList.remove('show');
});
document.querySelectorAll('.sidebar .nav-item').forEach(btn=>{
  btn.addEventListener('click', () => {
    sidebarEl.classList.remove('open');
    sidebarBackdrop.classList.remove('show');
  });
});
const searchWrap = document.querySelector('.search-wrap');
const searchIcon = searchWrap?.querySelector('.icon');
const searchInput = document.getElementById('searchInput');

searchIcon?.addEventListener('click', () => {
  if (window.innerWidth <= 600) {
    searchWrap.classList.toggle('expanded');
    if (searchWrap.classList.contains('expanded')) {
      searchInput.focus();
    }
  }
});

document.addEventListener('click', (e) => {
  if (window.innerWidth <= 600 && searchWrap.classList.contains('expanded') && !searchWrap.contains(e.target)) {
    searchWrap.classList.remove('expanded');
  }
});

// Theme Toggle Logik
const themeToggleBtn = document.getElementById('themeToggleBtn');
const lightModeToggle = document.getElementById('lightModeToggle');

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    state.settings.theme = currentTheme;
    saveState();
    updateToggleButtons();
}

function updateToggleButtons() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    // Sync Haupt-Toggle
    if (lightModeToggle) {
        lightModeToggle.classList.toggle('on', isLight);
    }
    // Sync Icon-Button in Topbar
    if (themeToggleBtn) {
        themeToggleBtn.innerHTML = isLight ? iconSVG('sun') : iconSVG('sun'); // Du kannst hier das Icon anpassen
        themeToggleBtn.title = isLight ? "Dunkler Modus" : "Heller Modus";
    }
}
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
});

// Event-Listener setzen
if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
if (lightModeToggle) lightModeToggle.addEventListener('click', toggleTheme);

// Beim Laden initialisieren
const initialTheme = state.settings.theme || 'dark';
document.documentElement.setAttribute('data-theme', initialTheme);
updateToggleButtons();