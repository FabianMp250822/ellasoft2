/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const db = admin.firestore();

/**
 * Creates a grading system for an organization.
 * Only accessible by authenticated users who are members of the organization.
 */
export const createGradingSystem = onCall(async (request) => {
  // 1. Check if user is authenticated.
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const {organizationId, name, description, scale} = request.data;
  const uid = request.auth.uid;
  const tokenOrgId = request.auth.token.organizationId;

  // 2. Validate input
  if (!organizationId || !name || !description || !scale) {
    throw new HttpsError("invalid-argument", "Missing required fields: organizationId, name, description, or scale.");
  }

  // 3. Security Check: Ensure the user belongs to the organization.
  if (organizationId !== tokenOrgId) {
    logger.warn(`User ${uid} attempted to create a grading system for org ${organizationId} but belongs to ${tokenOrgId}.`);
    throw new HttpsError("permission-denied", "You can only create grading systems for your own organization.");
  }

  try {
    const systemData = {
      organizationId,
      name,
      description,
      scale,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("gradingSystems").add(systemData);

    const successMessage = `Successfully created grading system '${name}' with ID ${docRef.id} for organization ${organizationId}.`;
    logger.info(successMessage);

    return {success: true, message: successMessage, systemId: docRef.id};
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error creating grading system for organization ${organizationId}:`, error);
    throw new HttpsError("internal", `Failed to create grading system: ${errorMessage}`);
  }
});
