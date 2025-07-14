/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const getOrganizations = onCall(async (request) => {
  // Check if the user is a superadmin.
  if (request.auth?.token.superadmin !== true) {
    throw new HttpsError(
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
    throw new HttpsError(
      "internal",
      "Error fetching organizations."
    );
  }
});
