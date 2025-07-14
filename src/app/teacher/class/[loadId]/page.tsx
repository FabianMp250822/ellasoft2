import { ClassRosterClient } from "./client";

export default function ClassRosterPage({ params }: { params: { loadId: string } }) {
    const { loadId } = params;
    
    // We must do all fetching on the client side where we have auth context.
    // The server component's only job is to pass the ID to the client component.
    return (
        <>
            <ClassRosterClient loadId={loadId} />
        </>
    );
}
