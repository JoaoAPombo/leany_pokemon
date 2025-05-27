import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { badgeDict, nameDict, pageDict } from "../lib/typeDict";

export default function PokemonComparison() {
  const { id1, id2 } = useParams();
  const [pokemon1, setPokemon1] = useState(null);
  const [pokemon2, setPokemon2] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPokemonData = async () => {
      try {
        const [response1, response2] = await Promise.all([
          axios.get(`https://pokeapi.co/api/v2/pokemon/${id1}`),
          axios.get(`https://pokeapi.co/api/v2/pokemon/${id2}`)
        ]);
        setPokemon1(response1.data);
        setPokemon2(response2.data);
      } catch (error) {
        console.error("Error fetching pokemon data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonData();
  }, [id1, id2]);

  if (loading) {
    return <div className="h-dvh w-dvw flex items-center justify-center">Carregando...</div>;
  }

  const renderStats = (stat1, stat2) => {
    const maxStat = Math.max(stat1, stat2);
    const winner = stat1 > stat2 ? 'left' : stat1 < stat2 ? 'right' : 'tie';

    return (
      <div className="flex items-center gap-4">
        <div className={`text-right w-12 ${winner === 'left' ? 'font-bold text-green-600' : ''}`}>
          {stat1}
        </div>
        <div className="flex-1 flex gap-2">
          <div className="w-1/2 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${winner === 'left' ? 'bg-green-600' : 'bg-gray-400'}`}
              style={{ width: `${(stat1 / 255) * 100}%` }}
            ></div>
          </div>
          <div className="w-1/2 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${winner === 'right' ? 'bg-green-600' : 'bg-gray-400'}`}
              style={{ width: `${(stat2 / 255) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className={`w-12 ${winner === 'right' ? 'font-bold text-green-600' : ''}`}>
          {stat2}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-dvh p-4 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/"
          className="inline-block mb-4 bg-black text-white rounded-md p-2 font-semibold hover:opacity-80 transition-opacity duration-300"
        >
          Voltar
        </Link>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Pokemon Cards */}
          <div className={`p-4 rounded-lg ${pageDict[pokemon1.types[0].type.name]}`}>
            <div className="bg-white rounded-lg p-4">
              <h2 className="text-2xl font-bold capitalize text-center">
                {pokemon1.name} #{pokemon1.id.toString().padStart(4, "0")}
              </h2>
              <img
                src={pokemon1.sprites.front_default}
                alt={pokemon1.name}
                className="mx-auto h-48"
              />
              <div className="flex gap-2 justify-center">
                {pokemon1.types.map((type) => (
                  <span
                    key={type.type.name}
                    className={`px-3 py-1 text-sm rounded-md capitalize font-semibold ${
                      badgeDict[type.type.name]
                    }`}
                  >
                    {nameDict[type.type.name]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${pageDict[pokemon2.types[0].type.name]}`}>
            <div className="bg-white rounded-lg p-4">
              <h2 className="text-2xl font-bold capitalize text-center">
                {pokemon2.name} #{pokemon2.id.toString().padStart(4, "0")}
              </h2>
              <img
                src={pokemon2.sprites.front_default}
                alt={pokemon2.name}
                className="mx-auto h-48"
              />
              <div className="flex gap-2 justify-center">
                {pokemon2.types.map((type) => (
                  <span
                    key={type.type.name}
                    className={`px-3 py-1 text-sm rounded-md capitalize font-semibold ${
                      badgeDict[type.type.name]
                    }`}
                  >
                    {nameDict[type.type.name]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Comparison */}
          <div className="col-span-2 bg-white rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Comparação de Estatísticas</h3>
            <div className="space-y-4">
              {pokemon1.stats.map((stat, index) => (
                <div key={stat.stat.name}>
                  <div className="text-center mb-1 font-medium capitalize">
                    {stat.stat.name}
                  </div>
                  {renderStats(stat.base_stat, pokemon2.stats[index].base_stat)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
