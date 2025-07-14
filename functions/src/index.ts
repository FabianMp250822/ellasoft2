import * as admin from "firebase-admin";

admin.initializeApp();

// Auth functions
export {setSuperAdminClaim} from "./users/set-super-admin-claim";
