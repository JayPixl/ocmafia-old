import type { LoaderArgs } from "@remix-run/node";
import { eventStream } from "remix-utils";

import { emitter } from "~/utils/events";

export const loader = ({ request, params }: LoaderArgs) => {
    const path = `/${params["*"]}`;
    console.log(`Splat Events Path: ${path}`)

    return eventStream(request.signal, (send) => {
        const handler = (message: string) => {
            console.log(message)
            send({ event: "newMessage", data: Date.now().toString() });
        };

        emitter.on(path, handler);
        return () => {
            emitter.on(path, handler);
        };
    });
};