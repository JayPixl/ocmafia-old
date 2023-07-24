import { AvatarColors, Clearance } from "@prisma/client"

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