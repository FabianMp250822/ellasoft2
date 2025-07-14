import {onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

/**
 * Sets the 'superadmin' custom claim for a specific user.
 * This is intended to be run once to bootstrap the first superadmin.
 */
export const setSuperAdminClaim = onRequest(async (request, response) => {
  // --- IMPORTANT ---
  // The UID of the user to be made a superadmin.
  const uid = "M1wW4p56nLTpaC87YAQqgBAVShB3";
  const email = "fabianmunozpuello@gmail.com";

  try {
    await admin.auth().setCustomUserClaims(uid, {superadmin: true});
    logger.info(
      `Successfully set superadmin claim for user: ${email} (UID: ${uid})`
    );
    response.status(200)
      .send(`Successfully set superadmin claim for user: ${email}`);
  } catch (error) {
    logger.error(`Error setting superadmin claim for user: ${uid}`, error);
    response.status(500)
      .send("Error setting superadmin claim. Check logs for details.");
  }
});
