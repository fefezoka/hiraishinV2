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
import { tiers } from '@/commons/lol-data';
import { useQuery } from '@tanstack/react-query';
import axios from '@/service/axios';
import { spinner } from '@/assets';

interface IWeeklyRankingChart {
  player: Player;
  queue: 420 | 440;
}

const chartConfig = {
  totalLP: {
    label: 'PDL Total',
    color: 'var(--chart-4)',
  },
};

export const WeeklyRankingChart = ({ player, queue }: IWeeklyRankingChart) => {
  const { data, isLoading } = useQuery<WeeklyRanking[]>({
    queryKey: ['last-3-months-leaderboard', player.puuid],
    queryFn: async () =>
      (
        await axios.get<WeeklyRanking[]>(
          '/hiraishin/past-leaderboard/by-user/' + player.puuid
        )
      ).data,
  });

  const filterByQueue = data
    ?.filter(
      (rank) => rank.queueType === (queue === 420 ? 'RANKED_SOLO_5x5' : 'RANKED_FLEX_SR')
    )
    .map((rank) => ({
      week: new Intl.DateTimeFormat().format(new Date(rank.weekStart)),
      totalLP: rank.totalLP,
      weeklyRanking: rank,
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
                  const pdl = payload[0].value;
                  const rank = filterByQueue.find((data) => data.totalLP === pdl);

                  return (
                    <div className="bg-black text-white p-2 rounded text-sm flex items-center gap-2">
                      <Image
                        width={50}
                        height={50}
                        alt=""
                        src={`https://opgg-static.akamaized.net/images/medals_new/${rank?.weeklyRanking.tier.toLowerCase()}.png?image=q_auto,f_webp,w_144&v=1687738763941`}
                      />
                      <div>
                        {tiers.find((tier) => tier.en === rank?.weeklyRanking.tier)?.pt}{' '}
                        {rank?.weeklyRanking.rank} {rank?.weeklyRanking.leaguePoints} PDL
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
  { min: 0, max: 399, name: 'Prata' },
  { min: 400, max: 799, name: 'Ouro' },
  { min: 800, max: 1199, name: 'Platina' },
  { min: 1200, max: 1599, name: 'Esmeralda' },
  { min: 1600, max: 1999, name: 'Diamante' },
  { min: 2000, max: Infinity, name: 'Mestre' },
];

const pdlToTier = (pdl: number) => {
  const tier = eloMap.find((t) => pdl >= t.min && pdl <= t.max);
  if (!tier) return 'Unknown';

  if (pdl >= 2000) {
    return tier.name;
  }

  const divisionSize = Math.floor((tier.max - tier.min + 1) / 4);
  const division = 4 - Math.floor((pdl - tier.min) / divisionSize);

  return `${tier.name} ${division}`;
};
