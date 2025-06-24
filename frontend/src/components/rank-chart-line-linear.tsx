'use client';

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart';
import Image from 'next/image';
import { tiers } from '@/commons/lol-data';

export const RankChartLineLinear = ({
  chartData,
  chartConfig,
}: {
  chartData: Array<{ week: string; totalLP: number; weeklyRanking: WeeklyRanking }>;
  chartConfig: ChartConfig;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gráfico de elo</CardTitle>
        <CardDescription>Últimos 3 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart accessibilityLayer data={chartData} margin={{ left: 20, right: 20 }}>
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
                const rank = chartData.find((data) => data.totalLP === pdl);

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
              dot={false}
            />
          </LineChart>
        </ChartContainer>
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
