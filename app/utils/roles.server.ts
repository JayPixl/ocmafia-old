import { Alignment, CharGameRolePairing, Role } from "@prisma/client";
import { prisma } from "./prisma.server";
import { CharacterWithMods, CharacterWithRole, GameWithMods, RoleWithNotes } from "./types";

export const manageRoles: (
    fields: {
        name: string,
        description: string,
        alignment: Alignment,
        imageUrl?: string,
        id?: string
    },
    method: 'add' | 'edit'
) => Promise<{
    error?: string,
    success?: string,
    newRole?: Role
}> = async (fields, method) => {
    switch (method) {
        case 'add': {
            const newRole = await prisma.role.create({
                data: {
                    ...fields
                }
            })

            if (!newRole) return {
                error: 'Could not create new role...'
            }

            return {
                success: "Successfully created!",
                newRole
            }

            break
        }

        case 'edit': {
            const newRole = await prisma.role.update({
                where: {
                    id: fields.id
                },
                data: {
                    name: fields.name,
                    alignment: fields.alignment,
                    imageUrl: fields.imageUrl,
                    description: fields.description
                }
            })

            if (!newRole) return {
                error: 'Could not edit role...'
            }

            return {
                success: "Successfully created!",
                newRole
            }

            break
        }
    }
}

export const getRoleById: (
    id: string
) => Promise<{
    role?: Role,
    error?: string
}> = async (id) => {
    const role = (await prisma.role.findUnique({
        where: {
            id
        },
        select: {
            id: true,
            alignment: true,
            description: true,
            name: true,
            imageUrl: true,
        }
    })) as Role
    if (!role) return {
        error: "Could not find role"
    }

    return {
        role
    }
}

export const updateActiveRoles: (
    gameId: string,
    roles: string[]
) => Promise<{
    error?: string,
    newGame?: GameWithMods
}> = async (gameId, roles) => {
    console.log(gameId)
    const game = await prisma.game.findUnique({
        where: {
            id: gameId
        }
    })
    if (!game) return {
        error: "Could not find game"
    }

    await prisma.game.update({
        where: {
            id: gameId
        },
        data: {
            activeRoleIds: roles
        }
    });

    const newGame = (await prisma.game.findUnique({
        where: {
            id: gameId
        }
    })) as GameWithMods

    return {
        newGame
    }
}

export const assignRoles: (
    gameId: string,
    roleIds: string[],
    characterIds: string[]
) => Promise<{
    error?: string,
    success?: boolean
}> = async (gameId, roleIds, characterIds) => {
    const game = await prisma.game.findUnique({
        where: {
            id: gameId
        }
    })
    if (!game) return {
        error: "Could not find game"
    }

    if (
        game.playerCount !== roleIds.length ||
        game.playerCount !== characterIds.length
    ) return {
        error: "Wrong length for player count"
    }

    const pairings: CharGameRolePairing[] = []

    for (let i: number = 0; i < game.playerCount; i++) {
        const character = await prisma.character.findUnique({
            where: {
                id: characterIds[i]
            }
        })
        const role = await prisma.role.findUnique({
            where: {
                id: roleIds[i]
            }
        })

        if (!role || !character) return {
            error: "Problem finding a role or character..."
        }

        pairings.push({
            characterId: character.id,
            characterName: character.name,
            roleAlignment: role.alignment,
            roleId: role.id,
            roleName: role.name,
            notes: ''
        })
    }

    await prisma.gameRoles.update({
        where: {
            gameId: game.id
        },
        data: {
            assignedRoles: {
                set: pairings
            }
        }
    })

    return {
        success: true
    }
}

export const getMyCharacterGameProfile: (
    userId: string,
    gameId: string
) => Promise<{
    error?: string,
    character?: CharacterWithMods,
    myRole?: RoleWithNotes
}> = async (userId, gameId) => {

    const character = await prisma.character.findFirst({
        where: {
            ownerId: userId,
            currentGameId: gameId
        }
    })

    if (!character) return {
        error: "Could not find character"
    }

    const gameRoles = await prisma.gameRoles.findUnique({
        where: {
            gameId: gameId
        }
    })

    if (!gameRoles) return {
        error: "Could not find game roles..."
    }

    const roleId = gameRoles.assignedRoles.filter(pairing => pairing.characterId === character.id)[0]?.roleId

    const myRole = roleId ? (await prisma.role.findUnique({
        where: {
            id: roleId
        }
    })) : undefined

    return {
        character: character as CharacterWithMods,
        myRole: {
            ...myRole,
            notes: gameRoles.assignedRoles.filter(pairing => pairing.characterId === character.id)[0]?.notes
        } as RoleWithNotes
    }
}