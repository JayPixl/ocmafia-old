import { LoaderFunction, json } from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import Layout from "~/components/layout";
import { getCharacterbyId } from "~/utils/characters.server";
import { getUser } from "~/utils/users.server";

export const loader: LoaderFunction = async ({ request, params }) => {
    const { user } = await getUser(request)

    const { error, character } = await getCharacterbyId(params.characterId || '')

    return json({ user, character, error })
}

export default function Character() {
    const { user, character, error } = useLoaderData()
    const params = useParams()
    return (
        <Layout
            user={user}
            navigation={true}
            navArray={[
                { name: "Grandmaster's Realm", id: "gm-realm", url: "/gm-realm" },
                { name: "Characters", id: "characters", url: "/gm-realm/characters", parent: "gm-realm" },
                (character && {
                    name: character.name,
                    id: character.name,
                    url: `/gm-realm/characters/${character.id}`
                })
            ]}
        >
            <div>
                {character ? (
                    <div>
                        <div>
                            {character.name}
                        </div>
                        <div>
                            {character.status}
                        </div>
                        <div>
                            {character.crowns} 👑
                        </div>
                        <div>
                            {character.strikes} ❌
                        </div>
                        <div>
                            <div>Description:</div>
                            <div>{character.description}</div>
                        </div>
                        {character?.ownerId === user.id && <div>
                            <Link to={`/gm-realm/characters/${params.characterId}/edit`}>
                                Edit
                            </Link>
                        </div>}
                    </div>

                ) : (
                    <div>
                        {error}
                    </div>
                )}
            </div>
        </Layout>
    )
}