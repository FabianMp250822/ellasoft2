import * as admin from "firebase-admin";

admin.initializeApp();

export { createOrganization } from "./organizations/create";
