/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import {verifyTeacherAndLoad} from "./utils";

const db = admin.firestore();

/**
 * Creates or updates a single grade for a student in a specific activity.
 * It finds the grade document by a composite key of studentId and activityId.
 * Only accessible by authenticated teachers for a load they are assigned to.
 */
export const createOrUpdateStudentGrade = onCall(async (request) => {
  if (!request.auth || !request.auth.token.teacher) {
    throw new HttpsError("permission-denied", "The function must be called by an authenticated teacher.");
  }

  const {
    loadId,
    activityId,
    studentId,
    score,
  } = request.data;
  const teacherId = request.auth.uid;

  if (!loadId || !activityId || !studentId || score === undefined) {
    throw new HttpsError("invalid-argument", "Missing required fields: loadId, activityId, studentId, or score.");
  }

  if (typeof score !== "number" || score < 0) {
    throw new HttpsError("invalid-argument", "Score must be a non-negative number.");
  }


  try {
    // Security check: Verify the teacher is assigned to this academic load.
    await verifyTeacherAndLoad(teacherId, loadId);

    const gradesCollection = db.collection("studentGrades");
    const q = gradesCollection
      .where("studentId", "==", studentId)
      .where("activityId", "==", activityId)
      .limit(1);

    const snapshot = await q.get();

    if (snapshot.empty) {
      // Create new grade
      await gradesCollection.add({
        studentId,
        activityId,
        loadId,
        score,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: teacherId,
      });
      logger.info(`Teacher ${teacherId} created grade for student ${studentId} in activity ${activityId}.`);
    } else {
      // Update existing grade
      const docId = snapshot.docs[0].id;
      await gradesCollection.doc(docId).update({
        score,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: teacherId,
      });
      logger.info(`Teacher ${teacherId} updated grade for student ${studentId} in activity ${activityId}.`);
    }

    return {success: true, message: "Grade saved successfully."};
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error in createOrUpdateStudentGrade for load ${loadId}:`, error);
    throw new HttpsError("internal", `Failed to save grade: ${errorMessage}`);
  }
});

