'use server'

import { signIn } from "@/auth";

export async function doSocialLogin(formData: any) {

    const action = formData.get('action');
    await signIn(action, {
        redirectTo: "/home",
    });
    console.log(action);


}

export async function doLogout() {


}