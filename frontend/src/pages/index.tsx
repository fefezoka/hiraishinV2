import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import * as Collapsible from '@radix-ui/react-collapsible';
import * as Tabs from '@radix-ui/react-tabs';
import { spells, tiers } from '@/commons/lol-data';
import { IoMdRefresh } from 'react-icons/io';
import {
  MdOutlineKeyboardDoubleArrowUp,
  MdOutlineKeyboardDoubleArrowDown,
} from 'react-icons/md';
import { getCookie, setCookie } from 'cookies-next';
import { Loading } from '@/components/loading';
import { getTotalLP } from '@/utils/league-of-legends/get-total-lp';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { playersData } from '@/commons/lol-data';

const LOL_VERSION = '15.12.1';

export default function Home() {
  const [queueType, setQueueType] = useState<Queue>('RANKED_SOLO_5x5');
  const [previousRanking, setPreviousRanking] = useState<LeagueState[]>();

  const {
    data: players,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<Player[]>({
    queryKey: ['ranking'],
    queryFn: async () => {
      const { data } = await axios.get<Player[]>(
        'http://localhost:3001/players/detailed'
      );

      Array<Queue>('RANKED_SOLO_5x5', 'RANKED_FLEX_SR').map((queueType, index) => {
        setCookie(
          `hiraishin-${queueType}`,
          JSON.stringify(
            data.reduce<Record<string, any>>((acc, curr) => {
              const league = curr.leagues[index];

              if (!league) return acc;

              acc[curr.gameName] = {
                index: league.index,
                elo: {
                  tier: league.tier,
                  rank: league.rank,
                  leaguePoints: league.leaguePoints,
                },
              };

              return acc;
            }, {}) as LeagueState
          ),
          { expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }
        );
      });

      return data;
    },
  });

  useEffect(() => {
    const previousSolo = JSON.parse(getCookie('hiraishin-RANKED_SOLO_5x5') || '{}');
    const previousFlex = JSON.parse(getCookie('hiraishin-RANKED_FLEX_SR') || '{}');

    previousSolo && previousFlex && setPreviousRanking([previousSolo, previousFlex]);
  }, []);

  if (isLoading || isRefetching) {
    return <Loading />;
  }

  console.log(previousRanking);
  console.log(players);

  return (
    <div className="max-w-[774px] font-medium m-auto px-3">
      <div className="relative">
        <Tabs.Root
          onValueChange={(value) => setQueueType(value as Queue)}
          defaultValue={queueType}
        >
          <Tabs.List className="flex mb-2.5 items-center gap-3 justify-center">
            <Tabs.Trigger value="RANKED_SOLO_5x5" asChild>
              <button
                data-selected={queueType === 'RANKED_SOLO_5x5'}
                className="py-2 text-sm px-2 text-muted-foreground border-b-2 border-muted-foreground data-[selected=true]:font-bold data-[selected=true]:border-slate-300 data-[selected=true]:text-slate-300 transition-all w-[140px]"
              >
                Ranqueada Solo
              </button>
            </Tabs.Trigger>
            <Tabs.Trigger value="RANKED_FLEX_SR" asChild>
              <button
                data-selected={queueType === 'RANKED_FLEX_SR'}
                className="py-2 text-sm px-2 text-muted-foreground border-b-2 border-muted-foreground data-[selected=true]:font-bold data-[selected=true]:border-slate-300 data-[selected=true]:text-slate-300 transition-all w-[140px]"
              >
                Ranqueada Flex
              </button>
            </Tabs.Trigger>
            <IoMdRefresh
              size={24}
              className="cursor-pointer text-muted-foreground absolute right-0"
              onClick={() => refetch()}
            />
          </Tabs.List>
          {players && (
            <div className="border-slate-300 divide-slate-300">
              {['RANKED_SOLO_5x5', 'RANKED_FLEX_SR'].map((type, typeIndex) => (
                <Tabs.Content value={type} key={type}>
                  {players
                    .filter((player) => player.leagues[typeIndex])
                    .sort(
                      (a, b) => a.leagues[typeIndex]!.index - b.leagues[typeIndex]!.index
                    )
                    .map((player, index) => {
                      const league = player.leagues[typeIndex]!;

                      const playerData = playersData.find(
                        (x) => x.accountId === player.accountId
                      )!;

                      console.log(previousRanking?.[typeIndex]?.[player.gameName]);

                      const lpDiff =
                        previousRanking?.[typeIndex]?.[player.gameName] &&
                        league.totalLP -
                          getTotalLP(previousRanking[typeIndex][player.gameName].elo);

                      return (
                        <Collapsible.Root key={player.id}>
                          <Collapsible.CollapsibleTrigger asChild>
                            <div className="md:px-[64px] mb-2 rounded-lg px-3 py-6 cursor-pointer flex items-center overflow-hidden justify-between text-sm md:text-base relative z-10">
                              <div className="absolute top-0 md:-top-12 left-0 right-0 bottom-0 bg-black opacity-[45%] -z-10 overflow-hidden">
                                <Image
                                  draggable={false}
                                  src={
                                    playerData.skin.startsWith('/_next')
                                      ? playerData.skin
                                      : `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${playerData.skin}.jpg`
                                  }
                                  alt=""
                                  width={1215}
                                  height={717}
                                />
                              </div>
                              <div className="min-w-[26px] flex gap-2 items-center absolute top-3 left-1/2 md:relative md:top-auto md:left-auto">
                                <span className="font-semibold text-yellow-400">
                                  #{index + 1}
                                </span>
                                <div className="md:absolute md:top-0 md:-right-7">
                                  {previousRanking?.[typeIndex]?.[player.gameName] &&
                                    index + 1 !==
                                      previousRanking[typeIndex][player.gameName].index &&
                                    (index + 1 <
                                    previousRanking[typeIndex][player.gameName].index ? (
                                      <MdOutlineKeyboardDoubleArrowUp
                                        className="text-green-500"
                                        size={'1.5em'}
                                      />
                                    ) : (
                                      <MdOutlineKeyboardDoubleArrowDown
                                        className="text-red-500"
                                        size={'1.5em'}
                                      />
                                    ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 md:gap-4 w-[284px]">
                                <div className="border-2 border-orange-400 relative">
                                  <div className="w-[60px] h-[60px] md:w-[72px] md:h-[72px]">
                                    <Image
                                      src={`http://ddragon.leagueoflegends.com/cdn/${LOL_VERSION}/img/profileicon/${player.profileIconId}.png`}
                                      alt=""
                                      fill
                                    />
                                  </div>
                                  <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-xxs bg-black  py-0.5 px-1.5 rounded-md">
                                    {player.summonerLevel}
                                  </span>
                                </div>
                                <div>
                                  <Link
                                    className="hover:underline"
                                    href={`https://u.gg/lol/profile/br1/${player.gameName}-${player.tagLine}/overview`}
                                    target="_blank"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="flex gap-1 items-baseline">
                                      <h1 className="w-fit shrink-0">
                                        {player.gameName}
                                      </h1>
                                      <h2 className="text-yellow-400 text-xs sm:text-base">
                                        #{player.tagLine}
                                      </h2>
                                    </div>
                                  </Link>
                                  <p className="text-yellow-400 font-semibold text-xs">
                                    {index === 0 ? 'Hokage' : playerData.title}
                                  </p>
                                </div>
                              </div>

                              <div className="flex relative flex-col justify-center items-center md:min-w-[172px] shrink-0">
                                <div className="w-[64px] h-[64px] md:w-[72px] md:h-[72px] relative">
                                  <Image
                                    src={`https://opgg-static.akamaized.net/images/medals_new/${league.tier.toLowerCase()}.png?image=q_auto,f_webp,w_144&v=1687738763941`}
                                    alt=""
                                    fill
                                  />
                                </div>
                                <span>
                                  {tiers.find((tier) => tier.en === league.tier)?.pt}{' '}
                                  {league.rank} {league.leaguePoints} PDL
                                  {lpDiff !== 0 && lpDiff !== undefined && (
                                    <span className="absolute font-semibold flex text-sm -top-2 right-0">
                                      {lpDiff > 0 ? (
                                        <>
                                          +{lpDiff} PDL
                                          <MdOutlineKeyboardDoubleArrowUp
                                            className="text-green-500"
                                            size={'1.25rem'}
                                          />
                                        </>
                                      ) : (
                                        <>
                                          {lpDiff} PDL
                                          <MdOutlineKeyboardDoubleArrowDown
                                            className="text-red-500"
                                            size={'1.5em'}
                                          />
                                        </>
                                      )}
                                    </span>
                                  )}
                                </span>
                                <p className="text-xxs  md:text-xs">
                                  {league.wins}V {league.losses}D -{' '}
                                  <span
                                    className={`${
                                      league.winrate > 50 && 'text-green-400'
                                    } ${league.winrate < 50 && 'text-red-400'}`}
                                  >
                                    {league.winrate}% Winrate
                                  </span>
                                </p>
                              </div>
                            </div>
                          </Collapsible.CollapsibleTrigger>
                          <Collapsible.CollapsibleContent>
                            <MatchHistory
                              player={player}
                              queue={queueType === 'RANKED_SOLO_5x5' ? '420' : '440'}
                            />
                          </Collapsible.CollapsibleContent>
                        </Collapsible.Root>
                      );
                    })}
                </Tabs.Content>
              ))}
            </div>
          )}
        </Tabs.Root>
      </div>
    </div>
  );
}

interface IMatchHistory {
  player: Player;
  queue: '420' | '440';
}

export const MatchHistory = ({ player, queue }: IMatchHistory) => {
  const { data } = useQuery<Match[]>({
    queryKey: ['match-history', player.puuid, queue],
    queryFn: async () =>
      (
        await axios.get(
          `http://localhost:3001/players/match-history?puuid=${player.puuid}&queue=${queue}`
        )
      ).data,
  });

  return (
    <div className="h-full flex flex-col gap-2 divide-y py-2 bg-indigo-950 rounded-2xl mb-2 p-2">
      {data ? (
        data.map((match, index) => {
          const summoner = match.info.participants.find(
            (participant) => participant.puuid === player.puuid
          )!;

          return (
            <div
              className="flex justify-between px-4 md:px-6 py-2 items-center text-xs border-blue-900"
              key={index}
            >
              <div className="flex gap-0.5">
                <div className="relative">
                  <Image
                    src={`http://ddragon.leagueoflegends.com/cdn/${LOL_VERSION}/img/champion/${summoner.championName}.png`}
                    alt=""
                    height={48}
                    width={48}
                  />
                  <span className="absolute left-0 bottom-0 text-xxs bg-black">
                    {summoner.champLevel}
                  </span>
                </div>
                <div>
                  {Object.values({
                    spell1: summoner.summoner1Id,
                    spell2: summoner.summoner2Id,
                  }).map((spell: number) => (
                    <Image
                      key={spell}
                      src={`https://ddragon.leagueoflegends.com/cdn/${LOL_VERSION}/img/spell/Summoner${spells[spell]}.png`}
                      alt=""
                      height={24}
                      width={24}
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold">Ranqueada Solo</span>
                <span
                  data-remake={summoner.gameEndedInEarlySurrender}
                  data-win={summoner.win}
                  className={
                    'data-[remake=false]:data-[win=true]:text-green-500 data-[remake=false]:data-[win=false]:text-red-500 font-bold'
                  }
                >
                  {!summoner.gameEndedInEarlySurrender
                    ? summoner.win
                      ? 'Vitória'
                      : 'Derrota'
                    : 'Remake'}
                </span>
                <span>
                  {new Intl.DateTimeFormat('pt-BR', {
                    minute: '2-digit',
                    second: '2-digit',
                  }).format(match.info.gameDuration * 1000)}
                </span>
              </div>
              <div className="flex flex-col text-xs items-center">
                <span className="font-bold text-sm tracking-wider">
                  {summoner.kills}/<span className="text-red-500">{summoner.deaths}</span>
                  /{summoner.assists}
                </span>
                <span>{summoner.totalMinionsKilled} CS</span>
                <span>{summoner.visionScore} PDV</span>
              </div>
              <div className="grid grid-cols-4 gap-px">
                {Object.values({
                  item0: summoner.item0,
                  item1: summoner.item1,
                  item2: summoner.item2,
                  item6: summoner.item6,
                  item3: summoner.item3,
                  item4: summoner.item4,
                  item5: summoner.item5,
                }).map((item, index) => (
                  <div
                    key={index}
                    className="w-[20px] h-[20px] md:w-[24px] md:h-[24px] relative bg-indigo-900 rounded overflow-hidden"
                  >
                    {item !== 0 && (
                      <Image
                        src={`http://ddragon.leagueoflegends.com/cdn/${LOL_VERSION}/img/item/${item}.png`}
                        alt=""
                        fill
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="hidden md:flex gap-1">
                {[
                  match.info.participants.slice(0, 5),
                  match.info.participants.slice(5, 10),
                ].map((team, index) => (
                  <div key={index} className="w-[100px]">
                    {team.map((participant) => (
                      <div key={participant.puuid} className="flex gap-1 items-center">
                        <Image
                          data-player={participant.puuid === player.puuid}
                          src={`http://ddragon.leagueoflegends.com/cdn/${LOL_VERSION}/img/champion/${participant.championName}.png`}
                          alt=""
                          height={14}
                          width={14}
                          className="data-[player=true]:border data-[player=true]:border-orange-400 data-[player=true]:rounded-full"
                        />
                        <Link
                          href={`https://u.gg/lol/profile/br1/${participant.riotIdGameName}-${participant.riotIdTagline}/overview`}
                          target="_blank"
                          className="text-ellipsis whitespace-nowrap overflow-hidden"
                        >
                          <span
                            data-player={participant.summonerName === player.gameName}
                            className={
                              'text-xxxs data-[player=true]:font-bold hover:underline'
                            }
                          >
                            {participant.riotIdGameName} #{participant.riotIdTagline}
                          </span>
                        </Link>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center my-4">
          <span>Carregando histórico de partidas...</span>
        </div>
      )}
    </div>
  );
};
