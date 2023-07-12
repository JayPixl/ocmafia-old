import { Character, Event, Game, Inbox, Phase, User } from "@prisma/client";

export interface GameWithMods extends Game {
    hosts?: User[],
    participatingCharacters?: CharacterWithMods[],
    phases?: Phase[],
    currentPhase?: Phase
}

export interface CharacterWithMods extends Character {
    owner?: User
}

export interface UserWithMods extends User {
    inbox?: Inbox,
    following?: User[],
    followers?: User[]
}

export interface EventWithMods extends Event {
    phase?: Phase
}

export interface PhaseWithMods extends Phase {
    game?: GameWithMods,
    events?: EventWithMods[]
}