import { Alignment, AvatarColors, Clearance } from "@prisma/client"

export const clearanceMap: {
    [index: string]: Clearance[]
} = {
    USER: ['USER'],
    ADMIN: ['USER', 'ADMIN']
}

export const gradientMap: {
    color: AvatarColors,
    styles: string
}[] = [
        {
            color: 'RED',
            styles: 'bg-gradient-to-br from-red-400 to-red-600'
        },
        {
            color: 'BLUE',
            styles: 'bg-gradient-to-br from-blue-400 to-blue-600'
        },
        {
            color: 'GREEN',
            styles: 'bg-gradient-to-br from-green-400 to-green-600'
        }
    ]

export const GameCharacterStatusEmojis: any = {
    ALIVE: '💚',
    WOUNDED: '🩹',
    DEAD: '💀'
}

export const RoleAlignmentEmojis: any = {
    TOWN: '🏠',
    MAFIA: "🔪",
    NEUTRAL: "🦄",
    HOSTILE: "💣"
}

export const requiredTargetFields: any = {
    KILL: ['target', 'actor'],
    VOTING_EXECUTION: ['target'],
    WOUND: ['target', 'actor'],
    VOTING_SKIP: [],
    RESURRECTION: ['target'],
    QUIET_NIGHT: [],
    GAME_START: [],
    GAME_END: []
}