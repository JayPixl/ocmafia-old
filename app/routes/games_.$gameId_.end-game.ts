import { LoaderFunction, redirect } from "@remix-run/node";
import { getGameById, requireHost } from "~/utils/games.server";
import { prisma } from "~/utils/prisma.server";
import { getUser } from "~/utils/users.server";

export const loader: LoaderFunction = async ({ request, params }) => {
    const { user } = await getUser(request)
    const { game } = await getGameById(params.gameId || '')
    if (!game) return redirect('/games')

    const { authorized } = await requireHost(request, game.id)
    if (!authorized) return redirect(`/games/${params.gameId}`)

    if (game.status !== 'ONGOING') return redirect(`/games/${params.gameId}/edit`)

    await prisma.game.update({
        where: {
            id: game.id
        },
        data: {
            status: 'COMPLETED',
        }
    })

    await prisma.character.updateMany({
        where: {
            currentGameId: game.id
        },
        data: {
            currentGameId: null
        }
    })

    return redirect(`/games/${params.gameId}/edit`)
}