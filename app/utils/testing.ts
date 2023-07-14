// import { User } from "@prisma/client";
// import { ActionFunction, json, type LoaderFunction } from "@remix-run/node";
// import { Link, Outlet, useActionData, useLoaderData } from "@remix-run/react";
// import { useState } from "react";
// import Layout from "~/components/layout";
// import { Modal } from "~/components/modal";
// import Navbar from "~/components/navbar";
// import { getUser, requireClearance } from "~/utils/users.server";

// export const loader: LoaderFunction = async ({ request }) => {
//     let { user } = await getUser(request)
//     return json({ user })
// }

// export const action: ActionFunction = async ({ request }) => {
//     const form = await request.formData()
//     const action = form.get("_action")
//     switch (action) {
//         case "require": {
//             const { error, authorized, status } = await requireClearance(request, "ADMIN")
//             return json({ error, authorized }, { status })
//         }
//         default: {
//             console.log("returning null")
//             return null
//         }
//     }
// }

// export default function Testing() {
//     let { user } = useLoaderData()
//     const actionData = useActionData()

//     const [modalOpen, setModalOpen] = useState(false)

//     return (
//         <Layout user={user} navigation={true}>
//             <h1 className="text-red-500">OC Mafia Homepage</h1>
//             <Link to="/login">Log In / Sign Up</Link>

//             <Modal isOpen={modalOpen} className="w-2/3 h-2/3" onClick={() => setModalOpen(m => !m)}>
//                 <img src="https://www.rd.com/wp-content/uploads/2019/09/Cute-cat-lying-on-his-back-on-the-carpet.-Breed-British-mackerel-with-yellow-eyes-and-a-bushy-mustache.-Close-up-e1573490045672.jpg" />
//                 <div className="p-10 w-500">Test Modal Test Modal Test Modal Test Modal Test Modal Test Modal Test Modal</div>
//                 <div className="p-10">Test Modal</div>
//                 <div className="p-10">Test Modal</div>
//                 <div className="p-10">Test Modal</div>
//                 <div className="p-10">Test Modal</div>
//                 <div className="p-10">Test Modal</div>
//                 <div className="p-10">Test Modal</div>
//                 <div className="p-10">Test Modal</div>
//                 <div className="p-10">Test Modal</div>
//                 <div className="p-10">Test Modal</div>
//             </Modal>

//             {user?.id ? (
//                 <div>
//                     <div>
//                         {`Logged in as user id: ${user.id}`}
//                     </div>
//                     <Link to='/logout' className="text-blue-500">
//                         Log Out
//                     </Link>
//                 </div>
//             ) : ''}
//             <div>
//                 <button onClick={() => setModalOpen(m => !m)}>Open Modal</button>
//             </div>
//             <form method="POST">
//                 <button type="submit" name="_action" value="require">Require User Clearance</button>
//             </form>
//             <div className="text-purple-500">
//                 {JSON.stringify(actionData?.authorized || actionData?.error) || ''}
//             </div>
//         </Layout>
//     );
// }
