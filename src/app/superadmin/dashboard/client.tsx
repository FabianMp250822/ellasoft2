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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Ban, PlayCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Organization } from "@/lib/data";
import Image from "next/image";
import { setOrganizationStatusAction } from "../organizations/actions";


export function OrganizationsClient({ data }: { data: Organization[] }) {
  const { toast } = useToast();

  const handleSuspend = async (orgId: string, currentStatus: "Active" | "Suspended" | "In Arrears") => {
    const newStatus = currentStatus === "Active" ? "Suspended" : "Active";
    const result = await setOrganizationStatusAction(orgId, newStatus);
    if (result.success) {
      toast({ title: "Success", description: result.message });
    } else {
      toast({ title: "Error", description: String(result.message), variant: "destructive" });
    }
  }

  return (
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Tenant Institutions Overview</CardTitle>
            <CardDescription>
            A summary of all organizations currently using EduAI.
            </CardDescription>
        </CardHeader>
        <CardContent>
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
              {data.map((org) => (
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
                           <span className="text-xs text-muted-foreground">{org.email}</span>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={org.status === "Active" ? "default" : "destructive"}
                    >
                      {org.status}
                    </Badge>
                  </TableCell>
                   <TableCell>
                    <div className="font-medium">{org.userCount || 0} / {org.userLimit}</div>
                  </TableCell>
                   <TableCell>
                    <div className="font-medium">{(org.dataConsumption || 0).toFixed(2)} GB</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        {org.status === 'Active' ? (
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => handleSuspend(org.id, org.status)}>
                                <Ban className="mr-2 h-4 w-4"/>
                                Suspend
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem className="text-green-600 focus:bg-green-100 focus:text-green-700" onClick={() => handleSuspend(org.id, org.status)}>
                                <PlayCircle className="mr-2 h-4 w-4"/>
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
