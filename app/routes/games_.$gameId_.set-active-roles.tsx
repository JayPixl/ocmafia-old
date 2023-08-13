import { CharGameStatusPairing, GameCharacterStatus, Role, User } from "@prisma/client";
import { ActionFunction, LoaderArgs, json, redirect } from "@remix-run/node";
import { Link, useActionData, useLoaderData, useParams } from "@remix-run/react";
import { useState, useEffect } from 'react'
import CharacterAvatar from "~/components/character-avatar";
import Layout from "~/components/layout";
import { GameCharacterStatusEmojis, RoleAlignmentEmojis } from "~/utils/constants";
import { getGameById, manageCharacterStatus, requireHost } from "~/utils/games.server";
import { prisma } from "~/utils/prisma.server";
import { updateActiveRoles } from "~/utils/roles.server";
import { GameWithMods, PhaseWithMods } from "~/utils/types";
import { getUser } from "~/utils/users.server";

export async function loader({ request, params }: LoaderArgs) {

    const { user } = await getUser(request)

    const { authorized } = await requireHost(request, params.gameId || '')
    if (!authorized) return redirect(`/games/${params.gameId}/reports`)

    const { game }: { game?: GameWithMods } = await getGameById(params.gameId || '')
    if (!game) return redirect('/games')

    if (game.status !== 'ENLISTING') return redirect(`/games/${params.gameId}/edit`)

    const roles = (await prisma.role.findMany({
        select: {
            id: true,
            name: true,
            alignment: true
        }
    })) as Role[]

    return json({ user, game, authorized, roles })
}

export const action: ActionFunction = async ({ request, params }) => {
    const form = await request.formData()

    let roles: string[] = []
    let i: number = 0

    while (true) {
        const value = form.get(`roles[${i}]`) as string
        if (value) {
            roles.push(value)
            i++
        } else {
            break
        }
    }

    const { error } = await updateActiveRoles(params.gameId || '', roles)
    if (error) return json({
        error
    })

    return redirect(`/games/${params.gameId}/edit`)
}

export default function SetActiveRoles() {
    const params = useParams()

    const { game, user, roles } = useLoaderData()
    const actionData = useActionData()

    const [inputs, setInputs] = useState<{
        id: string,
        name: string,
        uniqueId: string
    }[]>()

    useEffect(() => {
        let newArray: {
            id: string,
            uniqueId: string,
            name: string
        }[] = []
        const villager: Role = roles.filter((r: Role) => r.name === 'Villager')[0]
        for (let i: number = 0; i < game?.playerCount; i++) {
            if (game?.activeRoleIds[i]) {
                newArray.push({
                    id: game.activeRoleIds[i],
                    uniqueId: crypto.randomUUID(),
                    name: roles.filter((role: Role) => role.id === game?.activeRoleIds[i])[0].name,
                })
            } else {
                newArray.push({
                    id: villager.id,
                    uniqueId: crypto.randomUUID(),
                    name: villager.name,
                })
            }
        }
        setInputs(newArray)
    }, [])

    return <Layout
        user={user}
        navigation={true}
        navArray={[
            { name: 'Games', url: `/games`, id: 'games' },
            { name: game?.name || '', url: `/games/${params?.gameId}`, id: params?.gameId || '', parent: 'games' },
            { name: "Edit", url: `/games/${params?.gameId}/edit`, id: 'edit' || '', parent: params?.gameId }
        ]}
    >
        <div className="p-5">
            <div className="w-full flex flex-col items-center">

                <form method="POST" className="flex flex-col items-center">

                    <div className="text-3xl font-bold">
                        Edit Active Roles
                    </div>

                    <div className="flex flex-row flex-wrap justify-center">

                        {inputs?.map((item, index) => <div className="flex flex-row justify-between items-center w-full sm:w-1/4 m-3" key={crypto.randomUUID()}>

                            <select
                                name={`roles[${index}]`}
                                value={inputs.filter(i => i.uniqueId === item.uniqueId)[0].id}
                                onChange={e => {
                                    let newArray: {
                                        id: string,
                                        uniqueId: string,
                                        name: string
                                    }[] = []
                                    inputs.map(i => {
                                        if (i.uniqueId === item.uniqueId) newArray.push({
                                            id: e.target.value,
                                            uniqueId: item.uniqueId,
                                            name: roles.filter((role: Role) => role.id === e.target.value)[0].name
                                        })
                                        else newArray.push(i)
                                    })
                                    setInputs(i => newArray)
                                }}
                                className="bg-white font-bold text-lg rounded-lg text-licorice-800 my-2 py-1 hover:opacity-80 w-full"
                            >
                                {roles.map((role: Role) => <option key={crypto.randomUUID()} value={role.id}>
                                    {role.name}
                                </option>)}
                            </select>

                            <div className="p-2">
                                {RoleAlignmentEmojis[roles.filter((role: Role) => role.id === item.id)[0].alignment]}
                            </div>

                        </div>
                        )}

                    </div>

                    <button type="submit" className="text-xl border-[1px] border-neonblue hover:text-neonblue rounded-lg py-1 px-2 my-3 hover:bg-transparent bg-neonblue text-licorice-800 transition md:text-2xl">
                        Submit
                    </button>

                </form>
            </div>
        </div>
    </Layout>
}