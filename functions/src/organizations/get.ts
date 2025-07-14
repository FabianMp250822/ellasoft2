/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";


export const getOrganizations = onCall(async (request) => {
  // Check if user is authenticated and is a superadmin.
  if (!request.auth || !request.auth.token.superadmin) {
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

    const organizations = orgsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

     logger.info(`Successfully fetched ${organizations.length} organizations.`);
    return organizations;
  } catch (error) {
    logger.error("Error fetching organizations:", error);
    throw new HttpsError("internal", "Error fetching organizations.");
  }
});
