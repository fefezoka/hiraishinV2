import React, { useMemo, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { RiSwordFill } from "react-icons/ri"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "@/service/axios"
import { LOL_VERSION, spells } from "@/commons/lol-data"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { diffBetweenDates } from "@/utils/diff-between-dates"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { amumu } from "@/assets"

export const ChampionOverview = () => {
  const [selectedChampion, setSelectedChampion] = useState<string | null>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const { data: champions } = useQuery<ChampionData[]>({
    queryKey: ["champions"],
    queryFn: async () => {
      const champions = (
        await axios.get<AllChampionsData>(
          `https://ddragon.leagueoflegends.com/cdn/${LOL_VERSION}/data/pt_BR/champion.json`
        )
      ).data

      return Object.entries(champions.data).map(([key, value]) => value)
    },
  })

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <ChampionOverviewDialog
        championData={champions?.find((champion) => champion.id === selectedChampion)}
        setSelectedChampion={setSelectedChampion}
      />
      <PopoverTrigger>
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary transition-all border border-border/50 hover:border-primary/50 group">
          <RiSwordFill size={20} className="text-yellow-400" /> Campeões
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <Command>
          <CommandInput placeholder="Selecione o campeão" />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {champions?.map((champion) => (
                <CommandItem
                  key={champion.id}
                  value={champion.id}
                  onSelect={(currentValue) => {
                    setSelectedChampion(
                      currentValue === selectedChampion ? null : currentValue
                    )
                  }}
                >
                  <Image
                    src={`https://ddragon.leagueoflegends.com/cdn/${LOL_VERSION}/img/champion/${champion.id}.png`}
                    alt=""
                    height={32}
                    width={32}
                  />
                  {champion.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export const ChampionOverviewDialog = ({
  championData,
  setSelectedChampion,
}: {
  championData: ChampionData | undefined
  setSelectedChampion: React.Dispatch<React.SetStateAction<string | null>>
}) => {
  const queryClient = useQueryClient()
  const { data: championOverview } = useQuery({
    queryKey: ["champion-overview", championData?.id],
    queryFn: async () =>
      (
        await axios.get<ChampionOverview>("hiraishin/champion-overview/", {
          params: {
            championName: championData?.id,
          },
        })
      ).data,
    enabled: !!championData?.id,
  })

  const players = queryClient.getQueryData<Player[]>(["leaderboard"])!

  const descriptionData = useMemo(() => {
    const totalWins =
      championOverview?.players.reduce((acc, player) => acc + player.wins, 0) || 0
    const totalLosses =
      championOverview?.players.reduce((acc, player) => acc + player.losses, 0) || 0
    return { totalWins, totalLosses }
  }, [championOverview])

  if (!championData) {
    return null
  }

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          setSelectedChampion(null)
        }
      }}
    >
      <DialogContent className="sm:max-w-[666px]">
        <DialogTitle>
          {championData.name} - {championData.title}{" "}
          <span className="text-green-400">{descriptionData.totalWins}V</span>
          <span className="text-muted-foreground"> / </span>
          <span className="text-red-400">{descriptionData.totalLosses}D</span>
        </DialogTitle>

        {championOverview && championOverview.matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center">
            <Image src={amumu.src} alt="" width={172} height={172} />
            <span className="text-muted-foreground">
              Ninguém jogou de {championData.name} ainda!
            </span>
          </div>
        ) : (
          championOverview &&
          championOverview.matches.length !== 0 && (
            <>
              {championOverview.players.length !== 0 && (
                <>
                  <DialogDescription>Melhores jogadores</DialogDescription>

                  <div className="flex justify-evenly gap-4 items-center">
                    {championOverview?.players.slice(0, 2).map((player) => {
                      const playerData = players.find((p) => p.puuid === player.puuid)
                      if (!playerData) {
                        return null
                      }

                      return (
                        <div
                          key={player.puuid}
                          className="flex gap-3 items-center justify-between"
                        >
                          <div className="relative self-start border-2 border-orange-400">
                            <div className="w-[44px] h-[44px] md:w-[60px] md:h-[60px] border-2">
                              <Image
                                src={`http://ddragon.leagueoflegends.com/cdn/${LOL_VERSION}/img/profileicon/${playerData.profileIconId}.png`}
                                alt=""
                                fill
                              />
                            </div>
                            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-xxs bg-black py-0.5 px-1.5 rounded-md">
                              {playerData.summonerLevel}
                            </span>
                          </div>
                          <div className="flex text-xs flex-col text-muted-foreground">
                            <Link
                              className="hover:underline text-white"
                              href={`https://u.gg/lol/profile/br1/${playerData.gameName}-${playerData.tagLine}/overview`}
                              target="_blank"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="text-sm sm:text-base truncate max-w-[116px] sm:max-w-none font-semibold">
                                <span className="w-fit">{playerData.gameName}</span>{" "}
                                <span className="text-yellow-400">
                                  #{playerData.tagLine}
                                </span>
                              </div>
                            </Link>
                            <div className="font-bold flex mt-1">
                              <span className="text-green-400">{player.wins}V</span>
                              <span> / </span>
                              <span className="text-red-400">{player.losses}D</span>
                            </div>
                            <div className="mt-1">
                              Total de{" "}
                              <span className="text-white font-semibold">
                                {player.wins + player.losses}
                              </span>{" "}
                              partidas
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex flex-col gap-3 px-6">
                    {championOverview.players.slice(2, 10).map((player) => {
                      const playerData = players.find((p) => p.puuid === player.puuid)
                      if (!playerData) {
                        return null
                      }

                      return (
                        <div key={player.puuid} className="flex gap-3 items-center">
                          <div className="relative self-start border-2 border-orange-400">
                            <div className="w-[28px] h-[28px] md:w-[36px] md:h-[36px] border-2">
                              <Image
                                src={`http://ddragon.leagueoflegends.com/cdn/${LOL_VERSION}/img/profileicon/${playerData.profileIconId}.png`}
                                alt=""
                                fill
                              />
                            </div>
                            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-xxs bg-black py-0.5 px-1.5 rounded-md">
                              {playerData.summonerLevel}
                            </span>
                          </div>
                          <div className="flex text-xs items-center gap-3 text-muted-foreground">
                            <Link
                              className="hover:underline text-white"
                              href={`https://u.gg/lol/profile/br1/${playerData.gameName}-${playerData.tagLine}/overview`}
                              target="_blank"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="truncate max-w-[116px] sm:max-w-none font-semibold">
                                <span className="w-fit">{playerData.gameName}</span>{" "}
                                <span className="text-yellow-400">
                                  #{playerData.tagLine}
                                </span>
                              </div>
                            </Link>
                            <div className="font-bold flex mt-1">
                              <span className="text-green-400">{player.wins}V</span>
                              <span> / </span>
                              <span className="text-red-400">{player.losses}D</span>
                            </div>
                            <div className="mt-1">
                              Total de{" "}
                              <span className="text-white font-semibold">
                                {player.wins + player.losses}
                              </span>{" "}
                              partidas
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <Separator />
                </>
              )}

              <DialogDescription>Histórico de partidas</DialogDescription>

              <ScrollArea className="max-h-[340px]">
                <div className="flex flex-col gap-3">
                  {championOverview?.matches.map((match) => (
                    <MatchFromDb match={match} key={match.id} />
                  ))}
                </div>
              </ScrollArea>
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  )
}

const MatchFromDb = ({ match }: { match: MatchFromDB }) => {
  const queryClient = useQueryClient()

  const player = queryClient
    .getQueryData<Player[]>(["leaderboard"])
    ?.find((user) => user.puuid === match.leaderboardEntry.puuid)

  if (!player) {
    return
  }

  return (
    <div
      className="flex gap-6 justify-between md:px-6 items-center sm:text-xs text-xxs"
      key={match.id}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="border-2 border-orange-400 relative">
            <div className="w-[32px] h-[32px] md:w-[48px] md:h-[48px]">
              <Image
                src={`http://ddragon.leagueoflegends.com/cdn/${LOL_VERSION}/img/profileicon/${player.profileIconId}.png`}
                alt=""
                fill
              />
            </div>
            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-xxs bg-black py-0.5 px-1.5 rounded-md">
              {player.summonerLevel}
            </span>
          </div>
          <div className="w-[120px] sm:w-[200px]">
            <Link
              className="hover:underline"
              href={`https://u.gg/lol/profile/br1/${player.gameName}-${player.tagLine}/overview`}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sm:text-base truncate max-w-[116px] sm:max-w-none font-semibold">
                <span className="w-fit">{player.gameName}</span>{" "}
                <span className="text-yellow-400">#{player.tagLine}</span>
              </div>
            </Link>
            <span className="text-muted-foreground">
              {match.leaderboardEntry.queueType === "RANKED_SOLO_5x5"
                ? "Ranqueada Solo"
                : "Ranqueada Flex"}
            </span>
            <span className="text-muted-foreground mx-0.5"> • </span>
            <span
              data-remake={match.gameEndedInEarlySurrender}
              data-win={match.win}
              className={
                "data-[remake=false]:data-[win=true]:text-green-500 data-[remake=false]:data-[win=false]:text-red-500 font-bold"
              }
            >
              {!match.gameEndedInEarlySurrender
                ? match.win
                  ? "Vitória"
                  : "Derrota"
                : "Remake"}
            </span>
          </div>
        </div>
      </div>
      <div className="flex justify-between w-full items-center">
        <div className="flex gap-0.5">
          <div className="relative sm:h-[48px] sm:w-[48px] h-[32px] w-[32px]">
            <Image
              src={`http://ddragon.leagueoflegends.com/cdn/${LOL_VERSION}/img/champion/${match.championName}.png`}
              alt=""
              fill
            />
            <span className="absolute left-0 bottom-0 sm:text-xxs bg-black">
              {match.champLevel}
            </span>
          </div>
          <div className="flex flex-col">
            {Object.values({
              spell1: match.summoner1Id,
              spell2: match.summoner2Id,
            }).map((spell: number) => (
              <div
                key={spell}
                className="relative sm:h-[24px] sm:w-[24px] h-[16px] w-[16px]"
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
        <div className="flex flex-col justify-center items-center">
          <span className="font-bold sm:text-sm text-xs tracking-wider">
            {match.kills}/<span className="text-red-500">{match.deaths}</span>/
            {match.assists}
          </span>
          <span className="text-muted-foreground">KDA</span>
        </div>
        <div className="hidden sm:flex flex-col items-center">
          <div>
            <span className="font-bold sm:text-sm text-xs">
              {new Intl.DateTimeFormat("pt-BR", {
                minute: "2-digit",
                second: "2-digit",
              }).format(match.gameDuration * 1000)}
            </span>
          </div>
          <span className="text-muted-foreground">
            {diffBetweenDates(new Date(match.leaderboardEntry.day))}
          </span>
        </div>
        <div className="hidden sm:flex flex-col items-center">
          <span className="font-bold sm:text-sm text-xs">{match.totalMinionsKilled}</span>
          <span className="text-muted-foreground">CS</span>
        </div>
      </div>
    </div>
  )
}
