"use client"

import { useState } from "react"

interface PokemonImageProps {
  src: string
  alt: string
  className?: string
}

export default function PokemonImage({ src, alt, className = "" }: PokemonImageProps) {
  const [imgSrc, setImgSrc] = useState(src)

  return (
    <img
      src={imgSrc || "/placeholder.svg"}
      alt={alt}
      className={className}
      onError={() => setImgSrc("https://via.placeholder.com/256x256?text=No+Image")}
    />
  )
}
