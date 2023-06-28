import { User } from "@prisma/client";
import { Outlet } from "@remix-run/react";
import React, { useState } from "react";
import Navbar from "./navbar";
import Navigation from "./navigation";
import { Nav } from "~/utils/navigation";

export default function Layout({ children, navigation = false, user, navArray }: { children: React.ReactNode, navigation?: boolean, user?: User, navArray?: Nav[] }) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false)
    const triggerMobileNav = () => {
        setMobileNavOpen(curr => !curr)
    }
    return (
        <>
            <Outlet />
            <div className="bg-gradient-to-b from-licorice-700 to-licorice-800 text-dogwood font-ysabeau-office w-full min-h-screen flex flex-col items-stretch">
                <Navbar user={user} triggerMobileNav={triggerMobileNav} navigation={navigation} />
                {navigation ? (
                    <>
                        <Navigation navOpen={mobileNavOpen} navArray={navArray} />
                        <div className="md:ml-48 mt-12 relative">
                            {children}
                        </div>
                    </>
                ) : (
                    <div className="mt-12">
                        {children}
                    </div>
                )}
            </div>
        </>
    )
}