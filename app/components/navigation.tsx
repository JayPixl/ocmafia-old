
import { Nav } from "~/utils/navigation";
import Navlink from "./navlink";
import React from "react";
import { Portal } from "./portal";

type Component = React.FunctionComponentElement<{
    children?: React.ReactNode;
    slug: string;
    display: string;
    current?: boolean | undefined;
    size?: string | undefined;
}>

export default function Navigation({ navOpen, navArray }: { navOpen: boolean, navArray?: Nav[] }) {

    const buildNav: (...args: any) => Component = () => {
        if (!navArray) return <></>
        let currChild: Component = React.createElement(Navlink, { slug: navArray[navArray.length - 1].url, display: navArray[navArray.length - 1].name, current: true, size: navArray.length === 1 ? 'XL' : 'LG' })
        let builtNav: Component = currChild
        for (let i: number = navArray.length - 2; i >= 0; i--) {
            builtNav = React.createElement(Navlink, { slug: navArray[i].url, display: navArray[i].name, size: i === 0 ? 'XL' : 'LG' }, currChild)
            currChild = builtNav
        }
        return builtNav
    }
    return (
        <>
            <div className="hidden md:block h-full w-48 overflow-x-hidden fixed top-12 bg-gradient-to-b from-licorice-800 to-licorice-900 text-dogwood p-4">
                {navArray && navArray[0].id === 'archive' ? buildNav() : (
                    <Navlink slug='/archive' display="Archive" size='XL' />
                )}

                {navArray && navArray[0].id === 'games' ? buildNav() : (
                    <Navlink slug='/games' display="Games" size='XL' />
                )}

                {navArray && navArray[0].id === 'gm-realm' ? buildNav() : (
                    <Navlink slug='/gm-realm' display="Grandmaster's Realm" size="XL" />
                )}
            </div>
            {navOpen && (
                <div className="block md:hidden w-full p-5 bg-slate-300 fixed top-12 z-10 text-slate-800">
                    {navArray && navArray[0].id === 'archive' ? buildNav() : (
                        <Navlink slug='/archive' display="Archive" size='XL' />
                    )}

                    {navArray && navArray[0].id === 'games' ? buildNav() : (
                        <Navlink slug='/games' display="Games" size='XL' />
                    )}

                    {navArray && navArray[0].id === 'gm-realm' ? buildNav() : (
                        <Navlink slug='/gm-realm' display="Grandmaster's Realm" size="XL" />
                    )}
                </div>
            )}
        </>
    )
}