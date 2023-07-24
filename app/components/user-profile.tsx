import { AvatarColors, AvatarTypes, Character, User } from "@prisma/client";
import UserCircle from "./user-circle";
import { useParams } from "@remix-run/react";
import { Link } from "react-router-dom";
import CharacterAvatar from "./character-avatar";

interface props {
    loggedIn: User | undefined
    owner: boolean
    profileData?: {
        username: string,
        avatar: {
            avatarType: AvatarTypes
            avatarColor?: AvatarColors
            avatarUrl?: string
        },
        crowns: number,
        rubies: number,
        characters: Character[]
    }
}

export default function UserProfile({ loggedIn, owner, profileData }: props) {
    const params = useParams()
    return (
        <div className="flex justify-center items-center">
            {profileData ? (
                <div className="flex flex-col items-center rounded-xl bg-gradient-to-br from-licorice-600 to-licorice-700 min-h-[35rem] p-5 m-5 w-full md:w-2/3 relative">
                    <div className="relative w-full flex flex-row justify-start items-end border-b-2 border-licorice-800 pb-1 md:p-2 overflow-clip">
                        {owner && (
                            <Link to={`/profile/${params.userId}/edit`} className="absolute right-0 top-0 text-sm md:text-xl">Edit Profile</Link>
                        )}
                        <UserCircle avatarType={profileData.avatar.avatarType} avatarColor={profileData.avatar.avatarColor} avatarUrl={profileData.avatar.avatarUrl} username={profileData.username} size="XLARGE" />
                        <div className="flex flex-col justify-between">
                            <div className={`${profileData.username.length > 10 ? "text-3xl" : 'text-4xl'} px-3 lg:text-5xl lg:px-8 font-semibold`}>
                                {profileData.username}
                            </div>
                            <div className="px-3 pt-1 lg:pt-3 lg:px-8 font-semibold">
                                {profileData.crowns} 👑 {profileData.rubies} 💎
                            </div>
                        </div>
                    </div>
                    <div className="w-full text-center p-3 text-2xl">Characters</div>
                    <div className="flex flex-row w-full justify-center items-center flex-wrap">
                        {profileData.characters?.length > 0 ? profileData.characters.map(character => (
                            <Link to={`/gm-realm/characters/${character.id}`} key={character.id}>
                                <div
                                    className="bg-licorice-600 h-28 w-52 rounded-md m-2 relative hover:opacity-80"
                                    style={character.gallery.length > 0 ? { backgroundImage: `url(${character.gallery[0]})` } : undefined}
                                >
                                    <div className="absolute top-1 right-1 flex flex-row text-sm">
                                        {character.crowns} 👑 {character.strikes} ❌
                                    </div>

                                    <div className="absolute bottom-1 left-1 flex flex-row justify-center items-end">
                                        <CharacterAvatar
                                            avatarUrl={character?.avatarUrl || undefined}
                                            size="SMALL"
                                        />
                                        <div className="ml-2 font-semibold">{character.displayName || character.name}</div>
                                    </div>
                                </div>
                            </Link>
                        )) : !owner && <div
                            className="bg-licorice-600 h-28 w-52 rounded-md m-2 relative flex justify-center items-center"
                        >
                            No characters yet!
                        </div>}
                        {owner && (
                            <Link to={`/gm-realm/characters/create`}>
                                <div
                                    className="bg-licorice-600 h-28 w-28 rounded-md m-2 relative flex justify-center items-center font-bold text-3xl hover:opacity-80"
                                >
                                    +
                                </div>
                            </Link>
                        )
                        }
                    </div>

                    {owner && <>
                        <div className="m-8 bg-inherit" />
                        <Link to='/logout' className="absolute bottom-3 text-xl border-[1px] border-bittersweet text-bittersweet rounded-lg py-1 px-2 self-center mt-8 hover:bg-bittersweet hover:border-bittersweet hover:text-white transition md:text-2xl">
                            Log Out
                        </Link>
                    </>}
                </div>
            ) : (
                <div className="p-8 font-bold text-4xl">This user does not exist!</div>
            )}
        </div>
    )
}