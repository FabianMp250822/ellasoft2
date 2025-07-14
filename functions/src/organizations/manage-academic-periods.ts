
/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const db = admin.firestore();

/**
 * Manages academic periods for an organization (Create, Update, Delete).
 * Only accessible by authenticated users who are admins of the organization.
 */
export const manageAcademicPeriods = onCall(async (request) => {
  if (!request.auth || !request.auth.token.admin) {
    throw new HttpsError("permission-denied", "The function must be called by an authenticated administrator.");
  }

  const {action, organizationId, periodId, data} = request.data;
  const uid = request.auth.uid;
  const tokenOrgId = request.auth.token.organizationId;

  // Security Check: Ensure the user belongs to the organization.
  if (organizationId !== tokenOrgId) {
    logger.warn(`User ${uid} attempted to manage a period for org ${organizationId} but belongs to ${tokenOrgId}.`);
    throw new HttpsError("permission-denied", "You can only manage periods for your own organization.");
  }

  try {
    switch (action) {
      case "create": {
        const {name, startDate, endDate} = data;
        if (!name || !startDate || !endDate) {
          throw new HttpsError("invalid-argument", "Missing required fields for creating a period.");
        }
        const docRef = await db.collection("academicPeriods").add({
          organizationId,
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return {success: true, message: `Period '${name}' created.`, id: docRef.id};
      }
      case "update": {
        if (!periodId || !data) {
          throw new HttpsError("invalid-argument", "Missing periodId or data for update.");
        }
        const {name, startDate, endDate} = data;
        await db.collection("academicPeriods").doc(periodId).update({
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        });
        return {success: true, message: "Period updated successfully."};
      }
      case "delete": {
        if (!periodId) {
          throw new HttpsError("invalid-argument", "Missing periodId for delete.");
        }
        await db.collection("academicPeriods").doc(periodId).delete();
        return {success: true, message: "Period deleted successfully."};
      }
      default:
        throw new HttpsError("invalid-argument", "Invalid action specified.");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error managing academic period for org ${organizationId} with action ${action}:`, error);
    throw new HttpsError("internal", `Failed to manage period: ${errorMessage}`);
  }
});
