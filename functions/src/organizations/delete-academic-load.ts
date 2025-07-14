/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const db = admin.firestore();

/**
 * Deletes an academic load assignment.
 * Only accessible by authenticated users who are admins of the organization.
 */
export const deleteAcademicLoad = onCall(async (request) => {
  // 1. Check if user is authenticated and is an admin.
  if (!request.auth || !request.auth.token.admin) {
    throw new HttpsError("permission-denied", "The function must be called by an authenticated administrator.");
  }

  const {id} = request.data;
  const uid = request.auth.uid;
  const tokenOrgId = request.auth.token.organizationId;

  // 2. Validate input
  if (!id) {
    throw new HttpsError("invalid-argument", "Missing required field: id.");
  }

  try {
    const docRef = db.collection("academicLoads").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new HttpsError("not-found", "Assignment not found.");
    }

    const docData = doc.data();
    // 3. Security Check: Ensure the user belongs to the organization of the document.
    if (docData?.organizationId !== tokenOrgId) {
        logger.warn(`User ${uid} attempted to delete load ${id} from org ${docData?.organizationId} but belongs to ${tokenOrgId}.`);
        throw new HttpsError("permission-denied", "You can only delete assignments for your own organization.");
    }

    await docRef.delete();

    const successMessage = `Successfully deleted academic load assignment ${id}.`;
    logger.info(successMessage);

    return {success: true, message: successMessage};
  } catch (error) {
    if (error instanceof HttpsError) {
        throw error;
    }
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error deleting academic load ${id}:`, error);
    throw new HttpsError("internal", `Failed to delete assignment: ${errorMessage}`);
  }
});
