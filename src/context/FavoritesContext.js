import React, { createContext, useState, useContext, useEffect } from "react";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favoritePokemons, setFavoritePokemons] = useState(() => {
    return JSON.parse(localStorage.getItem("favoritePokemons")) || [];
  });
  const toggleFavorite = (pokemonId) => {
    setFavoritePokemons((prev) => {
      if (prev.includes(pokemonId)) {
        return prev.filter((id) => id !== pokemonId);
      }
      return [...prev, pokemonId];
    });
  };
  useEffect(() => {
    localStorage.setItem("favoritePokemons", JSON.stringify(favoritePokemons));
  }, [favoritePokemons]);

  return (
    <FavoritesContext.Provider value={{ favoritePokemons, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
