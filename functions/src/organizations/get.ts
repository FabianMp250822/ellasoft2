/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

/**
 * Lists all organizations. Only accessible by superadmin users.
 */
export const getOrganizations = onCall(async (request) => {
  // Check if user is authenticated
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  try {
    // Get the user's current custom claims directly from Firebase Auth
    const userRecord = await admin.auth().getUser(request.auth.uid);
    const claims = userRecord.customClaims || {};

    // Log for debugging
    logger.info(
      `User ${request.auth.uid} (${userRecord.email}) checking for superadmin claim.`,
      claims
    );

    // Check if user is superadmin using the fresh claims
    if (!claims.superadmin) {
      throw new HttpsError(
        "permission-denied",
        "Must be a super-administrator to list organizations."
      );
    }

    const organizationsRef = admin.firestore().collection("organizations");
    const snapshot = await organizationsRef.get();

    const organizations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    logger.info(
      `Successfully fetched ${organizations.length} organizations for ` +
      `superadmin: ${userRecord.email}`
    );

    return organizations;
  } catch (error) {
    logger.error("Error fetching organizations:", error);
    if (error instanceof HttpsError) {
        throw error;
    }
    throw new HttpsError("internal", "Error fetching organizations");
  }
});
