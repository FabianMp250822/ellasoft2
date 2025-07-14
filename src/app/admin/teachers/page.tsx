import { PageHeader } from "@/components/page-header";
import { TeachersClient } from "./client";

export default function TeachersPage() {
  return (
    <>
      <PageHeader
        title="Teachers"
        description="Register and manage teaching staff for your institution."
      />
      <TeachersClient />
    </>
  );
}
