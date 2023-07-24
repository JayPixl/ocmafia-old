import { Game, Phase, User } from "@prisma/client";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import Layout from "~/components/layout";
import { getGameById, requireHost } from "~/utils/games.server";
import { PhaseWithMods } from "~/utils/types";
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
                { name: game?.name, url: `/games/${params?.gameId}`, id: params?.gameId || '', parent: 'games' },
                { name: "Reports", url: `/games/${params?.gameId}/reports`, id: 'reports' || '', parent: params?.gameId }
            ]}
        >
            <div className="p-8 flex flex-col">
                <Link to={`/games/${params?.gameId}`}><div className="">← Back to {game?.name}</div></Link>
                <div><h2 className="text-3xl font-bold py-5">Reports</h2></div>

                {game?.phases?.map((phase: PhaseWithMods) => (phase?.events?.length !== 0) ? <>
                    <div><h3 className="text-xl font-semibold">{`${phase.time} ${phase.dayNumber} Report`}</h3></div>
                    {phase?.events?.map(event => <div className="text-lg">
                        <div>{event.message}</div>
                        <div>{event?.clues.map(clue => <div className="text-sm">
                            {clue}
                        </div>)}
                        </div>
                    </div>)}
                </> : <>
                    <div><h3 className="text-xl font-semibold">{`No Reports Yet!`}</h3></div>
                </>
                ) || <>
                        <div>No Reports Yet!</div>
                    </>}

                {authorized && (
                    <div>
                        <Link to={`/games/${params.gameId}/reports/edit`}>
                            Edit Reports
                        </Link>
                    </div>
                )}
            </div>
        </Layout>
    )
}