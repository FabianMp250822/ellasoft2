"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Ban, PlayCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useForm, SubmitHandler } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import type { Organization } from "@/lib/data";
import Image from "next/image";
import { createOrganizationAction, setOrganizationStatusAction } from "./actions";
import { getOrganizations } from "@/lib/data";
import { useAuth } from "@/context/auth-context";
import { LoadingSpinner } from "@/components/loading-spinner";
import { CreateOrganizationForm, FormValues } from "./form";

function OrganizationTable({
  organizations,
  onStatusChange,
}: {
  organizations: Organization[];
  onStatusChange: (orgId: string, status: Organization["status"]) => void;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.map((org) => (
              <TableRow key={org.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    {org.logoUrl && (
                      <Image
                        src={org.logoUrl}
                        alt={org.name}
                        width={32}
                        height={32}
                        className="rounded-md"
                        data-ai-hint="logo"
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="font-semibold">{org.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {org.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      org.status === "Active"
                        ? "default"
                        : org.status === "Suspended"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {org.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {org.userCount || 0} / {org.userLimit}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {(org.dataConsumption || 0).toFixed(2)} GB
                  </div>
                </TableCell>
                <TableCell className="text-right">
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
                      <DropdownMenuSeparator />
                      {org.status === "Active" ? (
                        <DropdownMenuItem
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          onClick={() => onStatusChange(org.id, "Suspended")}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Suspend
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          className="text-green-600 focus:bg-green-100 focus:text-green-700"
                          onClick={() => onStatusChange(org.id, "Active")}
                        >
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Reactivate
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function OrganizationsClient() {
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchOrgs = React.useCallback(async () => {
    try {
      setLoading(true);
      const orgs = await getOrganizations();
      setOrganizations(orgs);
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      toast({
        title: "Error",
        description: "Could not fetch organizations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  React.useEffect(() => {
    if (user) {
      fetchOrgs();
    }
  }, [user, fetchOrgs]);

  const handleStatusChange = async (orgId: string, newStatus: Organization['status']) => {
    const result = await setOrganizationStatusAction(orgId, newStatus);
    if (result.success) {
      toast({ title: "Success", description: result.message });
      fetchOrgs(); // Refetch to get the latest data
    } else {
      toast({ title: "Error", description: String(result.message), variant: "destructive" });
    }
  }

  const handleFormSuccess = () => {
    setDialogOpen(false);
    fetchOrgs(); // Refetch organizations after a new one is created
  }
  
  if (loading || authLoading) {
    return <LoadingSpinner />;
  }

  const activeOrgs = organizations.filter(org => org.status === 'Active');
  const suspendedOrgs = organizations.filter(org => org.status === 'Suspended');
  const inArrearsOrgs = organizations.filter(org => org.status === 'In Arrears');

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button size="sm" className="gap-1" onClick={() => setDialogOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            Create Organization
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active ({activeOrgs.length})</TabsTrigger>
          <TabsTrigger value="suspended">Suspended ({suspendedOrgs.length})</TabsTrigger>
          <TabsTrigger value="arrears">In Arrears ({inArrearsOrgs.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          <OrganizationTable organizations={activeOrgs} onStatusChange={handleStatusChange} />
        </TabsContent>
        <TabsContent value="suspended" className="mt-4">
           <OrganizationTable organizations={suspendedOrgs} onStatusChange={handleStatusChange} />
        </TabsContent>
        <TabsContent value="arrears" className="mt-4">
            <OrganizationTable organizations={inArrearsOrgs} onStatusChange={handleStatusChange} />
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Fill out the form below to register a new institution on the platform.
            </DialogDescription>
          </DialogHeader>
          <CreateOrganizationForm onSuccess={handleFormSuccess} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
