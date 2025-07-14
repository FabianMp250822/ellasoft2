/* eslint-disable max-len */
import * as admin from "firebase-admin";
import {HttpsError} from "firebase-functions/v2/https";

const db = admin.firestore();

/**
 * Verifies that a teacher is assigned to a specific academic load.
 * Throws an HttpsError if verification fails.
 * @param {string} teacherId The UID of the teacher.
 * @param {string} loadId The ID of the academic load.
 * @return {Promise<FirebaseFirestore.DocumentSnapshot>} The academic load document snapshot if verification is successful.
 */
export async function verifyTeacherAndLoad(teacherId: string, loadId: string): Promise<FirebaseFirestore.DocumentSnapshot> {
  const loadRef = db.collection("academicLoads").doc(loadId);
  const loadDoc = await loadRef.get();

  if (!loadDoc.exists) {
    throw new HttpsError("not-found", `Academic load with ID ${loadId} not found.`);
  }

  const loadData = loadDoc.data();
  if (loadData?.teacherId !== teacherId) {
    throw new HttpsError("permission-denied", "You are not assigned to this academic load.");
  }

  return loadDoc;
}

