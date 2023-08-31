import { User } from "@prisma/client";
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { useState } from "react";
import InputField from "~/components/input-field";
import { Modal } from "~/components/modal";
import { editGame, getGameById, requireHost } from "~/utils/games.server";
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

export const action: ActionFunction = async ({ request, params }) => {
    const form = await request.formData()
    const winnerCrowns = Number(form.get('winnerCrowns'))
    const winnerRubies = Number(form.get('winnerRubies'))
    const loserRubies = Number(form.get('loserRubies'))
    const loserStrikes = Number(form.get('loserStrikes'))

    const { error, newGame } = await editGame({ winnerCrowns, winnerRubies, loserRubies, loserStrikes }, params?.gameId || '')
    if (error) return json({ error })
    return redirect(`/games/${params.gameId}/edit`)
}

export default function EditGameName() {
    const loaderData = useLoaderData()
    const { game, }: { user?: User, game?: GameWithMods, admin?: boolean } = loaderData
    const action = useActionData()

    const navigate = useNavigate()
    const params = useParams()

    const [form, setForm] = useState({
        winnerCrowns: game?.winnerCrowns.toString() || '1',
        winnerRubies: game?.winnerRubies?.toString() || '1',
        loserStrikes: game?.loserStrikes.toString() || '1',
        loserRubies: game?.loserRubies?.toString() || '1',
    })

    return <Modal isOpen={true} onClick={() => navigate(`/games/${params.gameId}/edit`)}>
        <form method="POST">
            <input
                type="hidden"
                name="attr"
                value='name'
            />
            <InputField
                name='winnerCrowns'
                value={form.winnerCrowns}
                onChange={e => setForm({ ...form, winnerCrowns: e.target.value })}
                display={`Winner Crowns`}
                type="number"
            />
            <InputField
                name='winnerRubies'
                value={form.winnerRubies}
                onChange={e => setForm({ ...form, winnerRubies: e.target.value })}
                display={`Winner Rubies`}
                type="number"
            />
            <InputField
                name='loserStrikes'
                value={form.loserStrikes}
                onChange={e => setForm({ ...form, loserStrikes: e.target.value })}
                display={`Loser Strikes`}
                type="number"
            />
            <InputField
                name='loserRubies'
                value={form.loserRubies}
                onChange={e => setForm({ ...form, loserRubies: e.target.value })}
                display={`Loser Rubies`}
                type="number"
            />
            <button
                type="submit"
            >
                Save Changes
            </button>
        </form>
    </Modal>
}
