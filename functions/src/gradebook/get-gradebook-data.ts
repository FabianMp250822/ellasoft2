/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import {verifyTeacherAndLoad} from "./utils";

const db = admin.firestore();

/**
 * Fetches all necessary data for a gradebook view for a specific academic load.
 * This includes the list of students in the grade, the activities for the load,
 * and all student grades for those activities.
 * Only accessible by authenticated teachers for a load they are assigned to.
 */
export const getGradebookData = onCall(async (request) => {
  if (!request.auth || !request.auth.token.teacher) {
    throw new HttpsError("permission-denied", "The function must be called by an authenticated teacher.");
  }

  const {loadId} = request.data;
  const teacherId = request.auth.uid;

  if (!loadId) {
    throw new HttpsError("invalid-argument", "Missing required field: loadId.");
  }

  try {
    // Security check: Verify the teacher is assigned to this load and get its details
    const loadDoc = await verifyTeacherAndLoad(teacherId, loadId);
    const loadData = loadDoc.data();
    const gradeId = loadData?.gradeId;

    if (!gradeId) {
      throw new HttpsError("not-found", "Grade ID not found in academic load.");
    }

    // Fetch students, activities, and grades in parallel
    const [studentsSnapshot, activitiesSnapshot, gradesSnapshot] = await Promise.all([
      db.collection("students").where("gradeId", "==", gradeId).get(),
      db.collection("activities").where("loadId", "==", loadId).get(),
      db.collection("studentGrades").where("loadId", "==", loadId).get(),
    ]);

    const students = studentsSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
    const activities = activitiesSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
    const grades = gradesSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));

    logger.info(`Fetched gradebook data for load ${loadId} for teacher ${teacherId}.`);

    return {
      students,
      activities,
      grades,
    };
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error fetching gradebook data for load ${loadId}:`, error);
    throw new HttpsError("internal", `Failed to fetch gradebook data: ${errorMessage}`);
  }
});

