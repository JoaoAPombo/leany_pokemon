import axios from "axios";
import React, { useState, useEffect, useCallback, use } from "react";
import { useNavigate } from "react-router-dom";
import PokemonCard from "./PokemonCard";
import { nameDict } from "../lib/typeDict";
import { useFavorites } from "../context/FavoritesContext";

export default function PokemonList() {
  const [pokemons, setPokemons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [currentPage, setCurrentPage] = useState(() => {
    return parseInt(localStorage.getItem("currentPage")) || 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPokemons, setSelectedPokemons] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [allPokemons, setAllPokemons] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [typeCache, setTypeCache] = useState({});
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const { favoritePokemons } = useFavorites();
  const navigate = useNavigate();

  const fetchPokemon = async (page) => {
    try {
      const currentOffset = (page - 1) * 20;
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon?offset=${currentOffset}&limit=20`
      );
      setPokemons(response.data.results);
      setTotalPages(Math.ceil(response.data.count / 20));
      setSearchError("");
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setSearchError("Erro ao carregar Pokémons");
      return [];
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await axios.get("https://pokeapi.co/api/v2/type");
      setTypes(response.data.results);
    } catch (error) {
      console.error("Erro ao buscar tipos:", error);
    }
  };

  const fetchPokemonsByType = async (type) => {
    if (typeCache[type]) {
      return typeCache[type];
    }

    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/type/${type}`);
      const pokemonOfType = response.data.pokemon.map(p => p.pokemon.name);
      setTypeCache(prev => ({ ...prev, [type]: pokemonOfType }));
      return pokemonOfType;
    } catch (error) {
      console.error("Erro ao buscar tipo:", error);
      return [];
    }
  };

  const fetchAllPokemons = async () => {
    try {
      const response = await axios.get(
        "https://pokeapi.co/api/v2/pokemon?limit=1500"
      );
      setAllPokemons(response.data.results);
    } catch (error) {
      console.error("Erro ao buscar todos os pokemons:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handlePokemonSelect = (pokemonId) => {
    if (selectedPokemons.includes(pokemonId)) {
      setSelectedPokemons((prev) => prev.filter((id) => id !== pokemonId));
    } else if (selectedPokemons.length < 2) {
      setSelectedPokemons((prev) => [...prev, pokemonId]);
    }
  };

  const handleCompare = () => {
    if (selectedPokemons.length === 2) {
      navigate(`/compare/${selectedPokemons[0]}/${selectedPokemons[1]}`);
    }
  };

  const filterPokemons = async (type, searchValue) => {
    setIsSearching(true);
    try {
      let filteredList = [...allPokemons];
      
      // Apply type filter
      if (type) {
        const pokemonOfType = await fetchPokemonsByType(type);
        filteredList = filteredList.filter(pokemon => 
          pokemonOfType.includes(pokemon.name)
        );
      }

      // Apply search filter
      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        filteredList = filteredList.filter(pokemon =>
          pokemon.name.includes(searchLower)
        );
      }

      // Apply favorites filter
      if (showOnlyFavorites) {
        filteredList = filteredList.filter(pokemon => 
          favoritePokemons.includes(pokemon.url.split('/')[6])
        );
      }

      setPokemons(filteredList);
      setSearchError(filteredList.length === 0 ? "Nenhum Pokémon encontrado com esses critérios" : "");
    } catch (error) {
      console.error("Erro ao filtrar:", error);
      setSearchError("Erro ao filtrar Pokémons");
    } finally {
      setIsSearching(false);
    }
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setSelectedType(type);
    filterPokemons(type, searchTerm);
  };

  useEffect(() => {
    fetchPokemon(currentPage);
    fetchTypes();
    fetchAllPokemons();
  }, [currentPage]);
  useEffect(() => {
    if (searchTerm || selectedType || showOnlyFavorites) {
      filterPokemons(selectedType, searchTerm);
    } else {
      fetchPokemon(currentPage);
    }
  }, [searchTerm, selectedType, showOnlyFavorites, favoritePokemons]);

  useEffect(() => {
    localStorage.setItem("currentPage", currentPage.toString());
  }, [currentPage]);

  return (
    <main className="min-h-dvh w-full p-2 sm:p-6 bg-gray-100">
      {isInitialLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Pokédex</h1>
              <button
                onClick={handleCompare}
                disabled={selectedPokemons.length !== 2}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                Comparar ({selectedPokemons.length}/2)
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
              />

              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={selectedType}
                  onChange={handleTypeChange}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Tipos</option>
                  {types.map((type) => (
                    <option key={type.name} value={type.name}>
                      {nameDict[type.name] || type.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setShowOnlyFavorites(prev => !prev)}
                  className={`w-full sm:w-auto px-4 py-2 rounded-lg border transition-colors ${
                    showOnlyFavorites 
                      ? 'bg-yellow-400 text-black border-yellow-500 hover:bg-yellow-500'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {showOnlyFavorites ? '⭐' : '☆'}
                </button>
              </div>
            </div>
          </div>

          {searchError && (
            <div className="text-red-500 text-center mb-4">{searchError}</div>
          )}

          {isSearching ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 mb-6">
                {pokemons.map((pokemon, index) => (
                  <PokemonCard
                    key={index}
                    url={pokemon.url}
                    isSelected={selectedPokemons.includes(pokemon.url.split("/")[6])}
                    onSelect={handlePokemonSelect}
                  />
                ))}
              </ul>

              {/* Only show pagination when no filters are active */}
              {!searchTerm && !selectedType && !showOnlyFavorites && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mt-4">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                  >
                    Anterior
                  </button>
                  <span className="text-gray-600 text-sm sm:text-base">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}
