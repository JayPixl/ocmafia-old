import { Chatroom } from "@prisma/client";
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, Link } from '@remix-run/react'
import { useState } from "react";
import InputField from "~/components/input-field";
import Layout from "~/components/layout";
import { prisma } from "~/utils/prisma.server";
import { requireClearance } from "~/utils/users.server";

export const loader: LoaderFunction = async ({ request }) => {
    const { authorized, user, error } = await requireClearance(request, 'ADMIN')
    if (!authorized) return redirect('/')
    const rooms = await prisma.chatroom.findMany({ select: { id: true, name: true } })
    return json({ user, rooms })
}

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData()
    const chat = form.get("chat") as string || undefined
    if (!chat) return json({ error: "Invalid name" })

    const room = await prisma.chatroom.create({ data: { name: chat } })
    if (!room) return json({ error: "Could not create new chat room" })

    return json({ room })
}

export default function Chat() {
    const { user, rooms } = useLoaderData()
    const actionData = useActionData()
    const [inputs, setInputs] = useState({
        chat: ''
    })
    return <Layout
        navigation={true}
        user={user}
    >
        <div>{actionData?.error}</div>
        <form method="POST">
            <InputField
                name="chat"
                onChange={e => setInputs({ ...inputs, chat: e.target.value })}
                display="Add Chat Room"
                type="text"
                value={inputs.chat}
            />
            <button type="submit">Submit</button>
        </form>
        <div>{rooms?.map((room: Chatroom) => <Link to={`/chat/room/${room.id}`}>{room.name}</Link>)}</div>
    </Layout>
}