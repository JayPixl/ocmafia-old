import { User } from "@prisma/client";
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { useActionData, useFetcher, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import InputField from "~/components/input-field";
import { Modal } from "~/components/modal";
import SelectBox from "~/components/select-box";
import { editGame, getGameById, manageCharacters, manageHosts, requireHost } from "~/utils/games.server";
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
    const method = form.get('method') as string
    const id = form.get('_action') as string || form.get('characterSelect') as string

    const { error, newGame } = await manageCharacters({ characterId: id, gameId: params.gameId || '', action: method }, request)
    if (error) return json({ error })
    return redirect(`/games/${params.gameId}/edit`)
}

export default function EditGameCharacters() {
    const { user, game, admin }: { user?: User, game?: GameWithMods, admin?: boolean } = useLoaderData()
    const action = useActionData()
    const fetcher = useFetcher()

    const navigate = useNavigate()
    const params = useParams()

    const [inputs, setInputs] = useState<any>({
        characterSelect: '',
        characterInput: ''
    })

    const [listItems, setListItems] = useState<any[]>([...(game?.participatingCharacters || [])])

    const handleChange: (input: string) => void = (input) => {
        setInputs({
            ...inputs,
            characterInput: input
        })
        const queryParams = new URLSearchParams
        queryParams.set('username', input)
        queryParams.set('returnUsernames', 'true')
        queryParams.set('returnCharacters', 'true')
        fetcher.load(`/fetch/users?${queryParams}`)
    }

    return <Modal isOpen={true} onClick={() => navigate(`/games/${params.gameId}/edit`)}>
        <div className="text-red-500">
            {action?.error}
        </div>
        <InputField
            name='characterInput'
            value={inputs.characterInput}
            onChange={e => handleChange(e.target.value)}
            display={`Enter Player Username`}
            type="text"
        />
        <form method="POST">
            <input
                type="hidden"
                name="method"
                value='add'
            />
            {
                fetcher?.data?.results?.length > 0 && (
                    <div className="flex flex-row">
                        <div>
                            {fetcher?.data?.results[0]?.username}
                        </div>
                        <select
                            name="characterSelect"
                            onChange={e => setInputs({
                                ...inputs,
                                characterSelect: e.target.value
                            })}
                            value={inputs.characterSelect}
                            className="w-32"
                        >
                            {fetcher?.data?.results[0]?.characters?.map((character: any) => (
                                <option key={character.id} value={character.id}>{character.name}</option>
                            ))}
                        </select>
                        {inputs.characterSelect}

                        {fetcher?.data?.results[0]?.characters?.length > 0 && (
                            <button
                                type="submit"
                            >
                                Add
                            </button>
                        )}
                    </div>
                )
            }
        </form>
        <form method="POST">
            <input
                type="hidden"
                name="method"
                value='delete'
            />
            {
                listItems.map(item => (
                    <div key={item.name} className="flex flex-row">
                        <div>
                            {item?.name} ({item?.owner?.username})
                        </div>
                        <button
                            type="submit"
                            name="_action"
                            value={item.id}
                        >
                            Remove
                        </button>
                    </div>
                ))
            }
        </form>
    </Modal>
}
