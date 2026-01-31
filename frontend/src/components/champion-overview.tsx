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
import { spells } from "@/commons/lol-data"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { diffBetweenDates } from "@/utils/diff-between-dates"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { amumu, spinner } from "@/assets"
import { PlayerIcon } from "@/components/player-icon"
import { PlayerName } from "@/components/player-name"
import { useLolVersion } from "@/hooks/lol-version"

export const ChampionOverview = () => {
  const [selectedChampion, setSelectedChampion] = useState<string | null>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const lolVersion = useLolVersion()

  const { data: champions } = useQuery<ChampionData[]>({
    queryKey: ["champions"],
    queryFn: async () => {
      const champions = (
        await axios.get<AllChampionsData>(
          `https://ddragon.leagueoflegends.com/cdn/${lolVersion}/data/pt_BR/champion.json`
        )
      ).data

      return Object.entries(champions.data).map(([_, value]) => value)
    },
    enabled: !!lolVersion,
  })

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <ChampionOverviewDialog
        championData={champions?.find((champion) => champion.name === selectedChampion)}
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
            <CommandEmpty>Nenhum campeão encontrado</CommandEmpty>
            <CommandGroup>
              {champions?.map((champion) => (
                <CommandItem
                  key={champion.name}
                  value={champion.name}
                  onSelect={(currentValue) => {
                    setSelectedChampion(
                      currentValue === selectedChampion ? null : currentValue
                    )
                  }}
                >
                  <Image
                    src={`https://ddragon.leagueoflegends.com/cdn/${lolVersion}/img/champion/${champion.id}.png`}
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
  const [selectedPlayer, setSelectedPlayer] = useState<Player>()

  const queryClient = useQueryClient()
  const { data: championOverview, isLoading } = useQuery({
    queryKey: ["champion-overview", championData?.name],
    queryFn: async () =>
      (
        await axios.get<ChampionOverview>("hiraishin/champion-overview/", {
          params: {
            championName: championData?.name,
          },
        })
      ).data,
    enabled: !!championData?.name,
  })

  const players = queryClient.getQueryData<Player[]>(["leaderboard"])!

  const descriptionData = useMemo(() => {
    const totalWins =
      championOverview?.players.reduce((acc, player) => acc + player.wins, 0) || 0
    const totalLosses =
      championOverview?.players.reduce((acc, player) => acc + player.losses, 0) || 0
    return { totalWins, totalLosses }
  }, [championOverview])

  const topPlayer = championOverview?.players?.[0]
  const topPlayerData = topPlayer
    ? players.find((p) => p.puuid === topPlayer.puuid)
    : null

  const matches = selectedPlayer
    ? championOverview?.matches.filter(
        (match) => match.leaderboardEntry.puuid == selectedPlayer.puuid
      )
    : championOverview?.matches

  const handleSelectPlayer = (player: Player) => {
    if (selectedPlayer?.puuid === player.puuid) {
      return setSelectedPlayer(undefined)
    }

    setSelectedPlayer(player)
  }

  if (!championData) {
    return null
  }

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          setSelectedChampion(null)
          setSelectedPlayer(undefined)
        }
      }}
    >
      <DialogContent className="sm:max-w-[666px]">
        <DialogTitle>
          <div className="flex items-center gap-2">
            {championData.name} - {championData.title}
            {isLoading ? (
              <Image src={spinner} alt="" width={20} height={20} />
            ) : (
              <div>
                <span className="text-green-400">{descriptionData.totalWins}V</span>
                <span className="text-muted-foreground"> / </span>
                <span className="text-red-400">{descriptionData.totalLosses}D</span>
              </div>
            )}
          </div>
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

                  <div className="flex justify-evenly gap-4 items-center cursor-pointer">
                    {topPlayer && topPlayerData && (
                      <div
                        onClick={() => handleSelectPlayer(topPlayerData)}
                        key={topPlayer.puuid}
                        className="flex gap-3 items-center"
                      >
                        <span className="font-semibold text-yellow-400">#1</span>
                        <PlayerIcon
                          mobileClass="w-[40px] h-[40px]"
                          player={topPlayerData}
                        />
                        <div className="flex text-xs flex-col text-muted-foreground">
                          <div className="flex gap-2 items-center justify-center">
                            <div className="text-white">
                              <PlayerName player={topPlayerData} />
                            </div>
                            <div className="font-bold text-sm flex">
                              <span className="text-green-400">{topPlayer.wins}V</span>
                              <span> / </span>
                              <span className="text-red-400">{topPlayer.losses}D</span>
                            </div>
                          </div>
                          <span>
                            {topPlayer.averageKills} / {topPlayer.averageDeaths} /{" "}
                            {topPlayer.averageAssists} KDA {topPlayer.averageKDA}
                          </span>
                          <div className="mt-1">
                            Total de{" "}
                            <span className="text-white font-semibold">
                              {topPlayer.wins + topPlayer.losses}
                            </span>{" "}
                            partidas
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {championOverview.players.length >= 2 && (
                    <div className="flex flex-col gap-3 sm:px-6 mt-2">
                      {championOverview.players.slice(1, 10).map((player, index) => {
                        const playerData = players.find((p) => p.puuid === player.puuid)
                        if (!playerData) {
                          return null
                        }

                        return (
                          <div
                            key={player.puuid}
                            className="flex text-xs gap-3 items-center cursor-pointer"
                            onClick={() => handleSelectPlayer(playerData)}
                          >
                            <span className="font-semibold text-yellow-400">
                              #{index + 2}
                            </span>

                            <PlayerIcon
                              player={playerData}
                              desktopClass="sm:w-[36px] sm:h-[36px]"
                              mobileClass="w-[28px] h-[28px]"
                            />
                            <div className="flex items-center gap-3 text-muted-foreground">
                              <div className="text-white">
                                <PlayerName
                                  player={playerData}
                                  desktopSize="xs"
                                  mobileSize="xs"
                                />
                              </div>
                              <div className="font-bold flex">
                                <span className="text-green-400">{player.wins}V</span>
                                <span> / </span>
                                <span className="text-red-400">{player.losses}D</span>
                              </div>
                              <span className="hidden sm:block">
                                {player.averageKills} / {player.averageDeaths} /{" "}
                                {player.averageAssists} KDA {player.averageKDA}
                              </span>
                              <div>
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
                  )}

                  <Separator />
                </>
              )}

              <DialogDescription>
                Histórico de partidas{" "}
                {selectedPlayer && (
                  <span>
                    -{" "}
                    <span className="text-white font-semibold">
                      {selectedPlayer?.gameName}{" "}
                      <span className="text-yellow-400">#{selectedPlayer.tagLine}</span>
                    </span>
                  </span>
                )}
              </DialogDescription>

              <ScrollArea className="max-h-[340px]">
                <div className="flex flex-col gap-3">
                  {matches?.map((match) => (
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
  const lolVersion = useLolVersion()

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
          <PlayerIcon
            player={player}
            desktopClass="sm:w-[48px] sm:h-[48px]"
            mobileClass="w-[32px] h-[32px]"
          />
          <div className="w-[120px] sm:w-[200px]">
            <PlayerName player={player} mobileSize="xxs" desktopSize="base" />
            <span className="text-muted-foreground">
              {match.leaderboardEntry.queueType === "RANKED_SOLO_5x5"
                ? "Ranqueada Solo"
                : "Ranqueada Flex"}
            </span>
            <span className="text-muted-foreground mx-0.5"> • </span>
            <span
              data-win={match.win}
              className={
                "data-[win=true]:text-green-500 data-[win=false]:text-red-500 font-bold"
              }
            >
              {match.win ? "Vitória" : "Derrota"}
            </span>
          </div>
        </div>
      </div>
      <div className="flex justify-between w-full items-center">
        <div className="flex gap-0.5">
          <div className="relative sm:h-[48px] sm:w-[48px] h-[32px] w-[32px]">
            <Image
              src={`http://ddragon.leagueoflegends.com/cdn/${lolVersion}/img/champion/${match.championName}.png`}
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
                  src={`https://ddragon.leagueoflegends.com/cdn/${lolVersion}/img/spell/Summoner${spells[spell]}.png`}
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
