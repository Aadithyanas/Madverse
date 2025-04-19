// components/PokemonFilter.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface PokemonFilterProps {
  onFilter: (filters: { name: string; types: string[] }) => void;
  allTypes: string[];
}

export function PokemonFilter({ onFilter, allTypes }: PokemonFilterProps) {
  const [nameFilter, setNameFilter] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const applyFilters = () => {
    onFilter({
      name: nameFilter,
      types: selectedTypes,
    });
  };

  const resetFilters = () => {
    setNameFilter("");
    setSelectedTypes([]);
    onFilter({ name: "", types: [] });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 p-6 rounded-xl mb-6 border border-gray-700"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Filter Pokémon</h3>
      
      <div className="space-y-4">
        {/* Name Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
          <input
            type="text"
            placeholder="Search by name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Types</label>
          <div className="flex flex-wrap gap-2">
            {allTypes.map((type) => (
              <motion.button
                key={type}
                type="button"
                onClick={() => handleTypeToggle(type)}
                className={`px-3 py-1 text-sm rounded-full transition ${
                  selectedTypes.includes(type)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {type}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <motion.button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Apply Filters
          </motion.button>
          <motion.button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Reset
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}