import type { LoaderArgs } from "@remix-run/node";
import { eventStream } from "remix-utils";

import { emitter } from "~/utils/events";

export const loader = ({ request, params }: LoaderArgs) => {

    return eventStream(request.signal, (send) => {
        const handler = (message: string) => {
            console.log(message)
            send({ data: Date.now().toString() });
        };

        emitter.on('update', handler);
        return () => {
            emitter.on('update', handler);
        };
    });
};