import DeckExplorerClient from './DeckExplorerClient';
import {getPublicDecks} from "@/lib/deckForms";
import { Deck } from "@/lib/db/data/schema";
import { SerializedDeck, serializeDeck } from "@/lib/db/data/serialize";


export default async function DeckExplorerPage() {
  const decks: Deck[] = await getPublicDecks();
  const serializedDecks: SerializedDeck[] = decks.map(serializeDeck);

  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-semibold mb-6">Explore Public Decks</h1>
      <DeckExplorerClient decks={serializedDecks} />
    </div>
  );
}