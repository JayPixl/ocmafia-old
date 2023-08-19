import { GameRoles, User } from "@prisma/client";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { Link, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { useState } from 'react'
import Layout from "~/components/layout";
import { Modal } from "~/components/modal";
import { getGameById, requireHost } from "~/utils/games.server";
import { prisma } from "~/utils/prisma.server";
import { GameWithMods } from "~/utils/types";
import { getUser } from "~/utils/users.server";

export const loader: LoaderFunction = async ({ request, params }) => {
    const { user } = await getUser(request)
    const { game } = await getGameById(params.gameId || '')
    if (!game) return redirect('/games')

    const { authorized, admin } = await requireHost(request, game.id)
    if (!authorized) return redirect(`/games/${params.gameId}`)

    const assignedRoles = await prisma.gameRoles.findUnique({
        where: {
            gameId: game.id
        }
    })

    return json({ user, game, admin, assignedRoles })
}

export default function EditGame() {
    const { user, game, admin, assignedRoles }: { user?: User, game?: GameWithMods, admin?: boolean, assignedRoles?: GameRoles } = useLoaderData()
    const params = useParams()
    const navigatate = useNavigate()
    const [confirmation, setConfirmation] = useState<any>(null)

    console.log(game?.activeRoleIds)

    const confirm: (redirect: string, warning?: string) => void = (redirect, warning = 'Are you sure?') => {
        setConfirmation({
            redirect,
            warning
        })
    }

    return (
        <Layout
            user={user}
            navigation={true}
            navArray={[
                { name: 'Games', url: `/games`, id: 'games' },
                { name: game?.name || '', url: `/games/${params?.gameId}`, id: params?.gameId || '', parent: 'games' },
                { name: "Edit", url: `/games/${params?.gameId}/edit`, id: 'edit' || '', parent: params?.gameId }
            ]}
        >
            <div className="w-full flex flex-col p-5">
                <div className="text-3xl font-semibold self-center my-3">
                    Edit Game
                </div>

                {admin && <div className="self-center italic font-light text-bittersweet my-1">
                    Editing as Admin
                </div>}

                <div className="flex flex-col sm:flex-row justify-evenly w-full">

                    <div className="flex flex-col justify-center items-center">
                        <div className="flex flex-row items-end my-2">
                            <h2 className="text-2xl font-semibold">{game?.name}</h2>
                            <Link
                                to={`/games/${params.gameId}/edit/name`}
                                className="italic text-base ml-3 underline hover:no-underline"
                            >
                                Edit
                            </Link>
                        </div>

                        <div className="flex flex-row items-end my-2">
                            <div className="text-xl font-semibold">Location: <span className="italic">{game?.location}</span></div>
                            <Link
                                to={`/games/${params.gameId}/edit/location`}
                                className="italic text-base ml-3 underline hover:no-underline"
                            >
                                Edit
                            </Link>
                        </div>

                        <div className="flex flex-row items-end my-2">
                            <div className="text-xl font-semibold">Player Count: <span className="italic">{game?.playerCount}</span></div>
                            <Link
                                to={`/games/${params.gameId}/edit/player-count`}
                                className="italic text-base ml-3 underline hover:no-underline"
                            >
                                Edit
                            </Link>
                        </div>

                        <div className="flex flex-row items-end my-2">
                            <div className="text-xl font-semibold">Game Awards: {game?.winnerCrowns}👑 {game?.winnerRubies}💎 / {game?.loserStrikes}❌ {game?.loserRubies}💎</div>
                            <Link
                                to={`/games/${params.gameId}/edit/awards`}
                                className="italic text-base ml-3 underline hover:no-underline"
                            >
                                Edit
                            </Link>
                        </div>

                        <div className="flex flex-col my-2">
                            <div className="flex flex-row items-end mb-2">
                                <div className="text-xl font-semibold">Hosts:</div>
                                <Link
                                    to={`/games/${params.gameId}/edit/hosts`}
                                    className="italic text-base ml-3 underline hover:no-underline"
                                >
                                    Manage
                                </Link>
                            </div>

                            <div className="self-center flex flex-col">
                                {game?.hosts?.length === 0 ? <div>
                                    No Hosts!
                                </div> : game?.hosts?.map(host => (
                                    <Link
                                        to={`/profile/${host.slug}`}
                                        key={host.id}
                                    >
                                        {host.username}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col my-2">
                            <div className="flex flex-row items-end mb-2">
                                <div className="text-xl font-semibold">Characters:</div>
                                {game?.status === 'ENLISTING' ? <Link
                                    to={`/games/${params.gameId}/edit/characters`}
                                    className="italic text-base ml-3 underline hover:no-underline"
                                >
                                    Manage
                                </Link> : ''}
                            </div>

                            <div className="self-center flex flex-col">
                                {game?.participatingCharacters?.length === 0 ? <div>
                                    No Characters!
                                </div> : game?.participatingCharacters?.map(char => (
                                    <Link
                                        to={`/gm-realm/characters/${char.id}`}
                                        key={char.id}
                                    >
                                        {char.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="my-2">
                            <Link
                                to={`/games/${params.gameId}/edit/game-messages`}
                                className="italic text-lg underline hover:no-underline"
                            >
                                Edit Game Messages
                            </Link>
                        </div>

                        {game?.status === 'ENLISTING' ? <div className="my-2">
                            <Link
                                to={`/games/${params.gameId}/set-active-roles`}
                                className="italic text-lg underline hover:no-underline"
                            >
                                Edit Active Roles
                            </Link>
                        </div> : ''}

                    </div>

                    <div className="flex flex-col justify-center items-center">

                        <div className="my-2">
                            <div className="text-4xl font-bold text-cinnabar">{game?.status}</div>
                        </div>

                        <div className="my-2">
                            <div>
                                {game?.status === 'ENLISTING' ? (
                                    game?.participatingCharacters?.length === game.playerCount &&
                                        game?.activeRoleIds?.length === game.playerCount &&
                                        assignedRoles &&
                                        assignedRoles.assignedRoles.length === game.playerCount &&
                                        JSON.stringify((assignedRoles.assignedRoles.map(pairing => pairing.roleId)).sort()) === JSON.stringify(game.activeRoleIds.sort()) ? <div
                                            onClick={() => confirm(`/games/${params.gameId}/start-game`, 'Are you sure you want to start the game? No more players can be added or removed from enlistment after this. Make sure you have your Game Start Phase set up and ready to go!')}
                                            className="cursor-pointer text-xl border-[1px] border-lime-500 text-lime-500 rounded-lg py-1 px-2 hover:bg-lime-500 hover:text-licorice-800 transition md:text-2xl"
                                        >
                                        Start Game
                                    </div> : <div
                                        className="cursor-not-allowed text-xl border-[1px] border-slate-500 text-slate-500 rounded-lg py-1 px-2 hover:bg-slate-500 hover:text-licorice-800 transition md:text-2xl"
                                    >
                                        <del>Start Game</del>
                                    </div>) : game?.status === 'ONGOING' ? <div
                                        onClick={() => confirm(`/games/${params.gameId}/end-game`, 'Are you sure you want to complete the game?')}
                                        className="cursor-pointer text-xl border-[1px] border-lime-500 text-lime-500 rounded-lg py-1 px-2 hover:bg-lime-500 hover:text-licorice-800 transition md:text-2xl"
                                    >
                                        Complete Game
                                    </div> : <div className="text-xl ml-2">
                                    Game Complete!
                                </div>}
                            </div>
                        </div>

                        <div className="my-2">
                            <div
                                onClick={() => confirm(`/games/${params.gameId}/reset-game`, 'Are you really sure you want to reset the game? This action is irreversible.')}
                                className="cursor-pointer text-xl border-[1px] border-bittersweet bg-bittersweet text-licorice-800 rounded-lg py-1 px-2 my-3 hover:bg-transparent hover:text-bittersweet transition md:text-2xl"
                            >
                                Reset Game
                            </div>
                        </div>

                        <div className="my-4">
                            <Link
                                to={`/games/${params.gameId}/reports/edit`}
                                className="text-xl border-[1px] border-neonblue text-neonblue rounded-lg py-1 px-2 my-3 hover:bg-neonblue hover:text-licorice-800 transition md:text-2xl"
                            >
                                Edit Reports...
                            </Link>
                        </div>

                        <div className="my-4">
                            <Link
                                to={`/games/${params.gameId}/kill-calculator`}
                                className="text-xl border-[1px] border-neonblue text-neonblue rounded-lg py-1 px-2 my-3 hover:bg-neonblue hover:text-licorice-800 transition md:text-2xl"
                            >
                                Kill Calculator
                            </Link>
                        </div>

                        <div className="my-4">
                            <Link
                                to={`/games/${params.gameId}/character-status/edit`}
                                className="text-xl border-[1px] border-neonblue text-neonblue rounded-lg py-1 px-2 my-3 hover:bg-neonblue hover:text-licorice-800 transition md:text-2xl"
                            >
                                Edit Character Status
                            </Link>
                        </div>

                        <div className="my-2">
                            <div>
                                {game?.status === 'ENLISTING' ?
                                    game?.activeRoleIds?.length === game.playerCount &&
                                        game?.participatingCharacters?.length === game.playerCount &&
                                        game?.participatingCharacters?.length === game?.activeRoleIds?.length ? <Link
                                            to={`/games/${params.gameId}/assign-roles`}
                                            className="cursor-pointer text-xl border-[1px] border-lime-500 text-lime-500 rounded-lg py-1 px-2 hover:bg-lime-500 hover:text-licorice-800 transition md:text-2xl"
                                        >
                                        Assign Roles
                                    </Link> : <div
                                        className="cursor-not-allowed text-xl border-[1px] border-slate-500 text-slate-500 rounded-lg py-1 px-2 hover:bg-slate-500 hover:text-licorice-800 transition md:text-2xl"
                                    >
                                        <del>Assign Roles</del>
                                    </div> : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {!confirmation ? '' : <Modal isOpen={true} onClick={() => setConfirmation(null)}>
                <div className="flex flex-col ">
                    <div className="text-bittersweet text-center text-xl p-5">
                        {confirmation.warning}
                    </div>

                    <div className="flex flex-row self-end">
                        <Link
                            to={confirmation.redirect}
                            onClick={() => setConfirmation(null)}
                            className="cursor-pointer text-xl border-[1px] border-neonblue text-white bg-neonblue rounded-lg py-1 px-2 my-3 mr-5 hover:bg-transparent hover:text-neonblue transition md:text-2xl"
                        >
                            Confirm
                        </Link>
                        <div
                            className="cursor-pointer text-xl border-[1px] border-white text-white rounded-lg py-1 px-2 my-3 hover:bg-white hover:text-licorice-800 transition md:text-2xl"
                            onClick={() => setConfirmation(null)}
                        >
                            Cancel
                        </div>
                    </div>

                </div>
            </Modal>}
        </Layout>
    )
}