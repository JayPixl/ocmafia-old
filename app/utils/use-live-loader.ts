import { useLoaderData, useLocation, useRevalidator } from "@remix-run/react";
import { useEffect } from "react";
import { useEventSource } from "remix-utils";

export function useLiveLoader<T>() {
    const eventName = useLocation().pathname;
    const data = useEventSource(`/eventsubscribe`);

    console.log(`Getting Data from: /eventsubscribe`)

    const { revalidate } = useRevalidator();

    useEffect(() => {
        revalidate();
    }, [data, revalidate]);

    return useLoaderData<T>();
}

// export function useLiveLoader<T>() {
//     const eventName = useLocation().pathname;
//     const data = useEventSource(`/events${eventName}`, { event: 'newMessage' });

//     console.log(`Getting Data from: /events${eventName}`)

//     const { revalidate } = useRevalidator();

//     useEffect(() => {
//         revalidate();
//         console.log("Refreshed!")
//         console.log(`Data Received: ${data}`)
//     }, [data, revalidate]);

//     return useLoaderData<T>();
// }