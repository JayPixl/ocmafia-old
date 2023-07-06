import { Character, Game, User } from "@prisma/client";

export interface GameWithMods extends Game {
    hosts?: User[],
    participatingCharacters?: CharacterWithMods[]
}

export interface CharacterWithMods extends Character {
    owner?: User
}