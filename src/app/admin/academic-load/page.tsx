import { PageHeader } from "@/components/page-header";
import { AcademicLoadClient } from "./client";

export default function AcademicLoadPage() {
  return (
    <>
      <PageHeader
        title="Assign Academic Load"
        description="Link teachers to subjects and grades for specific academic periods."
      />
      <AcademicLoadClient />
    </>
  );
}
