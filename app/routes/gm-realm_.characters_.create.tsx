import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Layout from "~/components/layout";
import { getUser } from "~/utils/users.server";

export const loader: LoaderFunction = async ({ request }) => {
    const { user } = await getUser(request)
    return json({ user })
}

export default function CreateCharacter() {
    const { user } = useLoaderData()
    return (
        <Layout
            user={user}
            navigation={true}
            navArray={[{ name: "Grandmaster's Realm", id: "gm-realm", url: "/gm-realm" }, { name: "Characters", id: "characters", url: "/gm-realm/characters", parent: "gm-realm" }]}
        >
            <div>
                Create new character
            </div>
        </Layout>
    )
}