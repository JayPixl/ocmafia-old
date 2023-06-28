import { User } from "@prisma/client"
import UserCircle from "./user-circle"
import { Link } from "@remix-run/react"

interface props {
    user?: User | null
    triggerMobileNav: any
    navigation?: boolean
}

export default function Navbar({ user, triggerMobileNav, navigation }: props) {
    return (
        <div className="w-full h-12 bg-gradient-to-b from-slate-800 to-slate-900 flex justify-between items-center pr-5 text-white fixed top-0 z-20">

            <div>
                {navigation && <button className="md:hidden p-2 rounded-md ml-1 hover:bg-slate-700" onClick={triggerMobileNav}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                    </svg>
                </button>}
                <Link
                    to='/'
                    className={`bg-gradient-to-b from-bittersweet to-cinnabar bg-clip-text bg-clip-text-wbk text-transparent font-extrabold text-2xl ml-1 md:ml-5 ${!navigation && `ml-5`}`}
                >
                    OC Mafia
                </Link>
            </div>

            {user ? (
                <Link to={`/profile/${user?.slug}`} className="hover:bg-slate-800 h-full flex items-center">
                    <div className="flex flex-row justify-center items-center">
                        <div className="px-2 text-slate-200">
                            {user?.username}
                        </div>
                        <div className="px-2">
                            {user ? (
                                <UserCircle
                                    username={user.username}
                                    avatarType={user.avatar?.avatarType || undefined}
                                    avatarColor={user.avatar?.avatarColor || undefined}
                                    avatarUrl={user.avatar?.avatarUrl || undefined}
                                />
                            ) : ''}
                        </div>
                    </div>
                </Link>
            ) : (
                <Link to={`/login`} className="hover:bg-slate-800 h-full flex items-center">
                    <div className="flex flex-row justify-center items-center">
                        <div className="px-2 text-slate-200">
                            Log In | Sign Up
                        </div>
                    </div>
                </Link>
            )
            }
        </div>
    )
}