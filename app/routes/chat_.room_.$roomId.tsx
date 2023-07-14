import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { EVENTS } from "~/utils/events";

import { prisma } from "~/utils/prisma.server";
import { useLiveLoader } from "~/utils/use-live-loader";
import { getUser } from "~/utils/users.server";

export async function loader({ params, request }: LoaderArgs) {
  let messages = await prisma.message.findMany({ where: { roomId: params.roomId }, include: { sender: { select: { username: true } } } });
  console.log("Client Loaded!")
  return json({ messages });
}

export async function action({ request, params }: ActionArgs) {
  let formData = await request.formData();

  let message = formData.get("message") as string;

  const { user } = await getUser(request)
  if (!user) return json({ error: "Could not get logged in user" })

  const result = await prisma.message.create({ data: { content: message, sender: { connect: { id: user.id } }, room: { connect: { id: params.roomId } } } });
  if (!result) return json({ error: "Something went wrong..." })
  params.roomId && EVENTS.MESSAGE_UPDATE(params.roomId)
  return json({ result })
}

export default function Chat() {
  let loaderData = useLiveLoader<typeof loader>();
  let actionData = useActionData();

  return (
    <>
      <div>{actionData?.error}</div>
      <form method="post">
        <label htmlFor="message">Message</label>
        <input type="text" name="message" id="message" required />
        <button>Send</button>
      </form>

      <ul>
        {loaderData.messages.map((message) => {
          return <li key={message.id}>{message.sender.username} {message.content}</li>;
        })}
      </ul>
    </>
  );
}