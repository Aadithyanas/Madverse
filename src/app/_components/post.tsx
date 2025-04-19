"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "~/trpc/react";
import { motion, AnimatePresence } from "framer-motion";
import { PokemonFilter } from "~/app/_components/PokemonFilter";
import Link from "next/link";

interface Pokemon {
  id: number;
  name: string;
  slug: string;
  types: string[];
  abilities: string;
  weekness: string[];
  description: string;
  category: string;
  sprite: string;
}

interface FormData {
  name: string;
  slug: string;
  types: string;
  abilities: string;
  weakness: string;
  description: string;
  category: string;
  sprite: string;
}

export function CreatePokemonForm() {
  const utils = api.useUtils();
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    slug: "",
    types: "",
    abilities: "",
    weakness: "",
    description: "",
    category: "",
    sprite: "",
  });

  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'create' | 'collection'>('create');
  const [notification, setNotification] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    name: "",
    types: [] as string[],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pokemonsPerPage = 12;

  // Fixed query - ensure proper case sensitivity handling
  const { data: pokemons = [], isLoading, refetch } = api.pokemon.getAll.useQuery();

  useEffect(() => {
    if (formData.sprite) {
      setPreviewVisible(true);
    }
  }, [formData.sprite]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const createPokemon = api.pokemon.create.useMutation({
    onSuccess: async () => {
      await utils.pokemon.invalidate();
      showNotification("Pokémon created successfully!");
      setFormData({
        name: "",
        slug: "",
        types: "",
        abilities: "",
        weakness: "",
        description: "",
        category: "",
        sprite: "",
      });
      setPreviewVisible(false);
      await refetch();
      setActiveTab('collection');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPokemon.mutate({
      ...formData,
      types: formData.types.split(",").map((type) => type.trim()),
      weekness: formData.weakness.split(",").map((type) => type.trim()),
    });
  };

  const allTypes = useMemo(() => {
    const types = new Set<string>();
    pokemons.forEach(pokemon => {
      pokemon.types.forEach(type => types.add(type));
    });
    return Array.from(types).sort();
  }, [pokemons]);

  const filteredPokemons = useMemo(() => {
    return pokemons.filter(pokemon => {
      // Make search case-insensitive
      const nameMatch = pokemon.name.toLowerCase().includes(filters.name.toLowerCase());
      const typeMatch = filters.types.length === 0 || 
        filters.types.some(type => pokemon.types.includes(type));
      return nameMatch && typeMatch;
    });
  }, [pokemons, filters]);

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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" }
    })
  };

  // Pagination calculations
  const indexOfLastPokemon = currentPage * pokemonsPerPage;
  const indexOfFirstPokemon = indexOfLastPokemon - pokemonsPerPage;
  const currentPokemons = filteredPokemons.slice(indexOfFirstPokemon, indexOfLastPokemon);
  const totalPages = Math.ceil(filteredPokemons.length / pokemonsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-8">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-3">Pokédex Creator</h1>
          <p className="text-gray-300">Create and manage your custom Pokémon collection</p>
          <button className="mt-10"> <Link
          href="/SearchByName "
          className="px-4 py-2  bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Go to Search Page
        </Link></button>
        </motion.div>

        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 p-1 rounded-xl inline-flex">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'create' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Create Pokémon
            </button>
            <button
              onClick={() => setActiveTab('collection')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'collection' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Collection ({pokemons.length})
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'create' ? (
            <motion.div
              key="create-tab"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col md:flex-row gap-10"
            >
              {/* Form Column */}
              <div className="w-full md:w-3/5 bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6">Create New Pokémon</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-gray-300">Pokémon Name</label>
                      <input
                        id="name"
                        name="name"
                        placeholder="e.g. Pikachu"
                        value={formData.name}
                        onChange={handleNameChange}
                        className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-inner"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="slug" className="text-sm font-medium text-gray-300">URL Slug</label>
                      <input
                        id="slug"
                        name="slug"
                        placeholder="e.g. pikachu"
                        value={formData.slug}
                        onChange={handleChange}
                        className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-inner"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="types" className="text-sm font-medium text-gray-300">Types (comma separated)</label>
                    <input
                      id="types"
                      name="types"
                      placeholder="e.g. Electric, Flying"
                      value={formData.types}
                      onChange={handleChange}
                      className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-inner"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="abilities" className="text-sm font-medium text-gray-300">Abilities</label>
                    <input
                      id="abilities"
                      name="abilities"
                      placeholder="e.g. Static, Lightning Rod"
                      value={formData.abilities}
                      onChange={handleChange}
                      className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-inner"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="weakness" className="text-sm font-medium text-gray-300">Weakness (comma separated)</label>
                    <input
                      id="weakness"
                      name="weakness"
                      placeholder="e.g. Ground, Rock"
                      value={formData.weakness}
                      onChange={handleChange}
                      className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-inner"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium text-gray-300">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Enter Pokémon description..."
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-inner min-h-[100px]"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium text-gray-300">Category</label>
                    <input
                      id="category"
                      name="category"
                      placeholder="e.g. Mouse Pokémon"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-inner"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="sprite" className="text-sm font-medium text-gray-300">Sprite URL</label>
                    <input
                      id="sprite"
                      name="sprite"
                      placeholder="https://example.com/pikachu.png"
                      value={formData.sprite}
                      onChange={handleChange}
                      className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-inner"
                      required
                    />
                  </div>
                  
                  <motion.button
                    type="submit"
                    className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:opacity-50"
                    disabled={createPokemon.isPending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {createPokemon.isPending ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Pokémon...
                      </span>
                    ) : "Create Pokémon"}
                  </motion.button>
                </form>
              </div>
              
              {/* Preview Column */}
              <div className="w-full md:w-2/5">
                <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 h-full">
                  <h2 className="text-2xl font-bold text-white mb-6">Preview</h2>
                  
                  <AnimatePresence>
                    {previewVisible && formData.sprite ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center"
                      >
                        <div className="w-48 h-48 bg-gray-700 rounded-full mb-6 p-3 flex items-center justify-center shadow-inner overflow-hidden">
                          <motion.img 
                            src={formData.sprite} 
                            alt="Preview" 
                            className="w-36 h-36 object-contain"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            onError={() => setPreviewVisible(false)}
                          />
                        </div>
                        
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                          className="text-center"
                        >
                          <h3 className="text-2xl font-bold text-white mb-2">
                            {formData.name || "New Pokémon"}
                          </h3>
                          {formData.category && (
                            <p className="text-gray-300 text-sm mb-1">{formData.category}</p>
                          )}
                          
                          {formData.types && (
                            <div className="flex gap-2 justify-center mt-2">
                              {formData.types.split(",").map((type, index) => {
                                const trimmedType = type.trim();
                                return trimmedType ? (
                                  <span key={index} className={`px-4 py-1 ${getTypeColor(trimmedType)} text-sm font-medium rounded-full text-white shadow-md`}>
                                    {trimmedType}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          )}
                          
                          {formData.weakness && (
                            <>
                              <p className="text-gray-400 text-xs mt-3">Weakness:</p>
                              <div className="flex gap-2 justify-center mt-1">
                                {formData.weakness.split(",").map((type, index) => {
                                  const trimmedType = type.trim();
                                  return trimmedType ? (
                                    <span key={index} className={`px-3 py-1 ${getTypeColor(trimmedType)} text-xs font-medium rounded-full text-white`}>
                                      {trimmedType}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            </>
                          )}
                          
                          {formData.abilities && (
                            <p className="text-gray-300 text-xs mt-3">
                              <span className="font-medium">Abilities:</span> {formData.abilities}
                            </p>
                          )}
                          
                          {formData.description && (
                            <p className="text-gray-300 text-sm mt-3 italic">
                              "{formData.description}"
                            </p>
                          )}
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center text-center h-64"
                      >
                        <div className="w-24 h-24 bg-gray-700 rounded-full mb-4 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-400">Enter Pokémon details and a sprite URL to see a preview</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collection-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Collection View */}
              <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Your Pokémon Collection</h2>
                  <span className="px-4 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
                    {filteredPokemons.length} Pokémon
                  </span>
                </div>
                
                <PokemonFilter 
                  onFilter={setFilters}
                  allTypes={allTypes}
                />
                
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    {filteredPokemons.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center text-center h-64 p-8"
                      >
                        <div className="w-24 h-24 bg-gray-700 rounded-full mb-4 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <p className="text-gray-300 text-lg font-medium mb-2">No Pokémon found</p>
                        <p className="text-gray-400">
                          {filters.name || filters.types.length > 0 
                            ? "Try adjusting your filters" 
                            : "Your collection is empty. Create your first Pokémon to get started!"}
                        </p>
                        {(filters.name || filters.types.length > 0) && (
                          <motion.button
                            onClick={() => setFilters({ name: "", types: [] })}
                            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Clear Filters
                          </motion.button>
                        )}
                        {!filters.name && filters.types.length === 0 && pokemons.length === 0 && (
                          <motion.button
                            onClick={() => setActiveTab('create')}
                            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Create Now
                          </motion.button>
                        )}
                      </motion.div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {currentPokemons.map((pokemon, index) => (
                            <Link href={`/pokemon/${pokemon.slug}`} key={pokemon.id}>
                              <motion.div
                                custom={index}
                                initial="hidden"
                                animate="visible"
                                variants={cardVariants}
                                whileHover={{ 
                                  y: -8, 
                                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4)",
                                  transition: { type: "spring", stiffness: 300, damping: 20 }
                                }}
                                className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700 cursor-pointer"
                              >
                                <div className="relative h-48 bg-gradient-to-br from-gray-600 to-gray-700 rounded-t-lg flex items-center justify-center overflow-hidden p-4">
                                  <motion.img 
                                    src={pokemon.sprite} 
                                    alt={pokemon.name} 
                                    className="w-32 h-32 object-contain z-10"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = 'https://via.placeholder.com/128x128?text=No+Image';
                                    }}
                                  />
                                  <div className="absolute inset-0 opacity-5">
                                    <div className="absolute rounded-full bg-white w-full h-full top-1/2 -translate-y-1/2 scale-150"></div>
                                    <div className="absolute top-1/2 left-0 right-0 h-8 bg-black"></div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full border-8 border-black"></div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-black"></div>
                                  </div>
                                </div>
                                
                                <div className="p-6">
                                  <h3 className="font-bold text-xl text-white mb-1">{pokemon.name}</h3>
                                  <p className="text-gray-400 text-sm mb-3">{pokemon.category}</p>
                                  
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {pokemon.types.map((type, idx) => (
                                      <span 
                                        key={idx} 
                                        className={`px-3 py-1 text-xs font-medium rounded-full text-white ${getTypeColor(type)}`}
                                      >
                                        {type}
                                      </span>
                                    ))}
                                  </div>
                                  
                                  <div className="mt-3">
                                    <p className="text-gray-300 text-xs">
                                      <span className="font-medium">Abilities:</span> {pokemon.abilities}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            </Link>
                          ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex justify-center mt-8">
                            <nav className="flex items-center gap-2">
                              <button
                                onClick={() => paginate(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-lg bg-gray-700 text-white disabled:opacity-50"
                              >
                                Prev
                              </button>
                              
                              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                  pageNum = totalPages - 4 + i;
                                } else {
                                  pageNum = currentPage - 2 + i;
                                }
                                
                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => paginate(pageNum)}
                                    className={`px-4 py-2 rounded-lg ${
                                      currentPage === pageNum 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-700 text-white hover:bg-gray-600'
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              })}
                              
                              <button
                                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-lg bg-gray-700 text-white disabled:opacity-50"
                              >
                                Next
                              </button>
                            </nav>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}