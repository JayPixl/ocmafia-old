import { Character } from "@prisma/client"
import { prisma } from "./prisma.server"

export const getCharacterbyId: (
    id: string
) => Promise<{
    error?: string,
    character?: Character
}> = async (id) => {
    const character = await prisma.character.findFirst({
        where: {
            id
        }
    })
    if (!character) return {
        error: "Could not find character by that id"
    }

    return {
        character
    }
}