import { LeaderboardChart } from "@/components/leaderboard-chart"
import { MatchHistory } from "@/components/match-history"

interface IPlayerOverview {
  player: Player
  queue: 420 | 440
}

export const PlayerOverview = ({ player, queue }: IPlayerOverview) => {
  return (
    <div className="space-y-2">
      <LeaderboardChart player={player} queue={queue} />
      <MatchHistory player={player} queue={queue} />
    </div>
  )
}
