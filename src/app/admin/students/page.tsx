import { PageHeader } from "@/components/page-header";
import { StudentsClient } from "./client";

export default function StudentsPage() {
  return (
    <>
      <PageHeader
        title="Students"
        description="Enroll and manage students in your institution."
      />
      <StudentsClient />
    </>
  );
}
