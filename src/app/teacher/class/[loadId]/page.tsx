import { getAcademicLoads, getStudentsByGrade, getSubjects, getGrades } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { notFound } from "next/navigation";
import { ClassRosterClient } from "./client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default async function ClassRosterPage({ params }: { params: { loadId: string } }) {
    const { loadId } = params;
    
    // This is a simplified way to get orgId. In a real app, you might get this from the logged-in user's session.
    // For now, we fetch all loads and find ours, which is inefficient but works for this example.
    // A better approach would be to have orgId in the URL or session.
    const allLoads = await getAcademicLoads(""); // This will fail if not superadmin. A better way is needed.
    const academicLoad = allLoads.find(l => l.id === loadId);

    // Let's assume for now we can't get the orgId easily. We'll have to adjust this logic.
    // A temporary workaround would be to fetch data on the client where we have the claims.
    // But let's build the structure assuming we can get the data.
    
    // We cannot reliably fetch the academic load or organization ID on the server for a teacher.
    // Therefore, we must do all fetching on the client side where we have auth context.
    
    return (
        <>
            <ClassRosterClient loadId={loadId} />
        </>
    );
}
