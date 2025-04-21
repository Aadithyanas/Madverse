"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { api } from "~/trpc/react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Search, AlertCircle, RotateCw } from "lucide-react"
import Image from "next/image"

interface Pokemon {
  id: number
  name: string
  slug: string
  types: string[]
  category: string
  sprite: string
  abilities?: string
}

export default function SearchPokemons() {
  const [input, setInput] = useState("")
  const [names, setNames] = useState<string[]>([])
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const {
    data: pokemonResults = [],
    isFetching,
    error: queryError,
    refetch,
  } = api.pokemon.getManyByName.useQuery(names, {
    enabled: names.length > 0,
    retry: false,
  })

  // Handle error separately using useEffect
  useEffect(() => {
    if (queryError) {
      console.error("Search error:", queryError)
    }
  }, [queryError])

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleSearch = useCallback(() => {
    if (!input.trim()) return

    const parsedNames = input
      .split(",")
      .map((name) => name.trim().toLowerCase())
      .filter((name) => name.length > 0)

    if (parsedNames.length > 0) {
      setNames(parsedNames)
    }
  }, [input])

  const handleClear = useCallback(() => {
    setInput("")
    setNames([])
  }, [])

  const handleRetry = useCallback(async () => {
    try {
      await refetch()
    } catch (err) {
      console.error("Failed to refetch:", err)
    }
  }, [refetch])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    hover: {
      scale: 1.02,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 5px 10px -5px rgba(0, 0, 0, 0.04)",
    },
    tap: { scale: 0.98 },
  }

  const typeColorMap = useMemo<Record<string, string>>(
    () => ({
      normal: "bg-gray-300 text-gray-800",
      fire: "bg-red-400 text-white",
      water: "bg-blue-400 text-white",
      electric: "bg-yellow-400 text-gray-800",
      grass: "bg-green-400 text-white",
      ice: "bg-cyan-200 text-gray-800",
      fighting: "bg-red-600 text-white",
      poison: "bg-purple-500 text-white",
      ground: "bg-amber-500 text-white",
      flying: "bg-indigo-300 text-gray-800",
      psychic: "bg-pink-400 text-white",
      bug: "bg-lime-400 text-gray-800",
      rock: "bg-amber-700 text-white",
      ghost: "bg-purple-700 text-white",
      dragon: "bg-gradient-to-r from-purple-600 to-red-500 text-white",
      dark: "bg-gray-700 text-white",
      steel: "bg-gray-400 text-gray-800",
      fairy: "bg-pink-200 text-gray-800",
    }),
    [],
  )

  const renderPokemonCard = useCallback(
    (pokemon: Pokemon) => {
      // Use a fallback image if the sprite URL is from an unconfigured domain
      const imageUrl = pokemon.sprite || "/placeholder.svg"

      return (
        <motion.div
          key={pokemon.id}
          variants={cardVariants}
          whileHover="hover"
          whileTap="tap"
          className="p-6 border border-gray-200 rounded-xl shadow-sm w-[80%] mx-auto bg-gray-400 backdrop-blur-sm hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.1 }}
              whileTap={{ rotate: -5, scale: 0.95 }}
              className="shrink-0 self-center"
            >
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt={pokemon.name}
                width={96}
                height={96}
                className="w-24 h-24 object-contain drop-shadow-md"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/pokeball.png"
                }}
                unoptimized={imageUrl.includes("pokemon.com")}
              />
            </motion.div>
            <div className="flex-1 w-full">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-bold text-gray-900 mb-1 capitalize">{pokemon.name}</h3>
                <span className="text-sm font-mono text-gray-900">#{String(pokemon.id).padStart(3, "0")}</span>
              </div>
              <p className="text-sm text-red-600 mb-3 italic">{pokemon.category}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {pokemon.types.map((type) => (
                  <motion.span
                    key={`${pokemon.id}-${type}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                    className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${typeColorMap[type.toLowerCase()] ?? "bg-indigo-100 text-gray-800"}`}
                  >
                    {type}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )
    },
    [typeColorMap],
  )

  const renderSkeleton = useCallback(
    () => (
      <motion.div variants={cardVariants} className="p-6 border border-gray-200 rounded-xl bg-white/80">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="shrink-0 w-24 h-24 bg-gray-200 rounded-lg animate-pulse" />
          <div className="flex-1 w-full space-y-3">
            <div className="h-7 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </motion.div>
    ),
    [],
  )

  // Improved type guard with better safety checks
  const isPokemon = (result: unknown): result is Pokemon => {
    return (
      typeof result === "object" &&
      result !== null &&
      "id" in result &&
      "name" in result &&
      "types" in result &&
      Array.isArray((result as Pokemon).types) &&
      "sprite" in result &&
      "category" in result
    )
  }

  return (
    <div className="max-w-full mx-auto p-4 min-h-screen bg-gray-800">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: isInitialLoad ? 1.5 : 0 }}
        className="mb-8 text-center"
      >
        <motion.h1
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: isInitialLoad ? 1.7 : 0 }}
          className="text-3xl font-bold text-yellow-300 mb-2 flex items-center justify-center gap-2"
        >
          <motion.span
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: 3, duration: 2, delay: 2 }}
            className="inline-block"
          >
            🔍
          </motion.span>
          Pokémon Search
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: isInitialLoad ? 1.9 : 0.2 }}
          className="text-gray-200 max-w-md mx-auto"
        >
          Search Pokémon by name (comma separated for multiple)
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: isInitialLoad ? 2 : 0.3 }}
        className="flex flex-col gap-3 mb-8"
      >
        <div className="relative flex gap-2 w-full max-w-2xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Pikachu, Bulbasaur, Charmander"
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-300 placeholder-gray-400 pr-10"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          {input && (
            <motion.button
              onClick={handleClear}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-24 top-3 text-gray-500 hover:text-gray-700"
              aria-label="Clear input"
            >
             
            </motion.button>
          )}
          <motion.button
            onClick={handleSearch}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2 shadow-md"
            disabled={isFetching}
          >
            {isFetching ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Searching</span>
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                <span>Search</span>
              </>
            )}
          </motion.button>
        </div>
        <motion.p animate={{ opacity: input ? 1 : 0.5 }} className="text-xs text-gray-500 text-center">
          Tip: Try searching for &quot;pikachu, charizard, mewtwo&quot;
        </motion.p>
      </motion.div>

      <AnimatePresence mode="wait">
        {queryError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 mb-6 text-red-700 bg-red-50 rounded-lg border border-red-200 flex items-start gap-3 max-w-2xl mx-auto"
          >
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium mb-1">Search Error</h3>
              <p className="text-sm">{queryError.message}</p>
            </div>
            <motion.button
              onClick={handleRetry}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-red-700 hover:text-red-900 flex items-center gap-1 text-sm font-medium"
            >
              <RotateCw className="h-4 w-4" />
              Retry
            </motion.button>
          </motion.div>
        )}

        {isFetching ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            variants={containerVariants}
            className="space-y-4 max-w-4xl mx-auto"
          >
            {/* Fixed unsafe spread of any value by using a typed array */}
            {[0, 1, 2].map((i) => (
              <motion.div key={`skeleton-${i}`} variants={cardVariants}>
                {renderSkeleton()}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          pokemonResults.length > 0 && (
            <motion.div
              key="results"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-4 max-w-4xl mx-auto"
            >
              {pokemonResults.map((result, index) => {
                if (isPokemon(result)) {
                  return renderPokemonCard(result)
                }
                return (
                  <motion.div
                    key={`unknown-${index}`}
                    variants={cardVariants}
                    className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg flex items-center gap-3"
                  >
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>Pokémon not found or invalid format</span>
                  </motion.div>
                )
              })}
            </motion.div>
          )
        )}

        {!isFetching && pokemonResults.length === 0 && names.length > 0 && (
          <motion.div
            key="no-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-inner max-w-2xl mx-auto"
          >
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No Pokémon found</h3>
            <p className="text-gray-600 mb-4">We couldn&apos;t find any Pokémon matching your search</p>
            <motion.button
              onClick={handleClear}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
            >
              Clear search
            </motion.button>
          </motion.div>
        )}

        {!isFetching && names.length === 0 && !isInitialLoad && (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-16 max-w-2xl mx-auto"
          >
            <div className="mb-6">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  repeat: 5,
                  duration: 3,
                  ease: "easeInOut",
                }}
                className="inline-block"
              >
                <Image src="/pokeball.png" alt="Pokéball" width={80} height={80} className="h-20 w-20 opacity-70" />
              </motion.div>
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">Ready to search!</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Enter Pokémon names separated by commas to begin your search.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
 