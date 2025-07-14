/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const db = admin.firestore();

/**
 * Saves a set of generated performance indicators to Firestore.
 * Only accessible by authenticated users who are members of the organization.
 */
export const savePerformanceIndicators = onCall(async (request) => {
  // 1. Check if user is authenticated.
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const {organizationId, subjectId, gradeId, indicators} = request.data;
  const uid = request.auth.uid;
  const tokenOrgId = request.auth.token.organizationId;

  // 2. Validate input
  if (!organizationId || !subjectId || !gradeId || !indicators) {
    throw new HttpsError("invalid-argument", "Missing required fields: organizationId, subjectId, gradeId, or indicators.");
  }

  // 3. Security Check: Ensure the user belongs to the organization they're writing to.
  if (organizationId !== tokenOrgId) {
    logger.warn(`User ${uid} attempted to save indicators for org ${organizationId} but belongs to ${tokenOrgId}.`);
    throw new HttpsError("permission-denied", "You can only save indicators for your own organization.");
  }

  try {
    const indicatorData = {
      organizationId,
      subjectId,
      gradeId,
      indicators,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: uid,
    };

    const docRef = await db.collection("performanceIndicators").add(indicatorData);

    const successMessage = `Successfully saved indicators with ID ${docRef.id} for organization ${organizationId}.`;
    logger.info(successMessage);

    return {success: true, message: successMessage, indicatorId: docRef.id};
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error saving performance indicators for organization ${organizationId}:`, error);
    throw new HttpsError("internal", `Failed to save indicators: ${errorMessage}`);
  }
});
