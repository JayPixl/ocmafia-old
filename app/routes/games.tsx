import { Game, User } from "@prisma/client";
import { LoaderFunction, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import Layout from "~/components/layout";
import { getFilteredGames } from "~/utils/games.server";
import { getUser } from "~/utils/users.server";

export const loader: LoaderFunction = async ({ request }) => {
    const { user } = await getUser(request)
    const { games } = await getFilteredGames()
    return json({ user, games })
}

export default function Games() {
    const { user, games }: { user?: User, games?: Game[] } = useLoaderData()
    return (
        <Layout user={user} navigation={true} navArray={[{ name: 'Games', url: `/games`, id: 'games' }]}>
            <div>
                All Games
            </div>
            {games?.map(game => (
                <div key={game.id}>
                    <div>
                        <Link to={`/games/${game.id}`}>
                            {game.name}
                        </Link>
                    </div>
                </div>
            ))
            }
        </Layout>
    )
}