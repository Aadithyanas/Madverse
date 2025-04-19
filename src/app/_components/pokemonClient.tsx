'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import PokemonImage from "~/app/_components/PokemonImage";

interface PokemonType {
  id: number;
  name: string;
  category: string;
  sprite: string;
  types: string[];
  weekness?: string[]; // Note: typo from original code preserved
  abilities: string;
  description: string;
}

interface ClientSidePokemonDetailsProps {
  pokemon: PokemonType;
}

export default function ClientSidePokemonDetails({ pokemon }: ClientSidePokemonDetailsProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      normal: "bg-gray-400",
      fire: "bg-red-500",
      water: "bg-blue-500",
      electric: "bg-yellow-400",
      grass: "bg-green-500",
      ice: "bg-blue-300",
      fighting: "bg-red-700",
      poison: "bg-purple-600",
      ground: "bg-yellow-600",
      flying: "bg-indigo-300",
      psychic: "bg-pink-500",
      bug: "bg-lime-500",
      rock: "bg-yellow-700",
      ghost: "bg-purple-800",
      dragon: "bg-indigo-600",
      dark: "bg-gray-800",
      steel: "bg-gray-500",
      fairy: "bg-pink-300",
    };
    return typeColors[type.toLowerCase()] || "bg-blue-500";
  };

  return (
    <div className="max-w-6xl mx-auto" style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.8s ease-out' }}>
      <Link href="/" className="inline-block mb-8">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 hover:-translate-y-1 hover:shadow-lg active:scale-95 transition-all duration-300">
          <span className="inline-block mr-2">←</span>
          Back to Collection
        </button>
      </Link>

      <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden transform hover:shadow-2xl transition-all duration-300">
        <div className="md:flex">
          {/* Left Column - Image */}
          <div className={`md:w-1/3 bg-gradient-to-br from-gray-700 to-gray-800 p-8 flex items-center justify-center ${isLoaded ? 'animate-slide-in-left' : ''}`}>
            <div className="relative w-64 h-64 bg-gray-700 rounded-full p-4 flex items-center justify-center shadow-inner overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-20 rounded-full animate-pulse-slow"></div>
              <div className="w-full h-full transform hover:scale-110 transition-transform duration-300">
                <PokemonImage
                  src={pokemon.sprite}
                  alt={pokemon.name}
                  className="w-full h-full object-contain transition-all duration-700 hover:drop-shadow-glow"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className={`md:w-2/3 p-8 ${isLoaded ? 'animate-slide-in-right' : ''}`}>
            <h1 className="text-4xl font-bold text-white mb-2 transform transition-all hover:text-blue-400 hover:translate-x-1 duration-300">
              {pokemon.name}
            </h1>

            <p className="text-xl text-gray-300 mb-6">
              {pokemon.category}
            </p>

            <div className="space-y-6">
              {/* Types */}
              <div className={`${isLoaded ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: "200ms" }}>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Types</h3>
                <div className="flex flex-wrap gap-2">
                  {pokemon.types.map((type, idx) => (
                    <span
                      key={idx}
                      className={`px-4 py-1 text-sm font-medium rounded-full text-white ${getTypeColor(type)} transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer`}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {pokemon.weekness && pokemon.weekness.length > 0 && (
                <div className={`${isLoaded ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: "400ms" }}>
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">Weakness</h3>
                  <div className="flex flex-wrap gap-2">
                    {pokemon.weekness.map((type, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 text-xs font-medium rounded-full text-white ${getTypeColor(type)} transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Abilities */}
              <div className={`${isLoaded ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: "600ms" }}>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Abilities</h3>
                <p className="text-gray-200 hover:text-white transition-colors duration-300">{pokemon.abilities}</p>
              </div>

              {/* Description */}
              <div className={`${isLoaded ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: "800ms" }}>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Description</h3>
                <p className="text-gray-200 italic hover:text-white transition-all duration-300 transform">"{pokemon.description}"</p>
              </div>

              {/* Stats */}
              <div className={`grid grid-cols-2 gap-4 ${isLoaded ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: "1000ms" }}>
                <div className="transform transition-all duration-300 hover:translate-x-2">
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">Category</h3>
                  <p className="text-gray-200">{pokemon.category}</p>
                </div>
                <div className="transform transition-all duration-300 hover:translate-x-2">
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">ID</h3>
                  <p className="text-gray-200">#{pokemon.id.toString().padStart(3, '0')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes pulseSlow {
          0% { opacity: 0.1; }
          50% { opacity: 0.3; }
          100% { opacity: 0.1; }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out forwards;
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .animate-pulse-slow {
          animation: pulseSlow 3s infinite;
        }
        
        .hover\\:shadow-glow:hover {
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
        }
        
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
        }
      `}</style>
    </div>
  );
}