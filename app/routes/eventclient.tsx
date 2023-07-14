import { User } from "@prisma/client";
import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { EVENTS } from "~/utils/events";
import { prisma } from "~/utils/prisma.server";
import { useLiveLoader } from "~/utils/use-live-loader";

export const loader: LoaderFunction = async ({ request }) => {
    const users = await prisma.user.findMany({
        select: {
            username: true
        }
    })
    console.log("Refreshing")
    return json({ users })
}

export const action: ActionFunction = async ({ request }) => {
    EVENTS.TEST_UPDATE()
    return null
}

export default function Eventclient() {
    const { users } = useLiveLoader<typeof loader>()
    return <div>
        {users.map((user: any) => <div key={user.username}>{user.username}</div>)}
        <form method="POST">
            <button type="submit">Push me!</button>
        </form>
    </div>
}