import { prisma } from '~/utils/prisma.server'
import { getUser } from './users.server'
import { Params } from '@remix-run/react'
import { AvatarColors, AvatarTypes, User } from '@prisma/client'

export const getProfileData: (request: Request, params: Params) => Promise<{
    user?: User,
    owner: boolean,
    profileData?: any
}> = async (request: Request, params: Params) => {
    let { user } = await getUser(request)

    const data = (await prisma.user.findFirst({
        where: {
            username: {
                equals: params.userId,
                mode: 'insensitive'
            }
        },
        include: {
            characters: true
        }
    }))

    return {
        user,
        owner: data?.username === user?.username,
        profileData: data
    }
}

export const updateUserProfile: (
    request: Request,
    avatar?: {
        avatarType?: AvatarTypes,
        avatarColor?: AvatarColors,
        avatarUrl?: string
    }) => Promise<{
        error?: string
    }> = async (request, avatar) => {
        const { user } = await getUser(request)
        if (!user) return { error: "Could not find user in database" }

        const result = await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                avatar: avatar
            }
        })

        if (!result) return { error: "Could not update user profile" }

        return { error: undefined }
    }