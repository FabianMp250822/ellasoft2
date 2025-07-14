// This file contains functions to fetch data from Firestore.
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  limit,
} from "firebase/firestore";
import { db, functions } from "./firebase";
import { httpsCallable } from "firebase/functions";

export type Organization = {
    id: string;
    name: string;
    admin: string; // admin user's name
    adminId: string; // admin user's uid
    adminPhotoUrl: string;
    email: string; // organization's email
    status: "Active" | "Suspended" | "In Arrears";
    createdAt: any; // Can be a server timestamp
    logoUrl?: string;
    userLimit: number;
    userCount: number;
    dataConsumption: number; // in GB
};

export type AcademicPeriod = {
    id: string;
    organizationId: string;
    name: string;
    startDate: Date;
    endDate: Date;
};

export type GradingSystem = {
    id: string;
    organizationId: string;
    name: string;
    description: string;
    scale: string; // e.g., "0-5", "A-F"
};

export type Grade = {
    id: string;
    organizationId: string;
    name: string; // e.g., "11th Grade"
    groupName: string; // e.g., "A"
};

export type Subject = {
    id: string;
    organizationId: string;
    name: string;
    description: string;
    gradeId?: string;
};

export type PerformanceIndicator = {
    id: string;
    organizationId: string;
    subjectId: string;
    gradeId: string;
    indicators: {
        bajo: string[];
        basico: string[];
        alto: string[];
        superior: string[];
    };
    createdAt: any;
};

export type Teacher = {
    uid: string;
    organizationId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    photoUrl: string;
    assignedSubjects: string[]; // Array of subject IDs
    createdAt: any;
};

export type Student = {
    uid: string;
    organizationId: string;
    // Personal Data
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    photoUrl: string;
    documentType: string;
    documentNumber: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    // Academic Data
    gradeId: string;
    // Family Data
    guardianName: string;
    guardianPhone: string;
    guardianEmail: string;
    motherName?: string;
    motherPhone?: string;
    fatherName?: string;
    fatherPhone?: string;
    createdAt: any;
}

export type AcademicLoad = {
    id: string;
    organizationId: string;
    teacherId: string;
    subjectId: string;
    gradeId: string;
    academicPeriodId: string;
    createdAt: any;
};


// Organizations
export async function getOrganizations(): Promise<Organization[]> {
  try {
    const getOrganizationsFunction = httpsCallable(functions, 'getOrganizations');
    const result = await getOrganizationsFunction();
    return result.data as Organization[];
  } catch (error) {
    console.error('Error fetching organizations via function:', error);
    throw error;
  }
}

// Academic Periods
export async function getAcademicPeriods(organizationId: string): Promise<AcademicPeriod[]> {
    const periodsCol = collection(db, "academicPeriods");
    const q = query(periodsCol, where("organizationId", "==", organizationId));
    const periodsSnapshot = await getDocs(q);
    const periodsList = periodsSnapshot.docs.map(d => {
        const data = d.data();
        return {
            id: d.id,
            ...data,
            startDate: data.startDate.toDate(),
            endDate: data.endDate.toDate(),
        } as AcademicPeriod;
    });
    return periodsList;
}

export async function deleteAcademicPeriod(id: string) {
    const periodDoc = doc(db, "academicPeriods", id);
    await deleteDoc(periodDoc);
}

export async function updateAcademicPeriod(id: string, period: Partial<Omit<AcademicPeriod, 'id' | 'organizationId'>>) {
    const periodDoc = doc(db, "academicPeriods", id);
    await updateDoc(periodDoc, period);
}


// Grading Systems
export async function getGradingSystems(organizationId: string): Promise<GradingSystem[]> {
    const systemsCol = collection(db, "gradingSystems");
    const q = query(systemsCol, where("organizationId", "==", organizationId));
    const systemsSnapshot = await getDocs(q);
    return systemsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as GradingSystem));
}

export async function deleteGradingSystem(id: string) {
    const systemDoc = doc(db, "gradingSystems", id);
    await deleteDoc(systemDoc);
}

export async function updateGradingSystem(id: string, system: Partial<Omit<GradingSystem, 'id' | 'organizationId'>>) {
    const systemDoc = doc(db, "gradingSystems", id);
    await updateDoc(systemDoc, system);
}


// Grades
export async function getGrades(organizationId: string): Promise<Grade[]> {
    const gradesCol = collection(db, "grades");
    const q = query(gradesCol, where("organizationId", "==", organizationId));
    const gradesSnapshot = await getDocs(q);
    return gradesSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Grade));
}

