import { auth } from "firebase-admin";
import { cookies } from "next/headers";
import { initAdmin } from "./firebase-admin";

initAdmin();

export async function getOrganizationIdFromSession(): Promise<string> {
    const sessionCookie = cookies().get("session")?.value || "";
    if (!sessionCookie) {
        throw new Error("User not authenticated");
    }
    
    const decodedClaims = await auth().verifySessionCookie(sessionCookie, true);
    if (!decodedClaims.organizationId) {
        throw new Error("Organization ID not found in claims");
    }

    return decodedClaims.organizationId;
}
