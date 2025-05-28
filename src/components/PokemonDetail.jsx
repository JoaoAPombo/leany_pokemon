import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { badgeDict, nameDict, pageDict } from "../lib/typeDict";

export default function PokemonDetail() {
  const { id } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState(null);
  const [loading, setLoading] = useState(true);
  const renderEvolutionChain = (chain) => {
    const evolutions = [];
    let current = chain;

    while (current) {
      evolutions.push({
        name: current.species.name,
        id: current.species.url.split("/")[6],
      });
      current = current.evolves_to[0];
    }

    return (
      <div className="flex items-center gap-2">
        {evolutions.map((evo, index) => (
          <React.Fragment key={evo.id}>
            {index > 0 && <span className="text-2xl">→</span>}
            <Link to={`/${evo.id}`} className="flex flex-col items-center">
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`}
                alt={evo.name}
                className="h-20 w-20"
              />
              <span className="capitalize text-sm">{evo.name}</span>
            </Link>
          </React.Fragment>
        ))}
      </div>
    );
  };

  useEffect(() => {
    const fetchPokemonDetail = async () => {
      try {
        const pokemonResponse = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${id}`
        );
        setPokemon(pokemonResponse.data);

        const speciesResponse = await axios.get(
          pokemonResponse.data.species.url
        );
        const evolutionResponse = await axios.get(
          speciesResponse.data.evolution_chain.url
        );
        setEvolutionChain(evolutionResponse.data);
      } catch (error) {
        console.error("Error fetching pokemon details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonDetail();
  }, [id]);

  return (
    <>
      {loading ? (
        <div className="h-dvh w-full flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div
          className={`min-h-dvh w-full p-6 ${
            pageDict[pokemon?.types?.[0]?.type?.name] || "bg-white"
          }`}
        >
          <div className="max-w-4xl mx-auto">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-black/80 text-white rounded-lg hover:bg-black transition-colors duration-200 mb-6"
            >
              <span>←</span> Voltar
            </Link>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
              <h1 className="text-3xl font-bold capitalize mb-4 text-center">
                {pokemon.name} - #{pokemon.id.toString().padStart(4, "0")}
              </h1>

              <div className="flex flex-col items-center space-y-2">
                <img
                  src={pokemon.sprites.front_default}
                  alt={`${pokemon.name} front`}
                  className="h-48"
                />
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="font-bold text-xl mb-2">
                      Características Básicas
                    </h2>
                    <p>Altura: {pokemon.height / 10}m</p>
                    <p>Peso: {pokemon.weight / 10}kg</p>
                    <p>Experiência Base: {pokemon.base_experience}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="font-bold text-xl mb-2">Tipos</h2>
                    <div className="flex gap-2">
                      {pokemon.types.map((typeInfo) => (
                        <span
                          key={typeInfo.type.name}
                          className={`px-3 py-1 text-sm rounded-md capitalize font-semibold ${
                            badgeDict[typeInfo.type.name]
                          }`}
                        >
                          {nameDict[typeInfo.type.name] || typeInfo.type.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="font-bold text-xl mb-2">Estatísticas</h2>
                    <div className="space-y-2">
                      {pokemon.stats.map((stat) => (
                        <div key={stat.stat.name}>
                          <div className="flex justify-between mb-1">
                            <span className="capitalize">{stat.stat.name}</span>
                            <span>{stat.base_stat}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${(stat.base_stat / 255) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="font-bold text-xl mb-2">Habilidades</h2>
                    <div className="flex flex-wrap gap-2">
                      {pokemon.abilities.map((ability) => (
                        <span
                          key={ability.ability.name}
                          className="bg-blue-100 px-3 py-1 rounded-full text-sm capitalize"
                        >
                          {ability.ability.name.replace("-", " ")}
                          {ability.is_hidden && " (Oculta)"}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="font-bold text-xl mb-2">Movimentos</h2>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {pokemon.moves.map((move) => (
                        <span
                          key={move.move.name}
                          className="bg-gray-200 px-2 py-1 rounded text-sm capitalize"
                        >
                          {move.move.name.replace("-", " ")}
                        </span>
                      ))}
                    </div>
                  </div>

                  {evolutionChain && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h2 className="font-bold text-xl mb-2">
                        Linha Evolutiva
                      </h2>
                      {renderEvolutionChain(evolutionChain.chain)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
