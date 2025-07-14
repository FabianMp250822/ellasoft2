import * as admin from "firebase-admin";

admin.initializeApp();

// Auth functions
export {setSuperAdminClaim} from "./users/set-super-admin-claim";
export {setOrganizationStatus} from "./organizations/set-status";

// Organization functions
export {createOrganization} from "./organizations/create";
export {getOrganizations} from "./organizations/get";