export async function deleteGrade(id: string) {
    const gradeDoc = doc(db, "grades", id);
    await deleteDoc(gradeDoc);
}

export async function updateGrade(id: string, grade: Partial<Omit<Grade, 'id' | 'organizationId'>>) {
    const gradeDoc = doc(db, "grades", id);
    await updateDoc(gradeDoc, grade);
}


// Subjects
export async function getSubjects(organizationId: string): Promise<Subject[]> {
    const subjectsCol = collection(db, "subjects");
    const q = query(subjectsCol, where("organizationId", "==", organizationId));
    const subjectsSnapshot = await getDocs(q);
    return subjectsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Subject));
}

export async function deleteSubject(id: string) {
    const subjectDoc = doc(db, "subjects", id);
    await deleteDoc(subjectDoc);
}

export async function updateSubject(id: string, subject: Partial<Omit<Subject, 'id' | 'organizationId'>>) {
    const subjectDoc = doc(db, "subjects", id);
    await updateDoc(subjectDoc, subject);
}


// Performance Indicators
export async function getPerformanceIndicatorsByOrg(organizationId: string): Promise<PerformanceIndicator[]> {
    try {
        const getIndicatorsFunction = httpsCallable(functions, 'getPerformanceIndicatorsByOrg');
        const result = await getIndicatorsFunction({ organizationId });
        const data = result.data as any[];
        return data.map(item => ({
            ...item,
            createdAt: item.createdAt ? new Date(item.createdAt._seconds * 1000) : new Date(),
        })) as PerformanceIndicator[];
    } catch (error) {
        console.error('Error fetching performance indicators via function:', error);
        throw error;
    }
}


// Teachers
export async function getTeachers(organizationId: string): Promise<Teacher[]> {
    const teachersCol = collection(db, "teachers");
    const q = query(teachersCol, where("organizationId", "==", organizationId));
    const teachersSnapshot = await getDocs(q);
    return teachersSnapshot.docs.map(d => d.data() as Teacher);
}


// Students
export async function getStudents(organizationId: string): Promise<Student[]> {
    const studentsCol = collection(db, "students");
    const q = query(studentsCol, where("organizationId", "==", organizationId));
    const studentsSnapshot = await getDocs(q);
    return studentsSnapshot.docs.map(d => d.data() as Student);
}

export async function getStudentsByGrade(gradeId: string): Promise<Student[]> {
    const studentsCol = collection(db, "students");
    const q = query(studentsCol, where("gradeId", "==", gradeId));
    const studentsSnapshot = await getDocs(q);
    return studentsSnapshot.docs.map(d => d.data() as Student);
}


// Academic Load
export async function getAcademicLoads(organizationId: string): Promise<AcademicLoad[]> {
    try {
        const getLoadsFunction = httpsCallable(functions, 'getAcademicLoads');
        const result = await getLoadsFunction({ organizationId });
        return result.data as AcademicLoad[];
    } catch (error) {
        console.error('Error fetching academic loads via function:', error);
        throw error;
    }
}

export async function getTeacherAcademicLoads(): Promise<AcademicLoad[]> {
    try {
        // This function requires no parameters as it gets the teacher's identity from the auth context.
        const getLoadsFunction = httpsCallable(functions, 'getTeacherAcademicLoads');
        const result = await getLoadsFunction();
        return result.data as AcademicLoad[];
    } catch (error) {
        console.error('Error fetching teacher academic loads via function:', error);
        throw error;
    }
}

export async function deleteAcademicLoad(id: string) {
    const deleteLoadFunction = httpsCallable(functions, 'deleteAcademicLoad');
    await deleteLoadFunction({ id });
}


// Admin Dashboard Setup Status
async function checkCollection(collectionName: string, organizationId: string): Promise<boolean> {
    const colRef = collection(db, collectionName);
    const q = query(colRef, where("organizationId", "==", organizationId), limit(1));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
}

export async function getSetupStatus(organizationId: string) {
    const [
        periods,
        gradingSystems,
        grades,
        subjects,
        teachers,
        students,
        academicLoad,
    ] = await Promise.all([
        checkCollection("academicPeriods", organizationId),
        checkCollection("gradingSystems", organizationId),
        checkCollection("grades", organizationId),
        checkCollection("subjects", organizationId),
        checkCollection("teachers", organizationId),
        checkCollection("students", organizationId),
        checkCollection("academicLoads", organizationId),
    ]);

    return {
      periods,
      gradingSystems,
      grades,
      subjects,
      teachers,
      students,
      academicLoad,
      indicators: false, // This can be updated when indicators have a "completed" state
    };
}
