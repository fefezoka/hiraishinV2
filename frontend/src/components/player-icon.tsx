import { useLolVersion } from "@/hooks/lol-version"
import { cn } from "@/lib/utils"
import Image from "next/image"
import React from "react"

interface PlayerIconProps {
  player: Player
  mobileClass?: string
  desktopClass?: string
  children?: React.ReactNode
}

export const PlayerIcon = ({
  player,
  mobileClass = "w-[44px] h-[44px]",
  desktopClass = "md:w-[60px] md:h-[60px]",
  children,
}: PlayerIconProps) => {
  const lolVersion = useLolVersion()
  const sizeClasses = cn(mobileClass, desktopClass)

  return (
    <div className="relative self-start">
      <div className={cn(sizeClasses, "border-2 rounded-sm shadow-lg")}>
        <Image
          src={`http://ddragon.leagueoflegends.com/cdn/${lolVersion}/img/profileicon/${player.profileIconId}.png`}
          alt={`Ícone de perfil do Invocador ${player.gameName}`}
          fill
          className="rounded-lg"
        />
      </div>
      <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-xxs bg-black py-0.5 px-1.5 rounded-md">
        {player.summonerLevel}
      </span>
      {children}
    </div>
  )
}
