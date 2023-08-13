import { Alignment, Game, Role, User } from "@prisma/client";
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { Link, useActionData, useLoaderData, useParams } from "@remix-run/react";
import { useState } from "react";
import { v4 } from "uuid";
import CharacterAvatar from "~/components/character-avatar";
import Layout from "~/components/layout";
import { GameCharacterStatusEmojis, RoleAlignmentEmojis } from "~/utils/constants";
import { getGameById, requireHost } from "~/utils/games.server";
import { prisma } from "~/utils/prisma.server";
import { getMyCharacterGameProfile } from "~/utils/roles.server";
import { CharacterWithMods, CharacterWithRole, EventWithMods, GameWithMods, PhaseWithMods, RoleWithNotes, UserWithMods } from "~/utils/types";
import { getUser } from "~/utils/users.server";

export const loader: LoaderFunction = async ({ request, params }) => {
    const { user } = await getUser(request)
    if (!user) return redirect(`/games/${params.gameId}`)
    const { game } = await getGameById(params.gameId || '')
    if (!game) return redirect('/games')

    const currentPhase = (game.currentPhaseId ? await prisma.phase.findFirst({
        where: {
            id: game.currentPhaseId
        },
        include: {
            characterStatus: true,
            events: true
        }
    }) : undefined)

    const { character, myRole } = user?.id ? await getMyCharacterGameProfile(user.id, game.id) : { character: undefined, myRole: undefined }

    return json({ user, game, currentPhase, character, myRole })
}

export const action: ActionFunction = async ({ request, params }) => {
    const form = await request.formData()
    const notes = form.get('notes') as string
    const characterId = form.get('_action') as string

    if (!characterId) return json({
        error: "Could not find character Id..."
    })

    if (notes.length > 1000) return json({
        error: "Notes cannot be longer than 1000 characters long"
    })

    const result = await prisma.gameRoles.update({
        where: {
            gameId: params.gameId!
        },
        data: {
            assignedRoles: {
                updateMany: {
                    where: {
                        characterId
                    },
                    data: {
                        notes
                    }
                }
            }
        }
    })

    return null
}

export default function Dashboard() {
    const { user, game, currentPhase, character, myRole }: { user?: UserWithMods, game?: GameWithMods, currentPhase?: PhaseWithMods, character?: CharacterWithRole, myRole?: RoleWithNotes } = useLoaderData()
    const params = useParams()
    const action = useActionData()

    const [editingNotes, setEditingNotes] = useState(false)
    const [inputs, setInputs] = useState({ notes: myRole?.notes || '' })

    return (
        <Layout
            user={user}
            navigation={true}
            navArray={[
                { name: 'Games', url: `/games`, id: 'games' },
                { name: game?.name || '', url: `/games/${params?.gameId}`, id: params?.gameId || '', parent: 'games' }
            ]}
        >
            <div className="p-8 md:p-12">
                <div className="my-5">
                    <Link to={`/games/${params?.gameId}`}>← Back to {game?.name}</Link>
                </div>

                <div className="flex justify-center w-full">

                    <div className={
                        `w-3/4 flex flex-col justify-center items-center
                        ${(!currentPhase || currentPhase.time === 'NIGHT') ?
                            'bg-dogwood text-licorice-800' :
                            'bg-licorice-900 text-dogwood'
                        }
                        rounded-lg p-5 relative`
                    }>

                        <div className="text-3xl absolute top-5 right-5">
                            {(game?.status === 'ENLISTING' || currentPhase?.time === 'NIGHT') ?
                                '🌤️' :
                                '🌙'}
                        </div>

                        <CharacterAvatar
                            avatarUrl={character?.avatarUrl || undefined}
                            size='XLARGE'
                        />

                        <div className="text-xl md:text-2xl font-bold">
                            {character?.name} {GameCharacterStatusEmojis[currentPhase?.characterStatus?.status.filter(status => status.characterId === character?.id)[0].status!]}
                        </div>

                        <div className="flex flex-row items-stretch justify-evenly font-semibold text-xl my-2 bg-dogwood text-licorice-900 rounded-md w-full">
                            <div>STR: {character?.stats.strength}</div>
                            <div>STL: {character?.stats.stealth}</div>
                            <div>SKL: {character?.stats.skill}</div>
                            <div>CHR: {character?.stats.charisma}</div>
                        </div>

                        <div className="my-5 border-b-2 border-b-licorice-600 w-full" />

                        <div className="flex flex-col self-start items-start w-full">

                            <div className="py-2">
                                <span className="font-bold text-lg">Role: </span>{myRole?.name ? <Link to={`/gm-realm/roles/${myRole.id}`}>
                                    {myRole.name}
                                </Link> : <span>
                                    Not yet assigned!
                                </span>}
                            </div>

                            {myRole?.alignment ? <div className="py-2">
                                <span className="font-bold text-lg">
                                    Alignment:&nbsp;
                                </span>
                                <span>
                                    {myRole.alignment} {RoleAlignmentEmojis[myRole.alignment]}
                                </span>
                            </div> : ''}

                            {myRole && game?.status === 'ONGOING' ? <div className="py-2 self-center w-full">
                                <span className="font-bold text-lg">Notes: </span>

                                <form method="POST" className="flex flex-col justify-center items-center">
                                    <textarea
                                        name="notes"
                                        value={inputs.notes}
                                        onChange={e => setInputs({ ...inputs, notes: e.target.value })}
                                        className="block lg:hidden rounded-xl p-3 text-licorice-800 bg-slate-100"
                                        rows={10}
                                        cols={25}
                                    />
                                    <textarea
                                        name="notes"
                                        value={inputs.notes}
                                        onChange={e => setInputs({ ...inputs, notes: e.target.value })}
                                        className="hidden lg:block rounded-xl p-3 text-licorice-800 bg-slate-100"
                                        rows={10}
                                        cols={50}
                                    />
                                    <div>
                                        {action?.error}
                                    </div>
                                    <button
                                        type="submit"
                                        name="_action"
                                        value={character?.id}
                                        className="cursor-pointer text-xl border-[1px] border-neonblue hover:bg-neonblue hover:text-licorice-900 rounded-lg py-1 px-2 my-3 bg-transparent text-neonblue transition"
                                    >
                                        Save
                                    </button>
                                </form>
                            </div> : ''}

                        </div>



                    </div>

                </div>

            </div>
        </Layout>
    )
}