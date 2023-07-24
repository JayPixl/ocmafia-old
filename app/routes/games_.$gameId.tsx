import { Game, User } from "@prisma/client";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import CharacterAvatar from "~/components/character-avatar";
import Layout from "~/components/layout";
import { GameCharacterStatusEmojis } from "~/utils/constants";
import { getGameById, requireHost } from "~/utils/games.server";
import { prisma } from "~/utils/prisma.server";
import { CharacterWithMods, EventWithMods, PhaseWithMods } from "~/utils/types";
import { getUser } from "~/utils/users.server";

export const loader: LoaderFunction = async ({ request, params }) => {
    const { user } = await getUser(request)
    const { authorized } = await requireHost(request, params.gameId || '')
    const { game } = await getGameById(params.gameId || '')
    if (!game) return redirect('/games')

    let recentReport = (await prisma.phase.findMany({ where: { gameId: game.id, events: { some: { draft: false } } }, include: { events: true }, take: 1 }))[0]

    return json({ user, game, authorized, recentReport })
}

export default function Games() {
    const { user, game, authorized, recentReport } = useLoaderData()
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
            <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-baseline">
                    <h2 className="text-3xl font-bold">{game?.name}</h2>
                    <div className="mx-3 hidden md:block">-</div>
                    <div className="text-xl">({game?.status})</div>
                </div>

                <div className="italic text-lg mb-3">{game?.location}</div>

                <div className="w-full flex flex-col bg-dogwood text-licorice-800 rounded-lg p-5">
                    <div className="text-xl font-bold mb-3">Current Status:</div>
                    {game?.participatingCharacters.length > 0 ? game?.participatingCharacters?.map((char: CharacterWithMods, index: number) => <Link to={`/gm-realm/characters/${char.id}`} className="flex flex-row items-center" key={char.id}>
                        <CharacterAvatar
                            avatarUrl={char.avatarUrl || undefined}
                            size='SMALL'
                        />
                        <div className="mx-4 font-bold text-lg">
                            {char.name}
                        </div>
                        <div>
                            {GameCharacterStatusEmojis[game?.characterStatuses[index]]}
                        </div>
                    </Link>) : <div>
                        No Characters Yet!
                    </div>}
                </div>

                <div className="flex flex-col my-5">
                    {recentReport ? <>
                        <div><h3 className="text-xl font-semibold">{`${recentReport.time} ${recentReport.dayNumber} Report`}</h3></div>
                        {recentReport.events?.map((event: EventWithMods) => <div className="text-lg">
                            <div>{event.message}</div>
                            <div>{event?.clues.map(clue => <div className="text-sm">
                                {clue}
                            </div>)}
                            </div>
                        </div>)}
                    </> : <>
                        <div><h3 className="text-xl font-semibold">{`No Reports Yet!`}</h3></div>
                    </> || <>
                        <div>No Reports Yet!</div>
                    </>}

                    <div className="text-lg underline hover:no-underline">
                        <Link to={`/games/${params.gameId}/reports/`}>
                            All Reports →
                        </Link>
                    </div>
                </div>

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