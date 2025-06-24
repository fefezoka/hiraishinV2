import { spinner } from '@/assets';
import { LOL_VERSION, spells } from '@/commons/lol-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from '@/service/axios';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';

interface IMatchHistory {
  player: Player;
  queue: 420 | 440;
}

export const MatchHistory = ({ player, queue }: IMatchHistory) => {
  const { data, isLoading } = useQuery<Match[]>({
    queryKey: ['match-history', player.puuid, queue],
    queryFn: async () =>
      (await axios.get(`hiraishin/match-history?puuid=${player.puuid}&queue=${queue}`))
        .data,
  });

  return (
    <Card>
      <CardHeader className="flex gap-2">
        <CardTitle>Histórico de partidas</CardTitle>
        {isLoading && <Image src={spinner} alt="" height={25} width={25} />}
      </CardHeader>
      <CardContent className="divide-y">
        {data &&
          data.map((match, index) => {
            const summoner = match.info.participants.find(
              (participant) => participant.puuid === player.puuid
            )!;

            return (
              <div
                className="flex justify-between  md:px-6 py-2 items-center sm:text-xs text-xxs"
                key={index}
              >
                <div className="flex gap-0.5">
                  <div className="relative sm:h-[48px] sm:w-[48px] h-[40px] w-[40px]">
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
                        className="relative sm:h-[24px] sm:w-[24px] h-[20px] w-[20px]"
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
                <div className="flex flex-col items-center">
                  <span className="font-bold sm:text-sm text-xs tracking-wider">
                    {summoner.kills}/
                    <span className="text-red-500">{summoner.deaths}</span>/
                    {summoner.assists}
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
                      className="w-[20px] h-[20px] md:w-[24px] md:h-[24px] relative bg-sky-950/50 rounded overflow-hidden"
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
          })}
      </CardContent>
    </Card>
  );
};
