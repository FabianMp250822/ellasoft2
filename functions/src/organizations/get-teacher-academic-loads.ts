/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const db = admin.firestore();

/**
 * Gets all academic load assignments for the calling teacher.
 * Only accessible by authenticated users who are teachers.
 */
export const getTeacherAcademicLoads = onCall(async (request) => {
  // 1. Check if user is authenticated and is a teacher.
  if (!request.auth || !request.auth.token.teacher) {
    throw new HttpsError("permission-denied", "The function must be called by an authenticated teacher.");
  }

  const teacherId = request.auth.uid;
  const organizationId = request.auth.token.organizationId;

  // 2. Security check (belt and suspenders)
  if (!organizationId) {
    throw new HttpsError("permission-denied", "Teacher is not associated with an organization.");
  }

  try {
    const loadsCol = db.collection("academicLoads");
    // Secure query using the authenticated user's ID and organization
    const q = loadsCol
      .where("organizationId", "==", organizationId)
      .where("teacherId", "==", teacherId);

    const snapshot = await q.get();

    const loads = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    logger.info(`Successfully fetched ${loads.length} academic load assignments for teacher ${teacherId}`);

    return loads;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error fetching academic loads for teacher ${teacherId}:`, error);
    throw new HttpsError("internal", `Failed to fetch assignments: ${errorMessage}`);
  }
});
