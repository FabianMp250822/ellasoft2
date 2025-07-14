import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const db = admin.firestore();

/**
 * Sets the status of an organization.
 * Only accessible by superadmin users.
 */
export const setOrganizationStatus = onCall(async (request) => {
  // 1. Check if the user is a superadmin.
  if (request.auth?.token.superadmin !== true) {
    throw new HttpsError(
      "permission-denied",
      "Must be a super-administrator to change an organization's status."
    );
  }

  const {organizationId, status} = request.data;

  // 2. Validate input
  if (!organizationId || !status) {
    throw new HttpsError(
      "invalid-argument",
      "The function must be called with 'organizationId' and 'status' arguments."
    );
  }

  const validStatuses = ["Active", "Suspended", "In Arrears"];
  if (!validStatuses.includes(status)) {
    throw new HttpsError(
      "invalid-argument",
      `Invalid status. Must be one of: ${validStatuses.join(", ")}.`
    );
  }

  try {
    const orgRef = db.collection("organizations").doc(organizationId);
    await orgRef.update({status: status});

    const message = `Successfully updated organization ${organizationId} status to ${status}.`;
    logger.info(message);
    return {success: true, message: message};
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(
      `Error updating organization ${organizationId}:`,
      errorMessage
    );
    throw new HttpsError(
      "internal",
      `Failed to update organization status: ${errorMessage}`
    );
  }
});
