import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isValidCapturedPokemonCollection,
  KANTO_POKEDEX_COUNT,
  MAX_CAPTURED_POKEMON,
  normalizeCapturedPokemon,
  POKEMON_ROSTER,
  WILD_POKEMON_ROSTER,
} from './pokemonData.js';

test('Pokédex contains the 151 Kanto species and preserves legacy Lucario', () => {
  assert.equal(WILD_POKEMON_ROSTER.length, KANTO_POKEDEX_COUNT);
  assert.deepEqual(
    WILD_POKEMON_ROSTER.map(({ pokedexNo }) => pokedexNo),
    Array.from({ length: KANTO_POKEDEX_COUNT }, (_, index) => index + 1),
  );
  assert.equal(new Set(POKEMON_ROSTER.map(({ id }) => id)).size, POKEMON_ROSTER.length);
  assert.equal(POKEMON_ROSTER.find(({ id }) => id === 'lucario')?.legacyOnly, true);
  assert.equal(WILD_POKEMON_ROSTER.some(({ id }) => id === 'lucario'), false);
  assert.equal(POKEMON_ROSTER.find(({ id }) => id === 'glumanda')?.pokedexNo, 4);
});

test('collection validation accepts up to 50 unique known Pokémon IDs', () => {
  const ids = POKEMON_ROSTER.slice(0, MAX_CAPTURED_POKEMON).map(({ id }) => id);

  assert.equal(isValidCapturedPokemonCollection(ids), true);
  assert.equal(isValidCapturedPokemonCollection([...ids, 'lucario']), false);
  assert.equal(isValidCapturedPokemonCollection(['pikachu', 'pikachu']), false);
  assert.equal(isValidCapturedPokemonCollection(['not-a-pokemon']), false);
  assert.equal(isValidCapturedPokemonCollection('pikachu'), false);
});

test('normalization removes duplicate and unknown IDs and respects pocket capacity', () => {
  const ids = POKEMON_ROSTER.map(({ id }) => id);
  const normalized = normalizeCapturedPokemon([...ids, 'pikachu', 'unknown']);

  assert.equal(normalized.length, MAX_CAPTURED_POKEMON);
  assert.equal(new Set(normalized).size, normalized.length);
  assert.deepEqual(normalizeCapturedPokemon(['unknown']), ['pikachu']);
});
