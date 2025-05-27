import axios from "axios";
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FavoritesProvider } from "./context/FavoritesContext";
import PokemonList from "./components/PokemonList";
import PokemonDetail from "./components/PokemonDetail";
import PokemonComparison from "./components/PokemonComparison";

export default function App() {
  const [pokemons, setPokemons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPokemon = async (page) => {
    try {
      const currentOffset = (page - 1) * 20;
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon?offset=${currentOffset}&limit=20`
      );
      setPokemons(response.data.results);
      setTotalPages(Math.ceil(response.data.count / 20));
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchPokemon(currentPage);
  }, [currentPage]);

  return (
    <FavoritesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PokemonList />} />
          <Route path="/:id" element={<PokemonDetail />} />
          <Route path="/compare/:id1/:id2" element={<PokemonComparison />} />
        </Routes>
      </BrowserRouter>
    </FavoritesProvider>
  );
}
