"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"

interface PokemonFilterProps {
  onFilter: (filters: { name: string; types: string[] }) => void
  allTypes: string[]
}

export function PokemonFilter({ onFilter, allTypes }: PokemonFilterProps) {
  const [nameFilter, setNameFilter] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  useEffect(() => {
    onFilter({
      name: nameFilter,
      types: selectedTypes,
    })
  }, [nameFilter, selectedTypes, onFilter])

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const clearFilters = () => {
    setNameFilter("")
    setSelectedTypes([])
  }

  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      normal: "bg-gray-400 border-gray-500",
      fire: "bg-red-500 border-red-600",
      water: "bg-blue-500 border-blue-600",
      electric: "bg-yellow-400 border-yellow-500",
      grass: "bg-green-500 border-green-600",
      ice: "bg-blue-300 border-blue-400",
      fighting: "bg-red-700 border-red-800",
      poison: "bg-purple-600 border-purple-700",
      ground: "bg-yellow-600 border-yellow-700",
      flying: "bg-indigo-300 border-indigo-400",
      psychic: "bg-pink-500 border-pink-600",
      bug: "bg-lime-500 border-lime-600",
      rock: "bg-yellow-700 border-yellow-800",
      ghost: "bg-purple-800 border-purple-900",
      dragon: "bg-indigo-600 border-indigo-700",
      dark: "bg-gray-800 border-gray-900",
      steel: "bg-gray-500 border-gray-600",
      fairy: "bg-pink-300 border-pink-400",
    }
    // Fixed: Using nullish coalescing operator (??) instead of logical or (||)
    return typeColors[type.toLowerCase()] ?? "bg-gray-500 border-gray-600"
  }

  return (
    <div className="mb-8 bg-gray-700 p-4 rounded-xl">
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="w-full md:w-1/3">
          <div className="relative">
            <input
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Search by name..."
              className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {nameFilter && (
              <button
                onClick={() => setNameFilter("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="w-full md:w-2/3">
          <div className="flex flex-wrap gap-2">
            {allTypes.map((type) => (
              <motion.button
                key={type}
                onClick={() => handleTypeToggle(type)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-1 rounded-full text-white text-xs font-medium border ${getTypeColor(type)} ${
                  selectedTypes.includes(type) ? "ring-2 ring-white ring-opacity-70" : "opacity-70 hover:opacity-100"
                }`}
              >
                {type}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {(nameFilter || selectedTypes.length > 0) && (
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-600">
          <div className="text-sm text-gray-300">
            <span className="font-medium">Active filters:</span>{" "}
            {nameFilter && <span className="mr-2">Name: {nameFilter}</span>}
            {selectedTypes.length > 0 && <span>Types: {selectedTypes.join(", ")}</span>}
          </div>
          <motion.button
            onClick={clearFilters}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-sm text-gray-300 hover:text-white flex items-center gap-1"
          >
            <X size={14} />
            Clear filters
          </motion.button>
        </div>
      )}
    </div>
  )
}
