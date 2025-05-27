import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { badgeDict, nameDict } from "../lib/typeDict";
import { useFavorites } from "../context/FavoritesContext";

const PokemonCard = ({ url, isSelected, onSelect }) => {
  const [pokemon, setPokemon] = useState({});
  const navigate = useNavigate();
  const pokemonId = url.split("/")[6];
  const { favoritePokemons, toggleFavorite } = useFavorites();
  const isFavorite = favoritePokemons.includes(pokemonId);

  const fetchPokemonData = async () => {
    try {
      const response = await axios.get(url);
      setPokemon(response.data);
      return true;
    } catch (error) {
      console.error(`Erro ao buscar dados do pokemon ${url}:`, error);
      return null;
    }
  };

  useEffect(() => {
    if (!url) return;
    fetchPokemonData();
  }, [url]);
  return (
    <div
      className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full"
      onClick={() => onSelect(pokemonId)}
      onDoubleClick={() => navigate(`/${pokemonId}`)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(pokemonId);
        }}
        className="absolute top-1 right-1 z-10 text-xl sm:text-2xl cursor-pointer hover:scale-110 transition-transform"
      >
        {isFavorite ? "⭐" : "☆"}
      </button>

      <div className={`p-2 sm:p-4 ${isSelected ? "bg-blue-50 border-2 border-blue-500" : ""}`}>
        <h2 className="text-sm sm:text-lg font-semibold capitalize text-center mb-1 sm:mb-2">
          {pokemon.name}
        </h2>
        <div className="flex justify-center">
          <img
            src={pokemon.sprites?.front_default}
            alt={pokemon.name}
            className="w-16 h-16 sm:w-24 sm:h-24 object-contain group-hover:scale-110 transition-transform"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-1 mt-1 sm:mt-2">
          {pokemon.types?.map((typeInfo) => (
            <span
              key={typeInfo.type.name}
              className={`px-1 sm:px-2 py-1 text-xs rounded-full capitalize ${
                badgeDict[typeInfo.type.name]
              }`}
            >
              {nameDict[typeInfo.type.name] || typeInfo.type.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;
