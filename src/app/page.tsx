
import { HydrateClient } from "~/trpc/server";
import { CreatePokemonForm } from "./_components/post";

export default async function Home() {
  



  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-600 text-white">
     
        <CreatePokemonForm/>
       
      </main>
    </HydrateClient>
  );
}
