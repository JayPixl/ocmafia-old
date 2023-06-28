import { AvatarColors, AvatarTypes, User } from "@prisma/client";
import UserCircle from "./user-circle";
import { useParams } from "@remix-run/react";
import { Link } from "react-router-dom";

interface props {
    loggedIn: User | undefined
    owner: boolean
    profileData?: {
        username: string,
        avatar: {
            avatarType: AvatarTypes
            avatarColor?: AvatarColors
            avatarUrl?: string
        }
    }
}

export default function UserProfile({ loggedIn, owner, profileData }: props) {
    const params = useParams()
    return (
        <div className="flex justify-center items-center">
            {profileData ? (
                <div className="flex flex-col items-center rounded-xl bg-gradient-to-br from-licorice-600 to-licorice-700 h-96 p-5 m-5 w-full md:w-2/3 relative">
                    <div className="relative w-full flex flex-row justify-start items-end border-b-2 border-licorice-800 pb-1 md:p-2 overflow-clip">
                        {owner && (
                            <Link to={`/profile/${params.userId}/edit`} className="absolute right-0 top-0 text-sm md:text-xl">Edit Profile</Link>
                        )}
                        <UserCircle avatarType={profileData.avatar.avatarType} avatarColor={profileData.avatar.avatarColor} avatarUrl={profileData.avatar.avatarUrl} username={profileData.username} size="XLARGE" />
                        <div className={`${profileData.username.length > 10 ? "text-3xl" : 'text-4xl'} px-3 lg:text-5xl lg:px-8 font-semibold`}>
                            {profileData.username}
                        </div>
                    </div>
                    {owner && <Link to='/logout' className="absolute bottom-3 text-xl border-[1px] border-bittersweet text-bittersweet rounded-lg py-1 px-2 self-center mt-8 hover:bg-bittersweet hover:border-bittersweet hover:text-white transition md:text-2xl">
                        Log Out
                    </Link>}
                </div>
            ) : (
                <div className="p-8 font-bold text-4xl">This user does not exist!</div>
            )}
        </div>
    )
}