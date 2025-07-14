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
export {createStudent} from "./organizations/create-student";
export {getStudentsByGrade} from "./organizations/get-students-by-grade";
export {createGradingSystem} from "./organizations/create-grading-system";
export {createGrade} from "./organizations/create-grade";
export {createSubject} from "./organizations/create-subject";
export {createAcademicLoad} from "./organizations/create-academic-load";
export {getAcademicLoads} from "./organizations/get-academic-loads";
export {getTeacherAcademicLoads} from "./organizations/get-teacher-academic-loads";
export {deleteAcademicLoad} from "./organizations/delete-academic-load";

// Gradebook functions
export {getGradebookData} from "./gradebook/get-gradebook-data";
export {createOrUpdateActivity} from "./gradebook/create-or-update-activity";
export {createOrUpdateStudentGrade} from "./gradebook/create-or-update-student-grade";
export {deleteActivity} from "./gradebook/delete-activity";

    