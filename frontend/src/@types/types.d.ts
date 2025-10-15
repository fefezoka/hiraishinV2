interface Player {
  summonerLevel: number
  gameName: string
  tagLine: string
  puuid: string
  profileIconId: number
  leagues: (League | null)[]
}

interface PlayerData {
  skin: string
  title: string
  accountId: string
}

interface SummonerDto {
  accountId: string
  profileIconId: number
  revisionDate: number
  id: string
  puuid: string
  summonerLevel: number
}

interface AccountDto {
  puuid: string
  gameName: string
  tagLine: string
}

type Queue = "RANKED_SOLO_5x5" | "RANKED_FLEX_SR" | "RANKED_TFT_DOUBLE_UP"

type League = {
  summonerName: string
  wins: number
  losses: number
  queueType: Queue
  summonerId: string
  leaguePoints: number
  index: number
  totalLP: number
  winrate: number
  leaguePoints: number
  tier: Tier
  rank: Rank
  arrivedOnTop: Date
  arrivedOnBottom: Date
}

interface Match {
  info: {
    gameCreation: number
    gameDuration: number
    participants: {
      puuid: string
      summonerName: string
      riotIdGameName: string
      riotIdTagline: string
      champLevel: number
      summoner1Id: number
      summoner2Id: number
      item0: number
      item1: number
      item2: number
      item3: number
      item4: number
      item5: number
      item6: number
      win: boolean
      gameEndedInEarlySurrender: boolean
      kills: number
      deaths: number
      visionScore: number
      assists: number
      totalMinionsKilled: number
      championName: string
    }[]
  }
}

interface MatchFromDB {
  id: number
  gameDuration: number
  championId: number
  summoner1Id: number
  summoner2Id: number
  win: boolean
  gameEndedInEarlySurrender: boolean
  kills: number
  deaths: number
  assists: number
  champLevel: number
  championName: string
  totalMinionsKilled: number
  leaderboardEntryId: number
  leaderboardEntry: LeaderboardEntry
}

type Tier = "SILVER" | "GOLD" | "PLATINUM" | "EMERALD" | "DIAMOND" | "MASTER"
type Rank = "IV" | "III" | "II" | "I"

interface LeaderboardEntry {
  id: number
  puuid: string
  day: string
  queueType: Queue
  tier: string
  rank: string
  leaguePoints: number
  totalLP: number
  index: number
  arrivedOnTop: Date
  wins?: number
  losses?: number
  matches: LeaderboardMatch[]
}

interface LeaderboardMatch {
  gameDuration: number
  puuid: string
  summonerName: string
  riotIdGameName: string
  riotIdTagline: string
  champLevel: number
  summoner1Id: number
  summoner2Id: number
  win: boolean
  gameEndedInEarlySurrender: boolean
  kills: number
  deaths: number
  assists: number
  totalMinionsKilled: number
  championName: string
}

interface ChampionData {
  version: string
  id: string
  key: string
  name: string
  title: string
  blurb: string
  info: ChampionInfo
  image: ChampionImage
  tags: string[]
  partype: string
  stats: ChampionStats
}

interface ChampionInfo {
  attack: number
  defense: number
  magic: number
  difficulty: number
}

interface ChampionImage {
  full: string
  sprite: string
  group: string
  x: number
  y: number
  w: number
  h: number
}

interface ChampionStats {
  hp: number
  hpperlevel: number
  mp: number
  mpperlevel: number
  movespeed: number
  armor: number
  armorperlevel: number
  spellblock: number
  spellblockperlevel: number
  attackrange: number
  hpregen: number
  hpregenperlevel: number
  mpregen: number
  mpregenperlevel: number
  crit: number
  critperlevel: number
  attackdamage: number
  attackdamageperlevel: number
  attackspeedperlevel: number
  attackspeed: number
}

interface AllChampionsData {
  data: {
    [key: string]: ChampionData
  }
}

interface ChampionOverview {
  players: {
    wins: number
    losses: number
    puuid: string
    averageKills: string
    averageDeaths: string
    averageAssists: string
    averageKDA: string
  }[]
  matches: MatchFromDB[]
}

// Hiraishindle

type PersonProperty = number | boolean | string[] | string

interface Person {
  name: string
  mainGames: string[]
  region: string
  unemployed: boolean
  weight: number
  height: number
}
