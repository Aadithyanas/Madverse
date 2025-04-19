import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const pokemonRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        slug: z.string(),
        types: z.array(z.string()),
        abilities:z.string(),
        weekness:z.array(z.string()),
        description:z.string(),
        category: z.string(),
        sprite: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const newPokemon = await db.pokemon.create({
        data: {
          name: input.name,
          slug: input.slug,
          types: input.types,
          abilities:input.abilities,
          weekness:input.weekness,
          description:input.description,
          category: input.category,
          sprite: input.sprite,
        },
      });
      return newPokemon;
    }),

  getAll: publicProcedure.query(async () => {
    const allPokemons = await db.pokemon.findMany();
    return allPokemons;
  }),

  
  getManyByName: publicProcedure
  .input(z.array(z.string())) 
  .query(async ({ input }) => {
    console.log("Input names:", input);
    // const allPokemon = await db.pokemon.findMany();
    //   console.log(allPokemon.map(p => p.name));

    const pokemons = await db.pokemon.findMany({
      where: {
        OR: input.map(name => ({
          name: {
            contains: name,
            mode: 'insensitive',
          }
        }))
      }
    });

    return pokemons;
  }),

  getByTypes:publicProcedure
  .input(z.array(z.string()))
  .query(async({input})=>{
    return await db.pokemon.findMany({
      where:{
        types:{
              hasSome:input,
        }
      }
    })
  }),

  getBySlug: publicProcedure
  .input(z.object({ 
    slug: z.string().min(1, "Slug cannot be empty")
  }))
  .query(async ({ input }) => {
    try {
      console.log("hi")
      const pokemon = await db.pokemon.findUnique({
        where: { 
          slug: input.slug 
        },
        select: {
          id: true,
          name: true,
          slug: true,
          types: true,
          abilities: true,
          weekness: true,
          description: true,
          category: true,
          sprite: true,
          // Add other fields you want to expose
        }
      });

      if (!pokemon) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Pokemon with slug "${input.slug}" not found`,
        });
      }

      return pokemon;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch Pokemon',
        cause: error,
      });
    }
  }),
});
