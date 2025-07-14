
/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const db = admin.firestore();

/**
 * Manages grades for an organization (Create, Update, Delete).
 * Only accessible by authenticated users who are admins of the organization.
 */
export const manageGrades = onCall(async (request) => {
  if (!request.auth || !request.auth.token.admin) {
    throw new HttpsError("permission-denied", "The function must be called by an authenticated administrator.");
  }

  const {action, organizationId, gradeId, data} = request.data;
  const uid = request.auth.uid;
  const tokenOrgId = request.auth.token.organizationId;

  if (organizationId !== tokenOrgId) {
    logger.warn(`User ${uid} attempted to manage a grade for org ${organizationId} but belongs to ${tokenOrgId}.`);
    throw new HttpsError("permission-denied", "You can only manage grades for your own organization.");
  }

  try {
    switch (action) {
    case "create": {
      const {name, groupName} = data;
      if (!name || !groupName) {
        throw new HttpsError("invalid-argument", "Missing name or groupName for create.");
      }
      const docRef = await db.collection("grades").add({
        organizationId,
        name,
        groupName,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return {success: true, message: "Grade created.", id: docRef.id};
    }
    case "update": {
      if (!gradeId || !data) {
        throw new HttpsError("invalid-argument", "Missing gradeId or data for update.");
      }
      await db.collection("grades").doc(gradeId).update(data);
      return {success: true, message: "Grade updated."};
    }
    case "delete": {
      if (!gradeId) {
        throw new HttpsError("invalid-argument", "Missing gradeId for delete.");
      }
      await db.collection("grades").doc(gradeId).delete();
      return {success: true, message: "Grade deleted."};
    }
    default:
      throw new HttpsError("invalid-argument", "Invalid action.");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error managing grade for org ${organizationId}:`, error);
    throw new HttpsError("internal", `Failed to manage grade: ${errorMessage}`);
  }
});
