// This file contains functions to fetch data from Firestore.
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  limit,
} from "firebase/firestore";
import { db, functions, auth } from "./firebase"; 
import { httpsCallable } from "firebase/functions";

export type Organization = {
    id: string;
    name: string;
    admin: string; // admin user's name
    adminId: string; // admin user's uid
    adminPhotoUrl: string;
    email: string; // organization's email
    status: "Active" | "Suspended" | "In Arrears";
    createdAt: string;
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
};


// Organizations
export async function getOrganizations(): Promise<Organization[]> {
  try {
    // When calling a function from a non-default codebase, you must use the name 'codebase-functionName'
    const getOrganizationsFunction = httpsCallable(functions, 'academic-getOrganizations');
    const result = await getOrganizationsFunction();
    // The result.data is already the array of organizations
    return result.data as Organization[];
  } catch (error) {
    console.error('Error fetching organizations via function:', error);
    return [];
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

export async function addAcademicPeriod(organizationId: string, period: Omit<AcademicPeriod, 'id' | 'organizationId'>) {
    const periodsCol = collection(db, "academicPeriods");
    const docRef = await addDoc(periodsCol, { organizationId, ...period });
    return { id: docRef.id, organizationId, ...period };
}

export async function updateAcademicPeriod(id: string, period: Partial<Omit<AcademicPeriod, 'id' | 'organizationId'>>) {
    const periodDoc = doc(db, "academicPeriods", id);
    await updateDoc(periodDoc, period);
}

export async function deleteAcademicPeriod(id: string) {
    const periodDoc = doc(db, "academicPeriods", id);
    await deleteDoc(periodDoc);
}


// Grading Systems
export async function getGradingSystems(organizationId: string): Promise<GradingSystem[]> {
    const systemsCol = collection(db, "gradingSystems");
    const q = query(systemsCol, where("organizationId", "==", organizationId));
    const systemsSnapshot = await getDocs(q);
    return systemsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as GradingSystem));
}

export async function addGradingSystem(organizationId: string, system: Omit<GradingSystem, 'id' | 'organizationId'>) {
    const systemsCol = collection(db, "gradingSystems");
    const docRef = await addDoc(systemsCol, { organizationId, ...system });
    return { id: docRef.id, organizationId, ...system };
}

export async function updateGradingSystem(id: string, system: Partial<Omit<GradingSystem, 'id' | 'organizationId'>>) {
    const systemDoc = doc(db, "gradingSystems", id);
    await updateDoc(systemDoc, system);
}

export async function deleteGradingSystem(id: string) {
    const systemDoc = doc(db, "gradingSystems", id);
    await deleteDoc(systemDoc);
}


// Grades
export async function getGrades(organizationId: string): Promise<Grade[]> {
    const gradesCol = collection(db, "grades");
    const q = query(gradesCol, where("organizationId", "==", organizationId));
    const gradesSnapshot = await getDocs(q);
    return gradesSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Grade));
}

export async function addGrade(organizationId: string, grade: Omit<Grade, 'id' | 'organizationId'>) {
    const gradesCol = collection(db, "grades");
    const docRef = await addDoc(gradesCol, { organizationId, ...grade });
    return { id: docRef.id, organizationId, ...grade };
}

export async function updateGrade(id: string, grade: Partial<Omit<Grade, 'id' | 'organizationId'>>) {
    const gradeDoc = doc(db, "grades", id);
    await updateDoc(gradeDoc, grade);
}

export async function deleteGrade(id: string) {
    const gradeDoc = doc(db, "grades", id);
    await deleteDoc(gradeDoc);
}


// Subjects
export async function getSubjects(organizationId: string): Promise<Subject[]> {
    const subjectsCol = collection(db, "subjects");
    const q = query(subjectsCol, where("organizationId", "==", organizationId));
    const subjectsSnapshot = await getDocs(q);
    return subjectsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Subject));
}

export async function addSubject(organizationId: string, subject: Omit<Subject, 'id' | 'organizationId'>) {
    const subjectsCol = collection(db, "subjects");
    const docRef = await addDoc(subjectsCol, { organizationId, ...subject });
    return { id: docRef.id, organizationId, ...subject };
}

export async function updateSubject(id: string, subject: Partial<Omit<Subject, 'id' | 'organizationId'>>) {
    const subjectDoc = doc(db, "subjects", id);
    await updateDoc(subjectDoc, subject);
}

export async function deleteSubject(id: string) {
    const subjectDoc = doc(db, "subjects", id);
    await deleteDoc(subjectDoc);
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
        // indicators, // Assuming collections exist for these
        // teachers,
        // students,
        // academicLoad
    ] = await Promise.all([
        checkCollection("academicPeriods", organizationId),
        checkCollection("gradingSystems", organizationId),
        checkCollection("grades", organizationId),
        checkCollection("subjects", organizationId),
        // checkCollection("performanceIndicators", organizationId),
        // checkCollection("teachers", organizationId),
        // checkCollection("students", organizationId),
        // checkCollection("academicLoad", organizationId),
    ]);

    return {
      periods,
      gradingSystems,
      grades,
      subjects,
      indicators: false,
      teachers: false,
      students: false,
      academicLoad: false,
    };
}
