import { RankChartLineLinear } from '@/components/rank-chart-line-linear';
import { MatchHistory } from '@/components/match-history';
import axios from '@/service/axios';
import { useQuery } from '@tanstack/react-query';

interface IMatchHistory {
  player: Player;
  queue: 420 | 440;
}

export const PlayerOverview = ({ player, queue }: IMatchHistory) => {
  const { data: lastMonthWeeklyRankings } = useQuery<WeeklyRanking[]>({
    queryKey: ['last-month-weekly-rankings', player.puuid],
    queryFn: async () =>
      (await axios.get<WeeklyRanking[]>('/hiraishin/weekly-ranking/' + player.puuid))
        .data,
  });

  return (
    <div className="space-y-2">
      {lastMonthWeeklyRankings && lastMonthWeeklyRankings.length >= 1 && (
        <RankChartLineLinear
          chartData={lastMonthWeeklyRankings
            .filter(
              (rank) =>
                rank.queueType === (queue === 420 ? 'RANKED_SOLO_5x5' : 'RANKED_FLEX_SR')
            )
            .map((rank) => ({
              week: new Intl.DateTimeFormat().format(new Date(rank.weekStart)),
              totalLP: rank.totalLP,
              weeklyRanking: rank,
            }))}
          chartConfig={{
            totalLP: {
              label: 'PDL Total',
              color: 'var(--chart-4)',
            },
          }}
        />
      )}
      <MatchHistory player={player} queue={queue} />
    </div>
  );
};
