import { EventTypes, Game, Time, User } from "@prisma/client";
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { Link, useActionData, useLoaderData, useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import InputField from "~/components/input-field";
import Layout from "~/components/layout";
import Textarea from "~/components/textarea";
import { getGameById, manageReports, requireHost } from "~/utils/games.server";
import { EventWithMods, GameWithMods, PhaseWithMods, UserWithMods } from "~/utils/types";
import { getUser } from "~/utils/users.server";
import { validateLength } from "~/utils/validators";

export const loader: LoaderFunction = async ({ request, params }) => {
    const { user } = await getUser(request)

    const { authorized } = await requireHost(request, params.gameId || '')
    if (!authorized) return redirect(`/games/${params.gameId}/reports`)

    const { game } = await getGameById(params.gameId || '')
    if (!game) return redirect('/games')

    return json({ user, game, authorized })
}

export const action: ActionFunction = async ({ request, params }) => {
    const form = await request.formData()
    const phaseId = form.get("phaseId") as string
    const message = form.get("message") as string
    const eventType = form.get("eventType") as EventTypes
    let targetId = form.get("targetId") as string || undefined
    if (targetId === 'undefined') targetId = undefined
    let actorId = form.get("actorId") as string || undefined
    if (actorId === 'undefined') actorId = undefined
    const clues = form.get("clues") as string

    const fieldErrors = {
        message: validateLength(message, 50, 1),
        clues: validateLength(clues, 100),
    }

    const fields = {
        phaseId,
        message,
        eventType,
        targetId,
        actorId,
        clues
    }

    if (Object.values(fieldErrors).some(Boolean)) return json({
        fields,
        fieldErrors
    })

    const { error, newGame } = await manageReports(params.gameId || '', "add", fields)

    if (error) return json({ error, fields })
    return redirect(`/games/${params.gameId}/reports`)

}

export default function Games() {
    const { user, game }: { user?: UserWithMods, game?: GameWithMods } = useLoaderData()
    const actionData = useActionData()
    const params = useParams()

    const [currentPhase, setCurrentPhase] = useState<PhaseWithMods | undefined>(game?.currentPhase || undefined)

    const [inputs, setInputs] = useState({
        phaseId: actionData?.fields?.phaseId || game?.currentPhase?.id || undefined,
        message: actionData?.fields?.message || '',
        eventType: actionData?.fields?.eventType || 'KILL' as EventTypes,
        target: actionData?.fields?.targetId || 'undefined',
        actor: actionData?.fields?.actorId || 'undefined',
        clues: actionData?.fields?.clues || '',
    })

    useEffect(() => {
        setCurrentPhase(game?.phases?.filter(phase => phase.id === inputs.phaseId)[0])
    }, [inputs.phaseId])

    return (
        <Layout
            user={user}
            navigation={true}
            navArray={[
                { name: 'Games', url: `/games`, id: 'games' },
                { name: game?.name || '', url: `/games/${params?.gameId}`, id: params?.gameId || '', parent: 'games' },
                { name: "Reports", url: `/games/${params?.gameId}/reports`, id: 'reports' || '', parent: params?.gameId }
            ]}
        >
            <div>
                <form method="POST" className="flex flex-col items-start">
                    <div>
                        Phase:
                    </div>
                    <select
                        name="phaseId"
                        onChange={e => setInputs({
                            ...inputs,
                            phaseId: e.target.value
                        })}
                        value={inputs.phaseId}
                    >
                        {game?.phases?.map(phase => <option key={`${phase.id}`} value={`${phase.id}`}>
                            {`${phase.time} ${phase.dayNumber}`}
                        </option>)}
                    </select>

                    <div>
                        Type:
                    </div>
                    <select
                        name="eventType"
                        onChange={e => setInputs({
                            ...inputs,
                            eventType: e.target.value
                        })}
                        value={inputs.eventType}
                    >
                        {Object.values(EventTypes).map(type => <option key={type} value={type}>
                            {type}
                        </option>)}
                    </select>

                    <div>
                        Target:
                    </div>

                    <select
                        name="targetId"
                        onChange={e => setInputs({
                            ...inputs,
                            target: e.target.value
                        })}
                        value={inputs.target}
                    >
                        <option value={'undefined'}>( None )</option>
                        {game?.participatingCharacters?.map(char => <option key={char.id} value={char.id}>
                            {char.name}
                        </option>)}
                    </select>

                    <div>
                        Actor:
                    </div>

                    <select
                        name="actorId"
                        onChange={e => setInputs({
                            ...inputs,
                            actor: e.target.value
                        })}
                        value={inputs.actor}
                    >
                        <option value={'undefined'}>( None )</option>
                        {game?.participatingCharacters?.map(char => <option key={char.id} value={char.id}>
                            {char.name}
                        </option>)}
                    </select>

                    <InputField
                        name='message'
                        value={inputs.message}
                        onChange={e => setInputs({
                            ...inputs,
                            message: e.target.value
                        })}
                        display={`Event Message`}
                        type="text"
                        error={actionData?.fieldErrors?.message}
                    />

                    <Textarea
                        name="clues"
                        value={inputs.clues}
                        onChange={e => setInputs({
                            ...inputs,
                            clues: e.target.value
                        })}
                        display="Clues (Separate clues with '$$')"
                        error={actionData?.fieldErrors?.clues}
                    />

                    <button
                        type="submit"
                        className="self-center text-xl border-[1px] border-slate-700 text-slate-700 rounded-lg py-1 px-2 mt-8 hover:bg-bittersweet hover:border-bittersweet hover:text-white transition md:text-2xl"
                    >
                        Add
                    </button>
                </form>
                <div>
                    {currentPhase?.events?.map(event => <div>
                        {JSON.stringify(event)}
                    </div>
                    ) || <div>
                            No Events Yet!
                        </div>}
                </div>
                {JSON.stringify(inputs)}
            </div>
        </Layout>
    )
}