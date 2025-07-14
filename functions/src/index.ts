import * as admin from "firebase-admin";

admin.initializeApp();

// Auth functions
export {setSuperAdminClaim} from "./users/set-super-admin-claim";

// Organization functions
export {createOrganization} from "./organizations/create";
export {getOrganizations} from "./organizations/get";
export {setOrganizationStatus} from "./organizations/set-status";
export {createAcademicPeriod} from "./organizations/create-academic-period";
export {savePerformanceIndicators} from "./organizations/save-performance-indicators";
