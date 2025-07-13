// This file contains functions to simulate fetching data from a database like Firestore.
// The data is hardcoded for demonstration purposes.
// In a real application, these functions would make async calls to Firestore
// and would be filtered by the user's organizationId.

export type Organization = {
    id: string;
    name: string;
    admin: string;
    email: string;
    status: "Active" | "Inactive";
    createdAt: string;
    logoUrl?: string;
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


let mockOrganizations: Organization[] = [];

let mockAcademicPeriods: AcademicPeriod[] = [
    { id: 'period_1', organizationId: 'org_1', name: 'Semester 1 2024', startDate: new Date('2024-01-15'), endDate: new Date('2024-06-30') },
    { id: 'period_2', organizationId: 'org_1', name: 'Semester 2 2024', startDate: new Date('2024-07-15'), endDate: new Date('2024-12-15') },
];

let mockGradingSystems: GradingSystem[] = [
    { id: 'gs_1', organizationId: 'org_1', name: 'Numerical 0-5', description: 'Standard numerical scale from 0.0 to 5.0, with 3.0 being the passing grade.', scale: '0.0-5.0' },
    { id: 'gs_2', organizationId: 'org_1', name: 'Conceptual', description: 'Performance levels: Low, Basic, High, Superior.', scale: 'Conceptual' },
];

let mockGrades: Grade[] = [
    { id: 'grade_1', organizationId: 'org_1', name: '11th Grade', groupName: 'A' },
    { id: 'grade_2', organizationId: 'org_1', name: '11th Grade', groupName: 'B' },
    { id: 'grade_3', organizationId: 'org_1', name: '9th Grade', groupName: 'A' },
];

let mockSubjects: Subject[] = [
    { id: 'subj_1', organizationId: 'org_1', name: 'Calculus', description: 'Differential and integral calculus.' },
    { id: 'subj_2', organizationId: 'org_1', name: 'Physics', description: 'Mechanics and thermodynamics.' },
    { id: 'subj_3', organizationId: 'org_1', name: 'Art History', description: 'From Renaissance to Modernism.' },
];

const newId = () => `id_${Math.random().toString(36).substr(2, 9)}`;


// Organizations
export async function getOrganizations(): Promise<Organization[]> {
    // In a real app, this would fetch from Firestore
    // const snapshot = await firestore.collection('organizations').get();
    // return snapshot.docs.map(doc => doc.data() as Organization);
    return Promise.resolve(mockOrganizations);
}

// Academic Periods
export async function getAcademicPeriods(organizationId: string): Promise<AcademicPeriod[]> {
    return Promise.resolve(mockAcademicPeriods.filter(p => p.organizationId === organizationId));
}

export async function addAcademicPeriod(organizationId: string, period: Omit<AcademicPeriod, 'id' | 'organizationId'>) {
    const newPeriod: AcademicPeriod = { id: newId(), organizationId, ...period };
    mockAcademicPeriods.push(newPeriod);
    return Promise.resolve(newPeriod);
}

export async function updateAcademicPeriod(id: string, period: Partial<AcademicPeriod>) {
    mockAcademicPeriods = mockAcademicPeriods.map(p => p.id === id ? { ...p, ...period } : p);
    return Promise.resolve();
}

export async function deleteAcademicPeriod(id: string) {
    mockAcademicPeriods = mockAcademicPeriods.filter(p => p.id !== id);
    return Promise.resolve();
}


// Grading Systems
export async function getGradingSystems(organizationId: string): Promise<GradingSystem[]> {
    return Promise.resolve(mockGradingSystems.filter(gs => gs.organizationId === organizationId));
}

export async function addGradingSystem(organizationId: string, system: Omit<GradingSystem, 'id' | 'organizationId'>) {
    const newSystem: GradingSystem = { id: newId(), organizationId, ...system };
    mockGradingSystems.push(newSystem);
    return Promise.resolve(newSystem);
}

export async function updateGradingSystem(id: string, system: Partial<GradingSystem>) {
    mockGradingSystems = mockGradingSystems.map(gs => gs.id === id ? { ...gs, ...system } : gs);
    return Promise.resolve();
}

export async function deleteGradingSystem(id: string) {
    mockGradingSystems = mockGradingSystems.filter(gs => gs.id !== id);
    return Promise.resolve();
}


// Grades
export async function getGrades(organizationId: string): Promise<Grade[]> {
    return Promise.resolve(mockGrades.filter(g => g.organizationId === organizationId));
}

export async function addGrade(organizationId: string, grade: Omit<Grade, 'id' | 'organizationId'>) {
    const newGrade: Grade = { id: newId(), organizationId, ...grade };
    mockGrades.push(newGrade);
    return Promise.resolve(newGrade);
}

export async function updateGrade(id: string, grade: Partial<Grade>) {
    mockGrades = mockGrades.map(g => g.id === id ? { ...g, ...grade } : g);
    return Promise.resolve();
}

export async function deleteGrade(id: string) {
    mockGrades = mockGrades.filter(g => g.id !== id);
    return Promise.resolve();
}


// Subjects
export async function getSubjects(organizationId: string): Promise<Subject[]> {
    return Promise.resolve(mockSubjects.filter(s => s.organizationId === organizationId));
}

export async function addSubject(organizationId: string, subject: Omit<Subject, 'id' | 'organizationId'>) {
    const newSubject: Subject = { id: newId(), organizationId, ...subject };
    mockSubjects.push(newSubject);
    return Promise.resolve(newSubject);
}

export async function updateSubject(id: string, subject: Partial<Subject>) {
    mockSubjects = mockSubjects.map(s => s.id === id ? { ...s, ...subject } : s);
    return Promise.resolve();
}

export async function deleteSubject(id: string) {
    mockSubjects = mockSubjects.filter(s => s.id !== id);
    return Promise.resolve();
}


// Admin Dashboard Setup Status
export async function getSetupStatus(organizationId: string) {
    // In a real app, you would query each collection
    return Promise.resolve({
      periods: (await getAcademicPeriods(organizationId)).length > 0,
      gradingSystems: (await getGradingSystems(organizationId)).length > 0,
      grades: (await getGrades(organizationId)).length > 0,
      subjects: (await getSubjects(organizationId)).length > 0,
      indicators: false, // You would check the performanceIndicators collection
      teachers: false,   // You would check the teachers collection
      students: false,   // You would check the students collection
      academicLoad: false, // You would check the academicLoad collection
    });
}
