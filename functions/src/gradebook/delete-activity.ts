/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import {verifyTeacherAndLoad} from "./utils";

const db = admin.firestore();

/**
 * Deletes an activity and all associated student grades.
 * Only accessible by authenticated teachers for a load they are assigned to.
 */
export const deleteActivity = onCall(async (request) => {
  if (!request.auth || !request.auth.token.teacher) {
    throw new HttpsError("permission-denied", "The function must be called by an authenticated teacher.");
  }

  const {loadId, activityId} = request.data;
  const teacherId = request.auth.uid;

  if (!loadId || !activityId) {
    throw new HttpsError("invalid-argument", "Missing required fields: loadId or activityId.");
  }

  try {
    // Security check: Verify the teacher is assigned to this academic load.
    await verifyTeacherAndLoad(teacherId, loadId);

    const batch = db.batch();

    // 1. Delete the activity itself
    const activityRef = db.collection("activities").doc(activityId);
    batch.delete(activityRef);

    // 2. Find and delete all grades associated with the activity
    const gradesQuery = db.collection("studentGrades").where("activityId", "==", activityId);
    const gradesSnapshot = await gradesQuery.get();
    gradesSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 3. Commit the batch
    await batch.commit();

    logger.info(`Teacher ${teacherId} deleted activity ${activityId} and ${gradesSnapshot.size} associated grades.`);
    return {success: true, message: "Activity and all its grades deleted successfully."};
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error deleting activity ${activityId}:`, error);
    throw new HttpsError("internal", `Failed to delete activity: ${errorMessage}`);
  }
});

