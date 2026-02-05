import { auth } from "./firebase";

export async function getIdTokenClaims(): Promise<Record<string, unknown> | null> {
    const user = auth.currentUser;
    if (!user) return null;
    const res = await user.getIdTokenResult();
    return res.claims ?? null;
}
``