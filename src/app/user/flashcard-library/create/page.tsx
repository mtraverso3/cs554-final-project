"use client"
import {useState} from "react";
import { addDeck } from '@/lib/quizForms';

//TODO: this needs to be reformatted

type Card = {
    front: string;
    back: string;
}

export default function CreateDeck() {
    const [deck, setDeck] = useState({});
    const [cards, setCards] = useState([] as Card[]);
    const [name, setName] = useState("");
    const [id, setId] = useState("");
    const [description, setDescription] = useState("");
    const [front, setFront] = useState("");
    const [back, setBack] = useState("");
    const addCard = () => {
        const newCard: Card = {front: front, back: back};
      setCards([...cards, newCard]);
    }
    if(Object.keys(deck).length == 0) {
        return <div>
            Name: <input  className="outline-1" type="text" onChange={(e) =>
                setName(e.target.value)} /> <br></br>
            ID: <input  className="outline-1" type="text" onChange={(e) =>
                setId(e.target.value)} /> <br></br>
            Description: <input className="outline-1" type="text" onChange={(e) =>
                setDescription(e.target.value)} /><br></br>
            <button className="bg-black text-white outline-1 outline-gray-200 rounded p-2"
                    onClick={() => setDeck({name: name, id: id, description: description})}>Create Deck
            </button>
        </div>;
    }
    else {
        return <div>
        <button className="bg-black text-white outline-1 outline-gray-200 rounded p-2"
                onClick={() => addDeck(name, description)}>Finish Deck
        </button><br></br>
        Add Card to Deck: <br></br>
        Front: <input  className="outline-1" type="text" onChange={(e) =>
            setFront(e.target.value)} /> <br></br>
        Back: <input className="outline-1" type="text" onChange={(e) =>
            setBack(e.target.value)} /><br></br>
        <button className="bg-black text-white outline-1 outline-gray-200 rounded p-2"
                onClick={() => addCard()}>Add to Deck
        </button>
        Cards: <br></br>
        <div>
            {cards.map(function(card: Card) {
              return (<div key = {card.front}>
                    <p>Front: {card.front}</p>
                    <p>Back: {card.back}</p><br></br>
                </div>);
            })}
        </div>
        </div>;
    }
}