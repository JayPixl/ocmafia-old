import { Alignment, Role } from "@prisma/client";
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { Link, useActionData, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import InputField from "~/components/input-field";
import Layout from "~/components/layout";
import Textarea from "~/components/textarea";
import { prisma } from "~/utils/prisma.server";
import { manageRoles } from "~/utils/roles.server";
import { requireClearance } from "~/utils/users.server";

export const loader: LoaderFunction = async ({ request, params }) => {
    const { user, authorized } = await requireClearance(request, "ADMIN")
    if (!authorized || !user) return redirect('/authenticate-admin')

    const role = await prisma.role.findUnique({
        where: {
            id: params.roleId!
        }
    })

    return json({ user, role })
}

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData()
    const name = form.get("name")
    const description = form.get("description")
    const alignment = form.get('alignment') as Alignment
    const id = form.get('_action') as string

    if (typeof name !== 'string' || typeof description !== 'string') return json({ error: "Invalid form data" }, { status: 500 })

    let errors = {
        name: name.length > 20 && 'Name of role cannot be longer than 20 characters',
        description: description.length > 200 && 'Name of description cannot be longer than 200 characters'
    }

    if (Object.values(errors).some(Boolean)) {
        return json({ errors, fields: { name, description, alignment } }, { status: 404 })
    }

    const { newRole, error } = await manageRoles({ name, description, alignment, id }, 'edit')
    if (error) return json({ error, fields: { name, description, alignment } })

    return json({ newRole })
}

export default function EditRole() {
    const { user, role } = useLoaderData()
    const action = useActionData()

    const [inputs, setInputs] = useState({
        name: action?.fields?.name || role.name || '',
        description: action?.fields?.description || role.description || '',
        alignment: (action?.fields?.alignment || role.alignment || 'TOWN') as Alignment
    })
    return <Layout user={user} navigation={true}>
        <div className="p-5 w-full flex flex-col items-center">
            <h1 className="text-2xl p-3">Edit Role</h1>
            <div className="p-2 text-lg">
                <Link to={'/admin'}>Back to Admin Home</Link>
            </div>
            <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-licorice-600 w-2/3">
                <form method="POST" className="flex flex-col py-3">
                    <div className="text-bittersweet">
                        {action?.error}
                    </div>

                    <InputField
                        name="name"
                        type="text"
                        onChange={e => setInputs({ ...inputs, name: e.target.value })}
                        display="Role Name"
                        error={action?.errors?.name}
                        value={inputs.name}
                    />

                    <Textarea
                        name="description"
                        onChange={e => setInputs({ ...inputs, description: e.target.value })}
                        display="Role Description"
                        error={action?.errors?.description}
                        value={inputs.description}
                    />
                    <div className="bg-dogwood rounded-lg text-licorice-800 p-3 my-3">
                        <div className="text-xl">Alignment</div>
                        <select
                            name="alignment"
                            value={inputs.alignment}
                            onChange={e => setInputs({
                                ...inputs,
                                alignment: e.target.value as Alignment
                            })}
                            className="bg-opacity-[1%] bg-licorice-600 font-bold text-lg rounded-lg py-1 hover:opacity-80"
                        >
                            {Object.values(Alignment).map(alignment => <option key={alignment} value={alignment}>
                                {alignment}
                            </option>)}
                        </select>
                    </div>

                    <button
                        type="submit"
                        name="_action"
                        value={role.id}
                        className="underline hover:no-underlinetext-xl"
                    >
                        Save
                    </button>
                </form>
            </div>
        </div>
    </Layout>
}