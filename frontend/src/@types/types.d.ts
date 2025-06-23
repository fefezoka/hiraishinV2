interface Player {
  id: string;
  summonerLevel: number;
  gameName: string;
  tagLine: string;
  puuid: string;
  profileIconId: number;
  accountId: string;
  leagues: (League | null)[];
}

interface PlayerData {
  skin: string;
  title: string;
  accountId: string;
}

interface SummonerDto {
  accountId: string;
  profileIconId: number;
  revisionDate: number;
  id: string;
  puuid: string;
  summonerLevel: number;
}

interface AccountDto {
  puuid: string;
  gameName: string;
  tagLine: string;
}

type Queue = 'RANKED_SOLO_5x5' | 'RANKED_FLEX_SR' | 'RANKED_TFT_DOUBLE_UP';

type League = {
  summonerName: string;
  wins: number;
  losses: number;
  queueType: Queue;
  summonerId: string;
  leaguePoints: number;
  index: number;
  totalLP: number;
  winrate: number;
  leaguePoints: number;
  tier: Tier;
  rank: Rank;
};

interface Match {
  info: {
    gameDuration: number;
    participants: {
      puuid: string;
      summonerName: string;
      riotIdGameName: string;
      riotIdTagline: string;
      champLevel: number;
      summoner1Id: number;
      summoner2Id: number;
      item0: number;
      item1: number;
      item2: number;
      item3: number;
      item4: number;
      item5: number;
      item6: number;
      win: boolean;
      gameEndedInEarlySurrender: boolean;
      kills: number;
      deaths: number;
      visionScore: number;
      assists: number;
      totalMinionsKilled: number;
      championName: string;
    }[];
  };
}

type Tier = 'SILVER' | 'GOLD' | 'PLATINUM' | 'EMERALD' | 'DIAMOND' | 'MASTER';
type Rank = 'IV' | 'III' | 'II' | 'I';

interface WeeklyRanking {
  id: number;
  puuid: string;
  weekyStart: Date;
  queueType: Queue;
  tier: string;
  rank: string;
  leaguePoints: number;
  totalLP: number;
  index: number;
}

// Hiraishindle

type PersonProperty = number | boolean | string[] | string;

interface Person {
  name: string;
  mainGames: string[];
  region: string;
  unemployed: boolean;
  weight: number;
  height: number;
}
