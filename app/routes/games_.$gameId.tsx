import { Game, User } from "@prisma/client";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import Layout from "~/components/layout";
import { getGameById } from "~/utils/games.server";
import { getUser } from "~/utils/users.server";

export const loader: LoaderFunction = async ({ request, params }) => {
    const { user } = await getUser(request)
    const { game } = await getGameById(params.gameId || '')
    if (!game) return redirect('/games')

    return json({ user, game })
}

export default function Games() {
    const { user, game } = useLoaderData()
    const params = useParams()
    return (
        <Layout user={user} navigation={true}>
            <div>
                <div><h2>{game?.name}</h2></div>
                <div>Location: <span>{game?.location}</span></div>
                <div>
                    <Link to={`/games/${params.gameId}/edit`}>
                        Edit Game
                    </Link>
                </div>
            </div>
        </Layout>
    )
}