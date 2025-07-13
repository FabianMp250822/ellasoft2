import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const organizations = [
  {
    id: "org_1",
    name: "Greenwood High",
    admin: "Alice Martin",
    email: "alice.m@greenwood.edu",
    status: "Active",
    createdAt: "2023-10-01",
  },
  {
    id: "org_2",
    name: "Oak Valley Academy",
    admin: "David Chen",
    email: "d.chen@oakvalley.org",
    status: "Active",
    createdAt: "2023-09-15",
  },
  {
    id: "org_3",
    name: "Maple Creek Institute",
    admin: "Sophia Rodriguez",
    email: "sophia.r@maple.edu",
    status: "Inactive",
    createdAt: "2024-01-20",
  },
];

export default function SuperadminDashboard() {
  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader
          title="Organizations Management"
          description="Oversee all institutions on the platform."
        />
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Create Organization
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Tenant Institutions</CardTitle>
          <CardDescription>
            A list of all organizations currently using EduAI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>
                    <Badge variant={org.status === "Active" ? "default" : "secondary"}>
                      {org.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{org.admin}</div>
                    <div className="text-sm text-muted-foreground">{org.email}</div>
                  </TableCell>
                  <TableCell>{org.createdAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Deactivate</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
