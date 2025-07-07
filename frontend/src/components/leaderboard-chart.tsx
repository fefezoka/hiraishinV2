import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import Image from 'next/image';
import { LOL_VERSION, spells, tiers } from '@/commons/lol-data';
import { useQuery } from '@tanstack/react-query';
import axios from '@/service/axios';
import { spinner } from '@/assets';

interface ILeaderboardChart {
  player: Player;
  queue: 420 | 440;
}

const chartConfig = {
  totalLP: {
    label: 'PDL Total',
    color: 'var(--chart-4)',
  },
};

interface Payload {
  totalLP: number;
  week: string;
  leaderboardEntry: LeaderboardEntry;
}

export const LeaderboardChart = ({ player, queue }: ILeaderboardChart) => {
  const { data, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['last-3-months-leaderboard', player.puuid],
    queryFn: async () =>
      (
        await axios.get<LeaderboardEntry[]>(
          '/hiraishin/past-leaderboard/by-user/' + player.puuid
        )
      ).data,
  });

  const filterByQueue = data
    ?.filter(
      (info) => info.queueType === (queue === 420 ? 'RANKED_SOLO_5x5' : 'RANKED_FLEX_SR')
    )
    .map((leaderboardEntry) => ({
      week: new Intl.DateTimeFormat('pt-BR').format(new Date(leaderboardEntry.day)),
      totalLP: leaderboardEntry.totalLP,
      leaderboardEntry,
    }));

  return (
    <Card>
      <CardHeader className="flex gap-2">
        <div>
          <CardTitle>Gráfico de elo</CardTitle>
          <CardDescription>Últimos 3 meses</CardDescription>
        </div>
        {isLoading && <Image src={spinner} alt="" height={20} width={20} />}
      </CardHeader>
      <CardContent>
        {filterByQueue && (
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={filterByQueue}
              margin={{ left: 20, right: 20 }}
            >
              <CartesianGrid vertical />
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                tickMargin={2}
                tickFormatter={(value) => value.slice(0, 5)}
              />
              <YAxis
                dataKey="totalLP"
                domain={['dataMin - 50', 'dataMax + 50']}
                tickFormatter={(value) => pdlToTier(value)}
              />
              <ChartTooltip
                cursor={false}
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const info = payload[0].payload as Payload;

                  let dayWins = 0;
                  let dayLosses = 0;

                  info.leaderboardEntry.matches?.forEach((match) => {
                    if (match.win) {
                      dayWins += 1;
                    } else {
                      dayLosses -= 1;
                    }
                  });

                  return (
                    <div className="bg-card border text-white p-2 flex flex-col w-[266px]">
                      <div>
                        <div className="rounded text-sm flex items-center gap-2">
                          <Image
                            width={57}
                            height={57}
                            alt=""
                            src={`https://opgg-static.akamaized.net/images/medals_new/${info.leaderboardEntry.tier.toLowerCase()}.png?image=q_auto,f_webp,w_144&v=1687738763941`}
                          />
                          <div className="flex flex-col items-start">
                            <div className="font-semibold">
                              {
                                tiers.find(
                                  (tier) => tier.en === info.leaderboardEntry.tier
                                )?.pt
                              }{' '}
                              {info.leaderboardEntry.rank}{' '}
                              {info.leaderboardEntry.leaguePoints} PDL{' '}
                              <span className="text-yellow-400">
                                #{info.leaderboardEntry.index}
                              </span>
                            </div>
                            <div className="flex gap-1 text-xxs text-foreground/90 md:text-xs">
                              <span>{info.leaderboardEntry.wins}V</span>
                              <span>{info.leaderboardEntry.losses}D</span>
                              <span className="text-green-400">+{dayWins}</span>
                              <span className="text-red-400">-{Math.abs(dayLosses)}</span>
                            </div>
                          </div>
                        </div>
                        {info.leaderboardEntry.matches.length > 0 && (
                          <div>
                            <div className="my-1 bg-border h-[1px] w-full" />
                            <div className="divide-y">
                              {info.leaderboardEntry.matches?.map((summoner, index) => (
                                <div
                                  className="flex py-1 px-2 justify-between items-center sm:text-xs text-xxs"
                                  key={index}
                                >
                                  <div className="flex gap-0.5">
                                    <div className="relative sm:h-[36px] sm:w-[36px] h-[32px] w-[32px]">
                                      <Image
                                        src={`http://ddragon.leagueoflegends.com/cdn/${LOL_VERSION}/img/champion/${summoner.championName}.png`}
                                        alt=""
                                        fill
                                      />
                                      <span className="absolute left-0 bottom-0 sm:text-xxs bg-black">
                                        {summoner.champLevel}
                                      </span>
                                    </div>
                                    <div className="flex flex-col">
                                      {Object.values({
                                        spell1: summoner.summoner1Id,
                                        spell2: summoner.summoner2Id,
                                      }).map((spell: number) => (
                                        <div
                                          key={spell}
                                          className="relative sm:h-[18px] sm:w-[18px] h-[16px] w-[16px]"
                                        >
                                          <Image
                                            src={`https://ddragon.leagueoflegends.com/cdn/${LOL_VERSION}/img/spell/Summoner${spells[spell]}.png`}
                                            alt=""
                                            fill
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex flex-col">
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
                                    <span className="ml-1">
                                      {new Intl.DateTimeFormat('pt-BR', {
                                        minute: '2-digit',
                                        second: '2-digit',
                                      }).format(summoner.gameDuration * 1000)}
                                    </span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <span className="font-bold tracking-wider">
                                      {summoner.kills}/
                                      <span className="text-red-500">
                                        {summoner.deaths}
                                      </span>
                                      /{summoner.assists}
                                    </span>
                                    <span>{summoner.totalMinionsKilled} CS</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }}
              />
              <Line
                dataKey="totalLP"
                type="linear"
                stroke="var(--color-totalLP)"
                strokeWidth={2}
                dot={{
                  fill: 'var(--color-totalLP)',
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

const eloMap = [
  { min: 0, max: 399, name: 'Ferro' },
  { min: 400, max: 799, name: 'Bronze' },
  { min: 800, max: 1199, name: 'Prata' },
  { min: 1200, max: 1599, name: 'Ouro' },
  { min: 1600, max: 1999, name: 'Platina' },
  { min: 2000, max: 2399, name: 'Esmeralda' },
  { min: 2400, max: 2799, name: 'Diamante' },
  { min: 2800, max: Infinity, name: 'Mestre' },
];

const pdlToTier = (pdl: number) => {
  const tier = eloMap.find((t) => pdl >= t.min && pdl <= t.max);
  if (!tier) return 'Unknown';

  if (pdl >= 2800) {
    return tier.name;
  }

  const divisionSize = Math.floor((tier.max - tier.min + 1) / 4);
  const division = 4 - Math.floor((pdl - tier.min) / divisionSize);

  return `${tier.name} ${division}`;
};
