/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

export const getOrganizations = onCall(async (request) => {
  // 1. Check if user is authenticated
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated to call this function.");
  }

  try {
    // 2. Get the user's most up-to-date claims directly from Firebase Auth to ensure freshness
    const userRecord = await admin.auth().getUser(request.auth.uid);
    const claims = userRecord.customClaims || {};

    // 3. Verify the user is a superadmin using the fresh claims
    if (!claims.superadmin) {
      throw new HttpsError(
        "permission-denied",
        "Must be a super-administrator to list organizations."
      );
    }

    // 4. Fetch organization data from Firestore
    const orgsSnapshot = await admin
      .firestore()
      .collection("organizations")
      .get();
      
    const organizations = orgsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    logger.info(`Superadmin ${request.auth.uid} successfully fetched ${organizations.length} organizations.`);
    return organizations;

  } catch (error) {
    logger.error("Error fetching organizations:", error);
    // Avoid leaking internal error details to the client
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "An internal error occurred while fetching organizations.");
  }
});
