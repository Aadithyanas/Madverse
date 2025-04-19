import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { db } from "~/server/db"
import { Prisma } from "@prisma/client"

export const pokemonRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).max(50),
        slug: z.string().regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens allowed"),
        types: z.array(z.string()),
        abilities: z.string(),
        weekness: z.array(z.string()),
        description: z.string().min(10).max(500),
        category: z.string(),
        sprite: z.string().url("Please provide a valid URL"),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const newPokemon = await db.pokemon.create({
          data: {
            name: input.name,
            slug: input.slug,
            types: input.types,
            abilities: input.abilities,
            weekness: input.weekness,
            description: input.description,
            category: input.category,
            sprite: input.sprite,
          },
        })
        return newPokemon
      } catch (error) {
        // Type check if this is a Prisma error with a code property
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          // Now TypeScript knows this is a Prisma error with the code property
          if (error.code === "P2002") {
            const target = (error.meta?.target as string[]) ?? ["property"]
            throw new Error(`A Pokémon with this ${target[0]} already exists`)
          }
        }
        // Re-throw the error if it's not a constraint violation
        throw error
      }
    }),

  getAll: publicProcedure.query(async () => {
    try {
      const allPokemons = await db.pokemon.findMany({
        orderBy: { name: "asc" },
      })
      return allPokemons
    } catch (error) {
      console.error("Error fetching all Pokémon:", error)
      throw new Error("Failed to fetch Pokémon collection")
    }
  }),

  getManyByName: publicProcedure.input(z.array(z.string())).query(async ({ input }) => {
    if (!input.length) return []

    try {
      // Limit the number of names to search for to prevent performance issues
      const limitedInput = input.slice(0, 10)

      const pokemons = await db.pokemon.findMany({
        where: {
          OR: limitedInput.map((name) => ({
            name: {
              contains: name,
              mode: "insensitive",
            },
          })),
        },
        orderBy: { id: "asc" },
        // Add a limit to prevent returning too many results
        take: 20,
      })

      return pokemons
    } catch (error) {
      console.error("Error fetching Pokémon by name:", error)
      throw new Error("Failed to search for Pokémon")
    }
  }),

  getByTypes: publicProcedure.input(z.array(z.string())).query(async ({ input }) => {
    if (!input.length) return []

    try {
      return await db.pokemon.findMany({
        where: {
          types: {
            hasSome: input,
          },
        },
        orderBy: { name: "asc" },
      })
    } catch (error) {
      console.error("Error fetching Pokémon by types:", error)
      throw new Error("Failed to filter Pokémon by types")
    }
  }),
})
