/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const db = admin.firestore();

/**
 * Gets all academic load assignments for a given organization.
 * Only accessible by authenticated users who are members of the organization.
 */
export const getAcademicLoads = onCall(async (request) => {
  // 1. Check if user is authenticated.
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const {organizationId} = request.data;
  const uid = request.auth.uid;
  const tokenOrgId = request.auth.token.organizationId;

  // 2. Validate input
  if (!organizationId) {
    throw new HttpsError("invalid-argument", "Missing required field: organizationId.");
  }

  // 3. Security Check
  if (organizationId !== tokenOrgId) {
    logger.warn(`User ${uid} attempted to get loads for org ${organizationId} but belongs to ${tokenOrgId}.`);
    throw new HttpsError("permission-denied", "You can only query assignments for your own organization.");
  }

  try {
    const loadsCol = db.collection("academicLoads");
    const q = loadsCol.where("organizationId", "==", organizationId);
    const snapshot = await q.get();

    const loads = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    logger.info(`Successfully fetched ${loads.length} academic load assignments for org ${organizationId}`);

    return loads;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error fetching academic loads for organization ${organizationId}:`, error);
    throw new HttpsError("internal", `Failed to fetch assignments: ${errorMessage}`);
  }
});
