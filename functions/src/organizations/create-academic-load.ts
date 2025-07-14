/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const db = admin.firestore();

/**
 * Creates an academic load assignment.
 * Only accessible by authenticated users who are admins of the organization.
 */
export const createAcademicLoad = onCall(async (request) => {
  // 1. Check if user is authenticated and is an admin.
  if (!request.auth || !request.auth.token.admin) {
    throw new HttpsError("permission-denied", "The function must be called by an authenticated administrator.");
  }

  const {organizationId, teacherId, subjectId, gradeId, academicPeriodId} = request.data;
  const uid = request.auth.uid;
  const tokenOrgId = request.auth.token.organizationId;

  // 2. Validate input
  const requiredFields = ["organizationId", "teacherId", "subjectId", "gradeId", "academicPeriodId"];
  for (const field of requiredFields) {
    if (!request.data[field]) {
      throw new HttpsError("invalid-argument", `Missing required field: ${field}.`);
    }
  }

  // 3. Security Check: Ensure the user belongs to the organization.
  if (organizationId !== tokenOrgId) {
    logger.warn(`User ${uid} attempted to create a load for org ${organizationId} but belongs to ${tokenOrgId}.`);
    throw new HttpsError("permission-denied", "You can only create academic loads for your own organization.");
  }

  try {
    const loadData = {
      organizationId,
      teacherId,
      subjectId,
      gradeId,
      academicPeriodId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: uid,
    };

    const docRef = await db.collection("academicLoads").add(loadData);
    const successMessage = `Successfully created academic load assignment ${docRef.id}.`;
    logger.info(successMessage);

    return {success: true, message: successMessage, loadId: docRef.id};
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error creating academic load for organization ${organizationId}:`, error);
    throw new HttpsError("internal", `Failed to create assignment: ${errorMessage}`);
  }
});
