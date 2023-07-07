import { User } from "@prisma/client";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import Layout from "~/components/layout";
import { getGameById, requireHost } from "~/utils/games.server";
import { GameWithMods } from "~/utils/types";
import { getUser } from "~/utils/users.server";

export const loader: LoaderFunction = async ({ request, params }) => {
    const { user } = await getUser(request)
    const { game } = await getGameById(params.gameId || '')
    if (!game) return redirect('/games')

    const { authorized, admin } = await requireHost(request, game.id)
    if (!authorized) return redirect(`/games/${params.gameId}`)
    return json({ user, game, admin })
}

export default function EditGames() {
    const { user, game, admin }: { user?: User, game?: GameWithMods, admin?: boolean } = useLoaderData()
    const params = useParams()

    return (
        <Layout
            user={user}
            navigation={true}
            navArray={[
                { name: 'Games', url: `/games`, id: 'games' },
                { name: game?.name || '', url: `/games/${params?.gameId}`, id: params?.gameId || '', parent: 'games' }
            ]}
        >
            <div>
                Edit Game
            </div>
            {admin && <div>
                You are admin!
            </div>}
            <div className="flex flex-col">
                <div className="flex flex-row"><h2>{game?.name}</h2><Link to={`/games/${params.gameId}/edit/name`}>Edit</Link></div>
                <div className="flex flex-row">Location: <span>{game?.location}</span><Link to={`/games/${params.gameId}/edit/location`}>Edit</Link></div>
                <div>
                    Hosts
                    <Link to={`/games/${params.gameId}/edit/hosts`}>
                        Edit
                    </Link>
                    <div>
                        {game?.hosts?.map(host => (
                            <div key={host.id}>
                                {host.username}
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    Characters
                    <Link to={`/games/${params.gameId}/edit/characters`}>
                        Edit
                    </Link>
                    <div>
                        {game?.participatingCharacters?.map(char => (
                            <div key={char.id}>
                                {char?.displayName || char.name} ({char?.owner?.username})
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    )
}