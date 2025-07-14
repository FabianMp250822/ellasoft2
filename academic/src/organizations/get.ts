import * as functions from "firebase-functions";
import type {CallableContext} from "firebase-functions/v1/https";
import * as admin from "firebase-admin";

export const getOrganizations = functions.https.onCall(
  async (data: unknown, context: CallableContext) => {
    // Check if the user is a superadmin.
    if (context.auth?.token.superadmin !== true) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Must be a super-administrator to list organizations."
      );
    }

    try {
      const orgsSnapshot = await admin
        .firestore()
        .collection("organizations")
        .get();

      return orgsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching organizations:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error fetching organizations."
      );
    }
  }
);
