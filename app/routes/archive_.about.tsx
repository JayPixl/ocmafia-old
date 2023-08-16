import { LoaderFunction, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import Layout from "~/components/layout";
import { getUser } from "~/utils/users.server";

export const loader: LoaderFunction = async ({ request }) => {
    const { user } = await getUser(request)
    return json({ user })
}

export default function About() {
    const { user } = useLoaderData()
    return (
        <Layout
            user={user}
            navigation={true}
            navArray={[{ name: "Archive", id: "archive", url: "/archive" },
            { name: "About", id: "about", url: "/archive/about", parent: 'archive' }]}
        >
            <div className="flex justify-center items-center">
                <div className="bg-licorice-600 md:w-2/3 lg:p-12 m-5 rounded-lg w-full p-8 flex flex-col items-center">
                    <div className="text-4xl font-bold my-8">About</div>
                    <div>
                        <div className="italic">
                            &nbsp; &nbsp; &nbsp; Greetings, traveller. It seems that you have entered my domain.
                            Who am I, you ask? I am an entity known only as the Grandmaster,
                            but you may refer to me as G or GM. Do you have what it takes to win my Game?
                            We&apos;ll have to wait and see now, won&apos;t we?
                            <br />
                            <div className="text-right pr-8">-the Grandmaster</div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}