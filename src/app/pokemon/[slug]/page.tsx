import { api } from "~/trpc/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import PokemonImage from "~/app/_components/PokemonImage";
import type { Metadata } from "next";

// Metadata generator
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const pokemon = await api.pokemon.getBySlug({ slug: params.slug });
    return {
      title: pokemon?.name ?? "Pokémon not found",
      description: pokemon?.description,
    };
  } catch {
    return {
      title: "Pokémon not found",
      description: "Could not load Pokémon details",
    };
  }
}

// Page Component
export default async function PokemonDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  let pokemon;

  try {
    pokemon = await api.pokemon.getBySlug({ slug: params.slug });
  } catch {
    return notFound();
  }

  if (!pokemon) {
    return notFound();
  }

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
    return typeColors[type.toLowerCase()] ?? "bg-blue-500";
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-block mb-8">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 active:scale-95 transition-all">
            Back to Collection
          </button>
        </Link>

        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
          <div className="md:flex">
            {/* Left Column - Image */}
            <div className="md:w-1/3 bg-gradient-to-br from-gray-700 to-gray-800 p-8 flex items-center justify-center">
              <div className="relative w-64 h-64 bg-gray-700 rounded-full p-4 flex items-center justify-center shadow-inner overflow-hidden">
                <PokemonImage
                  src={pokemon.sprite}
                  alt={pokemon.name}
                  className="w-full h-full object-contain transition-opacity duration-500 opacity-100"
                />
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="md:w-2/3 p-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                {pokemon.name}
              </h1>

              <p className="text-xl text-gray-300 mb-6">{pokemon.category}</p>

              <div className="space-y-6">
                {/* Types */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">
                    Types
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {pokemon.types.map((type, idx) => (
                      <span
                        key={idx}
                        className={`px-4 py-1 text-sm font-medium rounded-full text-white ${getTypeColor(
                          type
                        )}`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Weakness */}
                {pokemon.weekness && pokemon.weekness.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">
                      Weakness
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {pokemon.weekness.map((type, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1 text-xs font-medium rounded-full text-white ${getTypeColor(
                            type
                          )}`}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Abilities */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">
                    Abilities
                  </h3>
                  <p className="text-gray-200">{pokemon.abilities}</p>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-200 italic">
                    &quot;{pokemon.description}&quot;
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">
                      Category
                    </h3>
                    <p className="text-gray-200">{pokemon.category}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">
                      ID
                    </h3>
                    <p className="text-gray-200">
                      #{pokemon.id.toString().padStart(3, "0")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}