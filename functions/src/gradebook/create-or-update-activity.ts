/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import {verifyTeacherAndLoad} from "./utils";

const db = admin.firestore();

/**
 * Creates a new activity or updates an existing one for a specific academic load.
 * - If `activityId` is provided, it updates the existing activity.
 * - If `activityId` is null, it creates a new activity.
 * Only accessible by authenticated teachers for a load they are assigned to.
 */
export const createOrUpdateActivity = onCall(async (request) => {
  if (!request.auth || !request.auth.token.teacher) {
    throw new HttpsError("permission-denied", "The function must be called by an authenticated teacher.");
  }

  const {
    loadId,
    activityId, // Can be null for creation
    name,
    percentage,
  } = request.data;
  const teacherId = request.auth.uid;
  const organizationId = request.auth.token.organizationId;

  if (!loadId || !name || percentage === undefined) {
    throw new HttpsError("invalid-argument", "Missing required fields: loadId, name, or percentage.");
  }

  if (typeof percentage !== "number" || percentage < 0 || percentage > 100) {
    throw new HttpsError("invalid-argument", "Percentage must be a number between 0 and 100.");
  }

  try {
    // Security check: Verify the teacher is assigned to this academic load.
    await verifyTeacherAndLoad(teacherId, loadId);

    if (activityId) {
      // Update existing activity
      const activityRef = db.collection("activities").doc(activityId);
      await activityRef.update({
        name,
        percentage,
      });
      logger.info(`Teacher ${teacherId} updated activity ${activityId} for load ${loadId}.`);
      return {success: true, activityId: activityId, message: "Activity updated successfully."};
    } else {
      // Create new activity
      const newActivityRef = db.collection("activities").doc();
      await newActivityRef.set({
        loadId,
        organizationId,
        name,
        percentage,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: teacherId,
      });
      logger.info(`Teacher ${teacherId} created new activity ${newActivityRef.id} for load ${loadId}.`);
      return {success: true, activityId: newActivityRef.id, message: "Activity created successfully."};
    }
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error in createOrUpdateActivity for load ${loadId}:`, error);
    throw new HttpsError("internal", `Failed to save activity: ${errorMessage}`);
  }
});

