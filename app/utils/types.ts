import { Alignment, Avatar, Character, Event, EventMessages, Game, GameRoles, Inbox, InboxItem, Phase, PhaseCharacterGameStatus, Role, User } from "@prisma/client";

export interface GameWithMods extends Game {
    hosts?: User[],
    participatingCharacters?: CharacterWithMods[],
    phases?: Phase[],
    gameMessages?: EventMessages,
    activeRoles?: Role[],
    gameRoels?: GameRoles
}

export interface CharacterWithMods extends Character {
    owner?: User
}

export interface CharacterWithRole extends CharacterWithMods {
    role?: {
        roleId: string,
        roleAlignment: Alignment,
        roleName: string
    }
}

export interface UserWithMods extends User {
    inbox?: Inbox,
    following?: User[],
    followers?: User[]
}

export interface EventWithMods extends Event {
    phase?: Phase,
    actor?: CharacterWithMods,
    target?: CharacterWithMods
}

export interface PhaseWithMods extends Phase {
    game?: GameWithMods,
    events?: EventWithMods[],
    characterStatus?: PhaseCharacterGameStatus
}

export interface RoleWithNotes extends Role {
    notes?: string
}

export interface ExtendedInboxItem extends InboxItem {
    avatar?: Avatar,
    senderUsername: string
}