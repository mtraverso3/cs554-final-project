import DeckExplorerClient from "./DeckExplorerClient";
import { getPublicDecks } from "@/lib/deckForms";
import { Deck, User } from "@/lib/db/data/schema";
import { SerializedDeck, serializeDeck2 } from "@/lib/db/data/serialize";
import { authenticateUser } from "@/lib/auth/auth";

export default async function DeckExplorerPage() {
  const decks: Deck[] = await getPublicDecks();
  const serializedDecks: SerializedDeck[] = decks.map(serializeDeck2);

  const user: User = await authenticateUser();

  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-semibold mb-6">Explore Public Decks</h1>
      <DeckExplorerClient
        decks={serializedDecks}
        currentUserId={user._id.toString()}
      />
    </div>
  );
}