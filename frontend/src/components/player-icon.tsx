import { LOL_VERSION } from "@/commons/lol-data"
import Image from "next/image"
import React from "react"

interface PlayerIconProps {
  player: Player
  mobileSize?: string
  desktopSize?: string
  children?: React.ReactNode
}

export const PlayerIcon = ({
  player,
  mobileSize = "44px",
  desktopSize = "60px",
  children,
}: PlayerIconProps) => {
  const sizeClasses = `w-[${mobileSize}] h-[${mobileSize}] md:w-[${desktopSize}] md:h-[${desktopSize}]`

  return (
    <div className="relative self-start border-2 border-orange-400">
      <div className={`${sizeClasses} border-2`}>
        <Image
          src={`http://ddragon.leagueoflegends.com/cdn/${LOL_VERSION}/img/profileicon/${player.profileIconId}.png`}
          alt={`Ícone de perfil do Invocador ${player.gameName}`}
          fill
          sizes={`
            (max-width: 768px) ${mobileSize},
            ${desktopSize}
          `}
        />
      </div>
      <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-xxs bg-black py-0.5 px-1.5 rounded-md">
        {player.summonerLevel}
      </span>
      {children}
    </div>
  )
}
