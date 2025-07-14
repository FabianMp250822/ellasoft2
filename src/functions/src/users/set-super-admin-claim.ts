/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

/**
 * Sets the 'superadmin' custom claim for a specific user.
 * **Security:** This function is now callable and should be protected.
 * It now requires that the caller is already a superadmin.
 */
export const setSuperAdminClaim = onCall(async (request) => {
  // 1. Check if the caller is authenticated and is a superadmin.
  if (request.auth?.token.superadmin !== true) {
    throw new HttpsError(
      "permission-denied",
      "Must be a super-administrator to perform this action."
    );
  }

  const { email, uid } = request.data;

  if (!uid || !email) {
    throw new HttpsError("invalid-argument", "The function must be called with 'uid' and 'email' arguments.");
  }

  try {
    await admin.auth().setCustomUserClaims(uid, { superadmin: true });
    const message = `Successfully set superadmin claim for user: ${email} (UID: ${uid})`;
    logger.info(message);
    return { success: true, message };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error setting superadmin claim for user: ${uid}`, errorMessage);
    throw new HttpsError("internal", `Failed to set claim: ${errorMessage}`);
  }
});

    