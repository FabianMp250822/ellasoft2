/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const db = admin.firestore();

/**
 * Gets all students for a given grade ID.
 * Only accessible by authenticated users who are members of the organization.
 */
export const getStudentsByGrade = onCall(async (request) => {
  // 1. Check if user is authenticated.
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const {gradeId} = request.data;
  const uid = request.auth.uid;
  const tokenOrgId = request.auth.token.organizationId;

  // 2. Validate input
  if (!gradeId) {
    throw new HttpsError("invalid-argument", "Missing required field: gradeId.");
  }

  try {
    // 3. Security Check: Verify that the grade belongs to the user's organization.
    const gradeRef = db.collection("grades").doc(gradeId);
    const gradeDoc = await gradeRef.get();

    if (!gradeDoc.exists) {
        throw new HttpsError("not-found", `Grade with ID ${gradeId} not found.`);
    }

    const gradeData = gradeDoc.data();
    if (gradeData?.organizationId !== tokenOrgId) {
        logger.warn(`User ${uid} from org ${tokenOrgId} attempted to access students from grade ${gradeId} which belongs to org ${gradeData?.organizationId}.`);
        throw new HttpsError("permission-denied", "You can only query students from your own organization's grades.");
    }

    // 4. Fetch students
    const studentsCol = db.collection("students");
    const q = studentsCol.where("gradeId", "==", gradeId);
    const snapshot = await q.get();

    const students = snapshot.docs.map((doc) => doc.data());

    logger.info(`Successfully fetched ${students.length} students for grade ${gradeId}`);

    return students;
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error fetching students for grade ${gradeId}:`, error);
    throw new HttpsError("internal", `Failed to fetch students: ${errorMessage}`);
  }
});
