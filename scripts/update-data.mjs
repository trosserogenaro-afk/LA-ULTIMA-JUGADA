// Actualiza data/luj-data.json desde API-Football (v3).
// Uso: APIFOOTBALL_KEY=... node scripts/update-data.mjs
// Opcional: FORCE_STANDINGS=1 para refrescar tablas en esta corrida.
//
// Presupuesto del plan gratuito (100 consultas/día):
//  - 1 consulta de fixtures por corrida.
//  - Goleadores solo para partidos en vivo o finalizados sin caché.
//  - Tablas solo en las corridas de 00:00, 03:00 y 12:00 UTC.

import { readFile, writeFile } from "node:fs/promises";

const KEY = process.env.APIFOOTBALL_KEY;
if (!KEY) {
  console.error("Falta el secreto APIFOOTBALL_KEY");
  process.exit(1);
}

const BASE = "https://v3.football.api-sports.io";
const TZ = "America/Argentina/Buenos_Aires";
const OUT = new URL("../data/luj-data.json", import.meta.url);
const MAX_CALLS = 90; // margen bajo el límite de 100/día

// IDs de liga de API-Football: VERIFICAR con /leagues?search=... antes de usar en producción.
const LEAGUES = {
  arg: { id: 128, comp: "🇦🇷 Liga Profesional (Clausura)" },
  epl: { id: 39, comp: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League" },
  la_liga: { id: 140, comp: "🇪🇸 La Liga" },
  serie_a: { id: 135, comp: "🇮🇹 Serie A" },
  bundesliga: { id: 78, comp: "🇩🇪 Bundesliga" },
  ucl: { id: 2, comp: "⭐ Champions League" },
};
const SEASON = Number(process.env.SEASON || new Date().getUTCFullYear());

let calls = 0;
async function api(path, params) {
  if (calls >= MAX_CALLS) throw new Error("Límite de consultas de la corrida alcanzado");
  calls++;
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url, { headers: { "x-apisports-key": KEY } });
  if (!res.ok) throw new Error(`${path} HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors && Object.keys(json.errors).length) {
    throw new Error(`${path}: ${JSON.stringify(json.errors)}`);
  }
  return json.response || [];
}

const arDate = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const arHM = (iso) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));

const LIVE = ["1H", "2H", "ET", "P", "BT", "LIVE", "HT"];
const FINAL = ["FT", "AET", "PEN"];

function mapStatus(short) {
  if (LIVE.includes(short)) return "live";
  if (FINAL.includes(short)) return "final";
  return "sched";
}

// Goleadores desde /fixtures/events. Para autogoles, el gol suma al equipo contrario.
function scorersFromEvents(events, homeId) {
  return events
    .filter((e) => e.type === "Goal")
    .map((e) => {
      const own = e.detail === "Own Goal";
      const teamIsHome = e.team?.id === homeId;
      const benefits = own ? !teamIsHome : teamIsHome;
      const extra = e.time?.extra ? `+${e.time.extra}` : "";
      return {
        who: e.player?.name || "?",
        min: e.time?.elapsed != null ? `${e.time.elapsed}${extra}` : "",
        side: benefits ? "home" : "away",
        home: benefits,
        own,
      };
    });
}

function standingRow(r) {
  return {
    r: r.rank,
    t: r.team.name,
    pj: r.all.played,
    w: r.all.win,
    d: r.all.draw,
    l: r.all.lose,
    gf: r.all.goals.for,
    gc: r.all.goals.against,
    dif: r.goalsDiff,
    pts: r.points,
  };
}

async function readPrevious() {
  try {
    return JSON.parse(await readFile(OUT, "utf8"));
  } catch {
    return { eventsCache: {}, standings: {} };
  }
}

async function main() {
  const prev = await readPrevious();
  const today = arDate();
  const utcHour = new Date().getUTCHours();
  const refreshStandings = process.env.FORCE_STANDINGS === "1" || [0, 3, 12].includes(utcHour);

  // 1) Partidos de hoy (una sola consulta para todas las ligas)
  const allToday = await api("/fixtures", { date: today, timezone: TZ });
  const wanted = new Set(Object.values(LEAGUES).map((l) => l.id));
  const compById = Object.fromEntries(Object.values(LEAGUES).map((l) => [l.id, l.comp]));
  const eventsCache = { ...(prev.eventsCache || {}) };

  const fixtures = allToday.filter((f) => wanted.has(f.league.id));
  const todayList = [];
  for (const f of fixtures) {
    const status = mapStatus(f.fixture.status.short);
    const id = String(f.fixture.id);
    if (status === "final" && !eventsCache[id]) {
      eventsCache[id] = scorersFromEvents(await api("/fixtures/events", { fixture: f.fixture.id }), f.teams.home.id);
    } else if (status === "live") {
      eventsCache[id] = scorersFromEvents(await api("/fixtures/events", { fixture: f.fixture.id }), f.teams.home.id);
    }
    const minute =
      f.fixture.status.short === "HT" ? "ET" : status === "live" && f.fixture.status.elapsed ? `${f.fixture.status.elapsed}'` : "";
    todayList.push({
      id,
      comp: compById[f.league.id],
      home: f.teams.home.name,
      away: f.teams.away.name,
      homeLogo: f.teams.home.logo,
      awayLogo: f.teams.away.logo,
      hs: f.goals.home,
      as: f.goals.away,
      status,
      when: status === "sched" ? arHM(f.fixture.date) : status === "final" ? "FINAL" : minute || "EN VIVO",
      minute,
      date: today,
      scorers: eventsCache[id] || [],
    });
  }

  // 2) Tablas (solo en las corridas programadas)
  let standings = prev.standings || {};
  if (refreshStandings) {
    const arRows = await api("/standings", { league: LEAGUES.arg.id, season: SEASON });
    const groups = arRows[0]?.league?.standings || [];
    if (groups.length) {
      standings.arg = {
        zonaA: (groups[0] || []).map(standingRow),
        zonaB: (groups[1] || []).map(standingRow),
      };
    }
    for (const k of ["epl", "la_liga", "serie_a", "bundesliga"]) {
      const rows = await api("/standings", { league: LEAGUES[k].id, season: SEASON });
      const table = rows[0]?.league?.standings?.[0] || [];
      if (table.length) standings[k] = table.map(standingRow);
    }
  }

  const out = {
    generatedAt: new Date().toISOString(),
    dateAR: today,
    season: SEASON,
    callsThisRun: calls,
    standingsUpdatedThisRun: refreshStandings,
    today: todayList,
    standings,
    eventsCache,
  };
  await writeFile(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`OK ${today}: ${todayList.length} partidos, consultas: ${calls}, tablas: ${refreshStandings}`);
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
