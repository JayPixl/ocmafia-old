import { User } from "@prisma/client";
import { ActionFunction, json, type LoaderFunction } from "@remix-run/node";
import { Link, Links, LiveReload, Meta, Scripts, ScrollRestoration, useLoaderData, useRouteError } from "@remix-run/react";
import { useState } from "react";
import { Modal } from "~/components/modal";
import Layout from "~/components/layout";
import { getUser } from "~/utils/users.server";
import { buildNavigation } from "~/utils/navigation";
import { V2_ErrorBoundaryComponent } from "@remix-run/react/dist/routeModules";

export const loader: LoaderFunction = async ({ request }) => {
  const { user } = await getUser(request)
  const navArray = buildNavigation([{ name: 'Games', id: 'games', url: '/games' }, { name: 'Season 1', id: 'fjijeiojf2098fhosidfj', url: '/games/slkdfjlskdfjslkdfj', parent: 'games' }])
  return json({ user, navArray })
}


export default function Index() {
  const { user, navArray } = useLoaderData()

  const [modalOpen, setModalOpen] = useState(false)

  return (
    <Layout user={user} navigation={true}>
      <div
        style={{ backgroundImage: "url('/images/mafia-by-k1tty.png')" }}
        className="bg-cover bg-center w-full h-[30rem]"
      >
        <div className="h-full w-full backdrop-blur-sm backdrop-brightness-50 flex flex-col p-5 justify-center items-center text-center">
          <div className="font-bold text-5xl p-5">
            Welcome to OC Mafia!
          </div>
          <Link to={'/login'}>
            <div className="text-3xl border-[3px] text-white hover:border-dogwood rounded-xl py-2 px-3 self-center mt-8 hover:bg-none bg-gradient-to-b from-bittersweet to-cinnabar border-bittersweet hover:text-dogwood transition md:text-2xl">
              Get Started
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
