/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const db = admin.firestore();

/**
 * Creates an academic period for an organization.
 * Only accessible by authenticated users who are members of the organization.
 */
export const createAcademicPeriod = onCall(async (request) => {
  // 1. Check if user is authenticated.
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const {organizationId, name, startDate, endDate} = request.data;
  const uid = request.auth.uid;
  const tokenOrgId = request.auth.token.organizationId;

  // 2. Validate input
  if (!organizationId || !name || !startDate || !endDate) {
    throw new HttpsError("invalid-argument", "The function must be called with 'organizationId', 'name', 'startDate', and 'endDate' arguments.");
  }

  // 3. Security Check: Ensure the user belongs to the organization they're trying to modify.
  if (organizationId !== tokenOrgId) {
    logger.warn(`User ${uid} attempted to create a period for org ${organizationId} but belongs to ${tokenOrgId}.`);
    throw new HttpsError("permission-denied", "You can only create academic periods for your own organization.");
  }


  try {
    const periodData = {
      organizationId,
      name,
      startDate: new Date(startDate), // Firestore can handle date strings, but Date objects are more robust
      endDate: new Date(endDate),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("academicPeriods").add(periodData);

    const successMessage = `Successfully created academic period '${name}' with ID ${docRef.id} for organization ${organizationId}.`;
    logger.info(successMessage);

    // The onCall function should return a JSON-serializable object.
    return {success: true, message: successMessage, periodId: docRef.id};
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error creating academic period for organization ${organizationId}:`, error);
    // Re-throw as an HttpsError to ensure the client gets a proper error response.
    throw new HttpsError("internal", `Failed to create academic period: ${errorMessage}`);
  }
});
