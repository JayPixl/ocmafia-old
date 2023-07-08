import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Layout from "~/components/layout";
import { getUser } from "~/utils/users.server";

export const loader: LoaderFunction = async ({ request }) => {
    const { user } = await getUser(request)
    return json({ user })
}

export default function Archive() {
    const { user } = useLoaderData()
    return (
        <Layout
            user={user}
            navigation={true}
            navArray={[{ name: "Archive", id: "archive", url: "/archive" }]}
        >
            <div>
                Archive
            </div>
        </Layout>
    )
}