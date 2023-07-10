import { Character, Game, Inbox, User } from "@prisma/client";

export interface GameWithMods extends Game {
    hosts?: User[],
    participatingCharacters?: CharacterWithMods[]
}

export interface CharacterWithMods extends Character {
    owner?: User
}

export interface UserWithMods extends User {
    inbox?: Inbox,
    following?: User[],
    followers?: User[]
}