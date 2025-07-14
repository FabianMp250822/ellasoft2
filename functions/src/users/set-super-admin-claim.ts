/* eslint-disable max-len */
import {onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

/**
 * Sets the 'superadmin' custom claim for a specific user.
 * This is intended to be run once to bootstrap the first superadmin.
 * **Security:** In a production environment, this should be a callable function
 * protected to be run only by an existing superadmin, or removed after first use.
 */
export const setSuperAdminClaim = onRequest(async (request, response) => {
  // --- IMPORTANT ---
  // The UID of the user to be made a superadmin.
  const uid = "M1wW4p56nLTpaC87YAQqgBAVShB3";
  const email = "fabianmunozpuello@gmail.com";

  try {
    await admin.auth().setCustomUserClaims(uid, {superadmin: true});
    const message = `Successfully set superadmin claim for user: ${email} (UID: ${uid})`;
    logger.info(message);
    response.status(200).send(message);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(
      `Error setting superadmin claim for user: ${uid}`,
      errorMessage
    );
    response.status(500).send(
      `Error setting superadmin claim. Check logs for details. Error: ${errorMessage}`
    );
  }
});
