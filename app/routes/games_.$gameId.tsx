import { Game, User } from "@prisma/client";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import Layout from "~/components/layout";
import { getGameById, requireHost } from "~/utils/games.server";
import { getUser } from "~/utils/users.server";

export const loader: LoaderFunction = async ({ request, params }) => {
    const { user } = await getUser(request)
    const { authorized } = await requireHost(request, params.gameId || '')
    const { game } = await getGameById(params.gameId || '')
    if (!game) return redirect('/games')

    return json({ user, game, authorized })
}

export default function Games() {
    const { user, game, authorized } = useLoaderData()
    const params = useParams()
    return (
        <Layout
            user={user}
            navigation={true}
            navArray={[
                { name: 'Games', url: `/games`, id: 'games' },
                { name: game?.name, url: `/games/${params?.gameId}`, id: params?.gameId || '', parent: 'games' }
            ]}
        >
            <div>
                <div><h2>{game?.name}</h2></div>
                <div>Location: <span>{game?.location}</span></div>
                {authorized && (
                    <div>
                        <Link to={`/games/${params.gameId}/edit`}>
                            Edit Game
                        </Link>
                    </div>
                )}
            </div>
        </Layout>
    )
}