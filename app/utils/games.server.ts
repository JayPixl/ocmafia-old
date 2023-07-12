import { EventTypes, Game, Prisma, Time } from "@prisma/client"
import { prisma } from "./prisma.server"
import { getUser, requireClearance } from "./users.server"
import { GameWithMods } from "./types"

export const createGame: (form: {
    gameName: string,
    location: string
}) => Promise<{
    error?: string,
    newGame?: Game
}> = async (form) => {
    const newGame = await prisma.game.create({
        data: {
            name: form.gameName,
            location: form.location,
            phases: {
                create: {
                    time: 'DAY',
                    dayNumber: 1,
                }
            }
        },
        include: {
            phases: {
                select: {
                    id: true
                }
            }
        }
    })

    if (!newGame) return {
        error: "Could not create new game"
    }

    console.log(await prisma.game.update({
        where: {
            id: newGame.id
        },
        data: {
            currentPhase: {
                connect: {
                    id: newGame?.phases[0]?.id || ''
                }
            }
        }
    }))

    return {
        newGame
    }
}

export const getGameById: (
    id: string
) => Promise<{
    error?: string,
    game?: Game
}> = async (id) => {
    const game = await prisma.game.findFirst({
        where: {
            id
        },
        include: {
            hosts: true,
            phases: {
                include: {
                    events: true
                }
            },
            currentPhase: true,
            participatingCharacters: {
                include: {
                    owner: true
                }
            }
        }
    })

    if (!game) return { error: "Could not find game with that id" }
    return { game }
}

export const getFilteredGames: (
    filters?: Prisma.GameWhereInput
) => Promise<{
    error?: string,
    games?: Game[]
}> = async (filters) => {
    const games = await prisma.game.findMany({
        where: { ...filters },
    })
    if (!games.length) return { error: "Could not find games with those parameters" }
    return { games }
}

export const requireHost: (
    request: Request,
    gameId: string
) => Promise<{
    error?: string,
    authorized: boolean,
    admin?: boolean
}> = async (request, gameId) => {
    const { user, error, authorized } = await requireClearance(request, "ADMIN")
    if (authorized) return { authorized, admin: true }
    if (!user) return { error: "Could not find user", authorized: false }

    const result = await prisma.game.findFirst({
        where: {
            id: gameId,
            hosts: {
                some: {
                    id: user.id
                }
            }
        }
    })

    if (!result) return { error: "You are not a host for this game", authorized: false }
    return { authorized: true }
}

export const editGame: (
    form: {
        name?: string,
        location?: string
    },
    gameId: string
) => Promise<{
    error?: string,
    newGame?: Game
}> = async (form, gameId) => {
    const { game } = await getGameById(gameId)
    if (!game) return { error: "No game found by that Id" }

    console.log(form)

    const result = await prisma.game.update({
        where: {
            id: gameId
        },
        data: {
            ...form
        }
    })

    console.log(result)

    if (!result) return { error: "Bad database request" }
    return { newGame: result }
}

export const manageHosts: (
    form: {
        hostId?: string,
        gameId: string,
        action: string
    },
    request: Request
) => Promise<{
    error?: string,
    newGame?: Game
}> = async ({ hostId, gameId, action }, request) => {
    const game = await prisma.game.findUnique({
        where: {
            id: gameId
        }
    })
    if (!game) return {
        error: "Could not find a valid game"
    }

    let host = await prisma.user.findUnique({
        where: {
            id: hostId
        }
    })

    if (!host) return {
        error: "Could not find host"
    }

    if (action === 'add') {
        if (
            (await prisma.user.findFirst({
                where: {
                    id: host.id,
                    hostingGameId: game.id
                }
            }))
        ) return {
            error: "This host is already added!"
        }
        const result = await prisma.game.update({
            where: {
                id: game.id
            },
            data: {
                hosts: {
                    connect: {
                        id: host.id
                    }
                }
            }
        })
        if (!result) return {
            error: "Something went wrong in adding new Host"
        }
        return {
            newGame: result
        }
    } else if (action === 'delete') {
        const result = await prisma.game.update({
            where: {
                id: game.id
            },
            data: {
                hosts: {
                    disconnect: {
                        id: host.id
                    }
                }
            }
        })
        if (!result) return {
            error: "Something went wrong in removing host"
        }
        return {
            newGame: result
        }
    } else {
        return {
            error: "Invalid action"
        }
    }
}

export const manageCharacters: (
    form: {
        characterId?: string,
        gameId: string,
        action: string
    },
    request: Request
) => Promise<{
    error?: string,
    newGame?: Game
}> = async ({ characterId, gameId, action }, request) => {
    const game = await prisma.game.findUnique({
        where: {
            id: gameId
        }
    })
    if (!game) return {
        error: "Could not find a valid game"
    }

    let character = await prisma.character.findUnique({
        where: {
            id: characterId
        }
    })

    if (!character) return {
        error: "Could not find character"
    }

    let owner = await prisma.user.findFirst({
        where: {
            characters: {
                some: {
                    id: character.id
                }
            }
        }
    })

    if (!owner) return {
        error: "Could not find owner of this character"
    }

    if (action === 'add') {
        if (
            (await prisma.character.findFirst({
                where: {
                    id: character.id,
                    activeGameId: game.id
                }
            }))
        ) return {
            error: "This character is already added!"
        }
        const result = await prisma.game.update({
            where: {
                id: game.id
            },
            data: {
                participatingCharacters: {
                    connect: {
                        id: character.id
                    }
                },
                participatingPlayers: {
                    connect: {
                        id: owner.id
                    }
                }
            }
        })
        if (!result) return {
            error: "Something went wrong in adding new character"
        }
        return {
            newGame: result
        }
    } else if (action === 'delete') {
        const result = await prisma.game.update({
            where: {
                id: game.id
            },
            data: {
                participatingCharacters: {
                    disconnect: {
                        id: character.id
                    }
                },
                participatingPlayers: {
                    disconnect: {
                        id: owner.id
                    }
                }
            }
        })
        if (!result) return {
            error: "Something went wrong in removing Character"
        }
        return {
            newGame: result
        }
    } else {
        return {
            error: "Invalid action"
        }
    }
}

export const manageReports: (
    gameId: string,
    action: "update" | "add" | "publish" | "delete",
    fields: {
        phaseId?: string,
        type?: EventTypes,
        message?: string,
        clues?: string,
        actorId?: string,
        targetId?: string
    },
) => Promise<{
    error?: string,
    newGame?: GameWithMods
}> = async (gameId, action, fields) => {
    let { game } = await getGameById(gameId)
    if (!game) return {
        error: "Could not find game"
    }

    if (action === 'add') {
        if (!fields?.phaseId) return {
            error: "Could not find phase"
        }

        const cluesArray = fields?.clues?.split("$$") || []

        const event = await prisma.event.create({
            data: {
                draft: true,
                type: fields?.type || 'KILL',
                message: fields?.message || '',
                clues: cluesArray,
                ...(fields?.targetId ? { target: { connect: { id: fields?.targetId } } } : {}),
                ...(fields?.actorId ? { actor: { connect: { id: fields?.actorId } } } : {}),
                phase: {
                    connect: {
                        id: fields?.phaseId
                    }
                }
            }
        })

        if (!event) return {
            error: "Could not create new event"
        }

        return {
            newGame: (await getGameById(gameId) as GameWithMods)
        }
    }

    return {
        error: "Invalid query"
    }
}