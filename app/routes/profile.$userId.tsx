import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import Layout from "~/components/layout";
import Navbar from "~/components/navbar";
import UserProfile from "~/components/user-profile";
import { getProfileData } from "~/utils/profile.server";

export const loader: LoaderFunction = async ({ request, params }) => {
    const { user, owner, profileData } = await getProfileData(request, params)
    return json({ user, owner, profileData })
}

export default function Profile() {
    const { user, owner, profileData } = useLoaderData()

    return <Layout user={user} navigation={true}>
        <UserProfile loggedIn={user} owner={owner} profileData={profileData} />
    </Layout>
}