
/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const db = admin.firestore();

/**
 * Manages grading systems for an organization (Create, Update, Delete).
 * Only accessible by authenticated users who are admins of the organization.
 */
export const manageGradingSystems = onCall(async (request) => {
  if (!request.auth || !request.auth.token.admin) {
    throw new HttpsError("permission-denied", "The function must be called by an authenticated administrator.");
  }

  const {action, organizationId, systemId, data} = request.data;
  const uid = request.auth.uid;
  const tokenOrgId = request.auth.token.organizationId;

  if (organizationId !== tokenOrgId) {
    logger.warn(`User ${uid} attempted to manage a grading system for org ${organizationId} but belongs to ${tokenOrgId}.`);
    throw new HttpsError("permission-denied", "You can only manage grading systems for your own organization.");
  }

  try {
    switch (action) {
      case "create": {
        const {name, description, scale} = data;
        if (!name || !description || !scale) {
          throw new HttpsError("invalid-argument", "Missing required fields for create.");
        }
        const docRef = await db.collection("gradingSystems").add({
          organizationId,
          name,
          description,
          scale,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return {success: true, message: "Grading system created.", id: docRef.id};
      }
      case "update": {
        if (!systemId || !data) {
          throw new HttpsError("invalid-argument", "Missing systemId or data for update.");
        }
        await db.collection("gradingSystems").doc(systemId).update(data);
        return {success: true, message: "Grading system updated."};
      }
      case "delete": {
        if (!systemId) {
          throw new HttpsError("invalid-argument", "Missing systemId for delete.");
        }
        await db.collection("gradingSystems").doc(systemId).delete();
        return {success: true, message: "Grading system deleted."};
      }
      default:
        throw new HttpsError("invalid-argument", "Invalid action.");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error managing grading system for org ${organizationId}:`, error);
    throw new HttpsError("internal", `Failed to manage grading system: ${errorMessage}`);
  }
});
