/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";


export const getOrganizations = onCall(async (request) => {
  // 1. Check if user is authenticated at all.
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  try {
    // 2. Get the user's latest claims directly from Firebase Auth. This is the most secure way.
    const userRecord = await admin.auth().getUser(request.auth.uid);
    const claims = userRecord.customClaims || {};

    // 3. Check if the user has the superadmin claim.
    if (claims.superadmin !== true) {
      logger.warn(
        `Permission denied for user ${request.auth.uid}. Lacks superadmin claim.`
      );
      throw new HttpsError(
        "permission-denied",
        "Must be a super-administrator to list organizations."
      );
    }

    // 4. If they are a superadmin, proceed to fetch organizations.
    const orgsSnapshot = await admin
      .firestore()
      .collection("organizations")
      .get();

    const organizations = orgsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    logger.info(`Successfully fetched ${organizations.length} organizations for superadmin.`);
    return organizations;
  } catch (error) {
     if (error instanceof HttpsError) {
      throw error; // Re-throw HttpsError directly
    }
    logger.error("Error fetching organizations:", error);
    throw new HttpsError("internal", "An internal error occurred while fetching organizations.");
  }
});
