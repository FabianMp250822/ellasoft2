
/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const db = admin.firestore();

/**
 * Manages subjects for an organization (Create, Update, Delete).
 * Only accessible by authenticated users who are admins of the organization.
 */
export const manageSubjects = onCall(async (request) => {
  if (!request.auth || !request.auth.token.admin) {
    throw new HttpsError("permission-denied", "The function must be called by an authenticated administrator.");
  }

  const {action, organizationId, subjectId, data} = request.data;
  const uid = request.auth.uid;
  const tokenOrgId = request.auth.token.organizationId;

  if (organizationId !== tokenOrgId) {
    logger.warn(`User ${uid} attempted to manage a subject for org ${organizationId} but belongs to ${tokenOrgId}.`);
    throw new HttpsError("permission-denied", "You can only manage subjects for your own organization.");
  }

  try {
    switch (action) {
    case "create": {
      const {name, description, gradeId} = data;
      if (!name || !description || !gradeId) {
        throw new HttpsError("invalid-argument", "Missing required fields for create.");
      }
      const docRef = await db.collection("subjects").add({
        organizationId,
        name,
        description,
        gradeId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return {success: true, message: "Subject created.", id: docRef.id};
    }
    case "update": {
      if (!subjectId || !data) {
        throw new HttpsError("invalid-argument", "Missing subjectId or data for update.");
      }
      await db.collection("subjects").doc(subjectId).update(data);
      return {success: true, message: "Subject updated."};
    }
    case "delete": {
      if (!subjectId) {
        throw new HttpsError("invalid-argument", "Missing subjectId for delete.");
      }
      await db.collection("subjects").doc(subjectId).delete();
      return {success: true, message: "Subject deleted."};
    }
    default:
      throw new HttpsError("invalid-argument", "Invalid action.");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error managing subject for org ${organizationId}:`, error);
    throw new HttpsError("internal", `Failed to manage subject: ${errorMessage}`);
  }
});
