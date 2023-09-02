import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import CharacterAvatar from "~/components/character-avatar";
import Layout from "~/components/layout";
import UserCircle from "~/components/user-circle";
import { getMessages, manageInbox } from "~/utils/inbox.server";
import { ExtendedInboxItem, UserWithMods } from "~/utils/types";
import { getUser } from "~/utils/users.server";

export const loader: LoaderFunction = async ({ request }) => {
    const { user } = await getUser(request)
    if (!user) return redirect(`/`)

    const { messages } = await getMessages(user.id)

    return json({ user, messages })
}

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData()
    const userId = form.get('userId') as string
    const id = form.get('id') as string
    const action = form.get('_action') as 'read' | 'unread' | 'delete'

    await manageInbox(userId, id, action)

    return null
}

export default function Inbox() {
    const loaderData = useLoaderData()
    const { user, messages }: { user?: UserWithMods, messages?: ExtendedInboxItem[] } = loaderData

    return (
        <Layout
            user={user}
            navigation={true}
        >
            <div className="flex justify-center items-center p-5">
                <div className="bg-licorice-600 sm:w-3/4 lg:py-12 m-5 rounded-lg w-full py-8 flex flex-col items-center">
                    <div className="font-bold text-3xl">
                        Inbox
                    </div>
                    {messages?.length !== 0 ? messages?.reverse()?.map((message, index) => <form
                        method="POST"
                        key={message.uniqueId}
                        className={`w-full flex flex-row items-center justify-between p-4 ${index % 2 ? 'bg-licorice-700' : ''} ${index !== messages.length - 1 ? 'border-b-2 border-b-licorice-800' : ''}`}
                    >
                        <Link
                            to={`/profile/${message.senderUsername.toLowerCase()}`}
                            className="flex flex-col border-r border-r-dogwood pr-3 mr-3 relative"
                        >
                            <UserCircle
                                avatarUrl={message.avatar?.avatarUrl || undefined}
                                avatarColor={message.avatar?.avatarColor}
                                avatarType={message.avatar?.avatarType}
                                username={message.senderUsername}
                                size="SMALL"
                            />
                            <div className="font-semibold text-lg">
                                {message.senderUsername}
                            </div>

                            {!message.read ? <>
                                <div className="absolute top-2 right-2 w-4 h-4 animate-ping rounded-full bg-tropicalindigo" />
                                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-tropicalindigo" />
                            </> : ''}
                        </Link>

                        <Link to={message.link || ''} className="italic w-full text-center">
                            {message.message}
                        </Link>

                        <div>
                            <button type="submit" name="_action" value='delete'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-bittersweet">
                                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                                </svg>
                            </button>

                            <input type="hidden" name="id" value={message.uniqueId} />
                            <input type="hidden" name="userId" value={user?.id} />

                            <button type="submit" name="_action" value={message.read ? 'unread' : 'read'}>
                                {message.read ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-tropicalindigo">
                                    <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
                                    <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                                </svg> : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-tropicalindigo">
                                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                                    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                                }
                            </button>
                        </div>
                    </form>) : <div>
                        No items in inbox!
                    </div>}
                </div>
            </div>
        </Layout>
    )
}