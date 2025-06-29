import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import * as Collapsible from '@radix-ui/react-collapsible';
import * as Tabs from '@radix-ui/react-tabs';
import { LOL_VERSION, tiers } from '@/commons/lol-data';
import { IoMdRefresh } from 'react-icons/io';
import {
  MdOutlineKeyboardDoubleArrowUp,
  MdOutlineKeyboardDoubleArrowDown,
} from 'react-icons/md';
import { Loading } from '@/components/loading';
import { useQuery } from '@tanstack/react-query';
import { playersData } from '@/commons/lol-data';
import axios from '@/service/axios';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PlayerOverview } from '@/components/player-overview';
import { FaCrown } from 'react-icons/fa';
import { isAxiosError } from 'axios';
import { blitz } from '@/assets';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [queueType, setQueueType] = useState<Queue>('RANKED_SOLO_5x5');
  const [profileOverviewOpen, setProfileOverviewOpen] = useState<number | null>(null);

  const {
    data: players,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useQuery<Player[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => (await axios.get<Player[]>('hiraishin/leaderboard')).data,
  });

  const { data: lastWeekLeaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ['last-week-leaderboard'],
    queryFn: async () =>
      (await axios.get<LeaderboardEntry[]>('hiraishin/past-leaderboard/last-week')).data,
  });

  if (isLoading || isRefetching) {
    return <Loading />;
  }

  if (isAxiosError(error) && error.status === 429) {
    return (
      <div className="flex flex-col items-center justify-center">
        <Image src={blitz} alt="" width={256} height={256} />
        <h2>Calma aí mano!</h2>
        <span>Tenta daqui 1 minutinho</span>
        <Button className="mt-2" onClick={() => refetch()}>
          Recarregar
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[774px] font-medium m-auto px-3">
      <div className="relative">
        <Tabs.Root
          onValueChange={(value) => {
            setQueueType(value as Queue);
            setProfileOverviewOpen(null);
          }}
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
                        (x) => x.puuid === player.puuid
                      )!;

                      const previousRanking = lastWeekLeaderboard?.find(
                        (x) => x.queueType === queueType && x.puuid === player.puuid
                      );

                      const lpDiff =
                        previousRanking && league.totalLP - previousRanking.totalLP;

                      const daysOnTop = league.arrivedOnTop
                        ? Math.floor(
                            (new Date().getTime() -
                              new Date(league.arrivedOnTop).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                        : null;

                      return (
                        <Collapsible.Root
                          open={profileOverviewOpen === index}
                          key={player.puuid}
                          onOpenChange={async (open) => {
                            setProfileOverviewOpen(open ? index : null);
                            await new Promise((r) => setTimeout(r, 400));
                            if (open) {
                              const el = document.getElementById(
                                `player-${player.gameName}-${player.tagLine}`
                              );
                              el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }}
                        >
                          <Collapsible.CollapsibleTrigger asChild>
                            <div
                              id={`player-${player.gameName}-${player.tagLine}`}
                              className="md:px-[64px] mb-2 rounded-lg px-3 py-6 cursor-pointer flex items-center overflow-hidden justify-between text-xs sm:text-sm md:text-base relative z-10"
                            >
                              <Image
                                draggable={false}
                                src={
                                  playerData.skin.startsWith('/_next')
                                    ? playerData.skin
                                    : `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${playerData.skin}.jpg`
                                }
                                alt=""
                                fill
                                className="left-0 right-0 bottom-0 bg-black opacity-[40%] -z-10 object-cover object-[0_17%]"
                              />
                              <div className="min-w-[26px] flex gap-2 items-center absolute top-3 left-1/2 md:relative md:top-auto md:left-auto">
                                <span className="font-semibold text-yellow-400">
                                  #{index + 1}
                                </span>
                                <div className="md:absolute md:top-0 md:-right-7">
                                  {previousRanking &&
                                    index + 1 !== previousRanking.index &&
                                    (index + 1 < previousRanking.index ? (
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
                              <div className="flex items-center gap-2 md:gap-3 w-[284px]">
                                <div className="border-2 border-orange-400 relative">
                                  <div className="w-[60px] h-[60px] md:w-[72px] md:h-[72px]">
                                    <Image
                                      src={`http://ddragon.leagueoflegends.com/cdn/${LOL_VERSION}/img/profileicon/${player.profileIconId}.png`}
                                      alt=""
                                      fill
                                    />
                                  </div>
                                  {daysOnTop && daysOnTop > 0 ? (
                                    <div className="bg-black rounded-md py-0.5 px-1.5 absolute truncate -top-2.5 left-1/2 -translate-x-1/2">
                                      <span className="flex text-yellow-400 gap-1 text-xxs">
                                        <FaCrown />
                                        {daysOnTop} dia{daysOnTop > 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  ) : null}
                                  <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-xxs bg-black py-0.5 px-1.5 rounded-md">
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
                                    <div className="text-sm sm:text-base truncate max-w-[144px] sm:max-w-none font-semibold">
                                      <span className="w-fit">{player.gameName}</span>{' '}
                                      <span className="text-yellow-400">
                                        #{player.tagLine}
                                      </span>
                                    </div>
                                  </Link>
                                  <p className="text-yellow-400 font-semibold text-xxs sm:text-xs">
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
                                <span className="text-sm sm:text-base font-semibold">
                                  {tiers.find((tier) => tier.en === league.tier)?.pt}{' '}
                                  {league.totalLP < 2800 && league.rank}{' '}
                                  {league.leaguePoints} PDL
                                  {lpDiff !== 0 && lpDiff !== undefined && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
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
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {lpDiff > 0 ? '+' + lpDiff : lpDiff} PDL desde a
                                        última segunda feira (
                                        {new Intl.DateTimeFormat().format(
                                          new Date(previousRanking!.weekStart)
                                        )}
                                        )
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </span>
                                <p className="text-xxs text-foreground/90 md:text-xs">
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
                            <PlayerOverview
                              player={player}
                              queue={queueType === 'RANKED_SOLO_5x5' ? 420 : 440}
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
