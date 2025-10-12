import { mpengu, penguDab } from "@/assets"
import Image, { StaticImageData } from "next/image"
import React, { useEffect, useState } from "react"

export const Loading = () => {
  const [src, setSrc] = useState<StaticImageData | null>(null)

  useEffect(() => {
    setSrc([mpengu, penguDab][Math.floor(Math.random() * 2)])
  }, [])

  if (!src) return null

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="w-[360px] h-[360px] relative">
        <Image src={src} alt="" fill />
      </div>
      <span className="text-xl">Carregando...</span>
    </div>
  )
}
