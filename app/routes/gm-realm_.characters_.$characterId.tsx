import { LoaderFunction, json } from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import CharacterAvatar from "~/components/character-avatar";
import Layout from "~/components/layout";
import { getCharacterbyId } from "~/utils/characters.server";
import { getUser } from "~/utils/users.server";

export const loader: LoaderFunction = async ({ request, params }) => {
    const { user } = await getUser(request)

    const { error, character } = await getCharacterbyId(params.characterId || '')

    return json({ user, character, error })
}

export default function Character() {
    const { user, character, error } = useLoaderData<typeof loader>()
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
                        <div className="flex flex-row items-center">
                            <CharacterAvatar
                                avatarUrl={character.avatarUrl}
                                size="SMALL"
                            />
                            <div>{character.name}</div>
                        </div>
                        <div>
                            {character.status}
                        </div>
                        <div>
                            {character.pronouns}
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
                        <div>
                            <div>Special Ability: {character.specialAbility.name}</div>
                            <div>{character.specialAbility.description}</div>
                        </div>
                        <div>
                            <div>Stats:</div>
                            <div>Strength: {character.stats.strength}</div>
                            <div>Stealth: {character.stats.stealth}</div>
                            <div>Skill: {character.stats.skill}</div>
                            <div>Charisma: {character.stats.charisma}</div>
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