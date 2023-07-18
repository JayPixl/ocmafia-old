import { LoaderFunction, json } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import InputField from "~/components/input-field";
import { useState } from 'react'
import Layout from "~/components/layout";
import { getUser } from "~/utils/users.server";
import CharacterAvatar from "~/components/character-avatar";
import { prisma } from "~/utils/prisma.server";

export const loader: LoaderFunction = async ({ request }) => {
    const { user } = await getUser(request)
    const recentGames = await prisma.game.findMany({
        select: {
            id: true,
            name: true,
            participatingCharacters: {
                select: {
                    _count: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 3
    })
    return json({ user, recentGames })
}

export default function Games() {
    const { user, recentGames } = useLoaderData<typeof loader>()
    const fetcher = useFetcher()
    const [inputs, setInputs] = useState({
        search: ''
    })

    const handleChange: (input: string) => void = (input) => {
        setInputs({
            ...inputs,
            search: input
        })
        const queryParams = new URLSearchParams
        queryParams.set('name', input)
        fetcher.load(`/fetch/games?${queryParams}`)
    }

    return (
        <Layout
            user={user}
            navigation={true}
            navArray={[{ name: "Games", id: "games", url: "/games" }]}
        >
            <div className="p-8 flex flex-col items-center w-full">
                <div className="text-center text-4xl font-semibold">Games</div>
                <input
                    className="max-w-[30rem] w-[20rem] px-3 py-2 text-xl text-licorice-800 m-5 rounded-full"
                    type="search"
                    onChange={e => handleChange(e.target.value)}
                    placeholder="Search for Games..."
                    value={inputs.search}
                />
                <div className="w-full flex flex-col justify-start items-start bg-licorice-600 rounded-xl">
                    {inputs.search.length > 0 ? (fetcher?.data?.results?.length > 0 ? <>
                        <div className="p-5 text-lg font-semibold">Results:</div>
                        {fetcher?.data?.results?.map((game: any) => <Link to={`/games/${game.id}`} className="flex flex-row justify-center items-center w-full p-5" key={game.id}>
                            <div className="font-semibold text-lg">{game.name}</div>
                            <div>{game.participatingCharacters._count || "0"} active players</div>
                        </Link>)}
                    </> : (fetcher.state === 'loading' ? <>
                        <div className="h-8 w-8 border-transparent border-t-licorice-900 border-4 animate-spin rounded-full" />
                    </> : <>
                        <div className="p-5 text-2xl font-semibold">No Results!</div>
                    </>)) : ''}
                    <div className="w-full flex flex-col justify-start items-center bg-licorice-600 rounded-xl">
                        <div className="p-5 text-2xl font-semibold">Recent Games:</div>
                        {recentGames.map((game: any) => <Link to={`/games/${game.id}`} className="flex flex-row justify-center items-center w-full p-5" key={game.id}>
                            <div className="font-semibold text-2xl">{game.name}</div>
                            <div className="text-lg mx-3">{game.participatingCharacters._count || "0"} active players</div>
                        </Link>)}
                    </div>
                </div>

            </div>
        </Layout>
    )
}