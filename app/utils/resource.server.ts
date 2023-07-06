import { Prisma } from "@prisma/client"
import { prisma } from "./prisma.server"

export const getFilteredUserData: (
    filters: {
        username?: string,
        id?: string
    },
    select: {
        id?: boolean,
        username?: boolean,
        characters?: boolean
    },
    take?: number,
) => Promise<{
    results?: any[],
    error?: string
}> = async (filters, select, take = 10) => {
    if (!filters.id && !filters.username) return {
        error: "No filters added"
    }
    const where: Prisma.UserWhereInput = filters?.username ? {
        ...filters,
        username: {
            contains: filters.username,
            mode: "insensitive"
        }
    } : {
        ...filters
    }

    const results = await prisma.user.findMany({
        take,
        where,
        select
    })

    if (!results) return {
        error: "Could not retrieve user data"
    }
    return {
        results
    }
}