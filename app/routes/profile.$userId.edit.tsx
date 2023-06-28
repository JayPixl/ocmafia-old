import { AvatarColors, AvatarTypes } from "@prisma/client";
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { useState } from "react";
import { Modal } from "~/components/modal";
import SelectBox from "~/components/select-box";
import UserCircle from "~/components/user-circle";
import { gradientMap } from "~/utils/constants";
import { getProfileData, updateUserProfile } from "~/utils/profile.server";

export const loader: LoaderFunction = async ({ request, params }) => {
    const { user, owner, profileData } = await getProfileData(request, params)
    if (!owner) return redirect(`/profile/${params.userId}`)
    return json({ user, owner, profileData })
}

export const action: ActionFunction = async ({ request, params }) => {
    const form = await request.formData()
    const avatar = {
        avatarType: form.get('avatarType') as AvatarTypes || undefined,
        avatarColor: form.get('avatarColor') as AvatarColors || undefined,
        avatarUrl: form.get('avatarUrl') as string || undefined
    }
    const { error } = await updateUserProfile(request, avatar)

    if (error) return json({ error })
    return redirect(`/profile/${params.userId}`)
}

export default function Edit() {
    const { user, owner, profileData } = useLoaderData()
    const params = useParams()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        avatarType: user.avatar.avatarType,
        avatarColor: user.avatar.avatarColor,
        avatarUrl: user.avatar.avatarUrl
    })

    const getValuesFromMap: (map: { color: string, styles?: string }[]) => { name: string, value: string }[] = (map) => {
        let arr: { value: string, name: string }[] = []
        map.map(obj => {
            arr.push({ value: obj.color, name: `${obj.color[0] + obj.color.slice(1).toLowerCase()}` })
        })
        return arr
    }

    return <Modal isOpen={true} onClick={() => navigate(`/profile/${params.userId}`)} className="w-2/3 md:w-1/3 h-96">
        <form method="POST" className="flex flex-col items-center relative h-full">
            <span className="absolute top-0 right-2 cursor-pointer font-bold text-3xl p-1 hover:text-slate-500" onClick={() => navigate(`/profile/${params.userId}`)}>x</span>
            <UserCircle avatarType={formData.avatarType} avatarColor={formData.avatarColor} avatarUrl={formData.avatarUrl} username={user.username} size="LARGE" />
            <div className="font-semibold text-xl mb-3">{user.username}</div>
            <SelectBox name="avatarColor" value={formData.avatarColor} display="Avatar Color" onChange={e => setFormData({ ...formData, avatarColor: e.target.value })} options={[...getValuesFromMap(gradientMap)]} error={''} />
            <button
                className="absolute bottom-0 text-xl border-[1px] border-slate-600 text-slate-600 rounded-lg py-1 px-2 self-center mt-8 hover:bg-bittersweet hover:border-bittersweet hover:text-white transition md:text-2xl"
                type="submit"
            >
                Save Changes
            </button>
        </form>
    </Modal>
}