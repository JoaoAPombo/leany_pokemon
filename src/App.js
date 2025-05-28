import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FavoritesProvider } from "./context/FavoritesContext";
import PokemonList from "./components/PokemonList";
import PokemonDetail from "./components/PokemonDetail";
import PokemonComparison from "./components/PokemonComparison";

export default function App() {
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
