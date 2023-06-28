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

    const data = (await prisma.user.findMany({
        where: {
            username: {
                equals: params.userId,
                mode: 'insensitive'
            }
        }
    }))[0]

    if (data?.username === user?.username) {
        return {
            user,
            owner: true,
            profileData: data
        }
    } else {
        return {
            user,
            owner: false,
            profileData: {
                username: data?.username,
                avatar: data?.avatar,
            }
        }
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