import { cn } from "@/lib/utils"
import Link from "next/link"
import React from "react"

interface PlayerNameProps {
  player: Player
  mobileSize?: string
  desktopSize?: string
}

export const PlayerName = ({
  player,
  mobileSize = "sm",
  desktopSize = "base",
}: PlayerNameProps) => {
  const sizeClasses = `text-${mobileSize} sm:text-${desktopSize}`

  return (
    <Link
      className="hover:underline"
      href={`https://u.gg/lol/profile/br1/${player.gameName}-${player.tagLine}/overview`}
      target="_blank"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={cn(sizeClasses, "truncate max-w-[116px] sm:max-w-none font-semibold")}
      >
        <span className="w-fit">{player.gameName}</span>{" "}
        <span className="text-yellow-400">#{player.tagLine}</span>
      </div>
    </Link>
  )
}
