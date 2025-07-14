/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const db = admin.firestore();

/**
 * Gets all performance indicators for a given organization.
 * Only accessible by authenticated users who are members of the organization.
 */
export const getPerformanceIndicatorsByOrg = onCall(async (request) => {
  // 1. Check if user is authenticated.
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const {organizationId} = request.data;
  const uid = request.auth.uid;
  const tokenOrgId = request.auth.token.organizationId;

  // 2. Validate input
  if (!organizationId) {
    throw new HttpsError("invalid-argument", "Missing required field: organizationId.");
  }

  // 3. Security Check: Ensure the user belongs to the organization they're querying.
  if (organizationId !== tokenOrgId) {
    logger.warn(`User ${uid} attempted to get indicators for org ${organizationId} but belongs to ${tokenOrgId}.`);
    throw new HttpsError("permission-denied", "You can only query indicators for your own organization.");
  }

  try {
    const indicatorsCol = db.collection("performanceIndicators");
    const q = indicatorsCol.where("organizationId", "==", organizationId);
    const snapshot = await q.get();

    const indicators = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    logger.info(`Successfully fetched ${indicators.length} indicator sets for org ${organizationId}`);

    return indicators;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error fetching performance indicators for organization ${organizationId}:`, error);
    throw new HttpsError("internal", `Failed to fetch indicators: ${errorMessage}`);
  }
});
