/* eslint-disable max-len */
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
export {getPerformanceIndicatorsByOrg} from "./organizations/get-performance-indicators";
export {createTeacher} from "./organizations/create-teacher";
export {createGradingSystem} from "./organizations/create-grading-system";
export {createGrade} from "./organizations/create-grade";
export {createSubject} from "./organizations/create-subject";
