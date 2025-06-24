import { WeeklyRankingChart } from '@/components/weekly-ranking-chart';
import { MatchHistory } from '@/components/match-history';

interface IPlayerOverview {
  player: Player;
  queue: 420 | 440;
}

export const PlayerOverview = ({ player, queue }: IPlayerOverview) => {
  return (
    <div className="space-y-2">
      <WeeklyRankingChart player={player} queue={queue} />
      <MatchHistory player={player} queue={queue} />
    </div>
  );
};
