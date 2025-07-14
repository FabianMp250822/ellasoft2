
"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Trash2, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { AcademicPeriod } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { getAcademicPeriods } from "@/lib/data";
import { LoadingSpinner } from "@/components/loading-spinner";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

const manageAcademicPeriodsFn = httpsCallable(functions, 'manageAcademicPeriods');

function PeriodForm({
  period,
  organizationId,
  onClose,
}: {
  period?: AcademicPeriod;
  organizationId: string;
  onClose: () => void;
}) {
  const [name, setName] = React.useState(period?.name || "");
  const [startDate, setStartDate] = React.useState(period?.startDate ? format(period.startDate, "yyyy-MM-dd") : "");
  const [endDate, setEndDate] = React.useState(period?.endDate ? format(period.endDate, "yyyy-MM-dd") : "");
  const [isSubmitting, setSubmitting] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
        const data = { name, startDate, endDate };
        if (period) {
            await manageAcademicPeriodsFn({ action: 'update', periodId: period.id, organizationId, data });
            toast({ title: "Success", description: "Period updated successfully." });
        } else {
            await manageAcademicPeriodsFn({ action: 'create', organizationId, data });
            toast({ title: "Success", description: "Period created successfully." });
        }
        onClose();
    } catch (error: any) {
        console.error("Error submitting form:", error);
        toast({ title: "Error", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="startDate" className="text-right">
            Start Date
          </Label>
          <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="endDate" className="text-right">
            End Date
          </Label>
          <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
            <Button variant="ghost" type="button">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : (period ? "Save Changes" : "Create Period")}
        </Button>
      </DialogFooter>
    </form>
  );
}

function DeletePeriodDialog({ period, organizationId, onDeleted }: { period: AcademicPeriod, organizationId: string, onDeleted: () => void }) {
    const {toast} = useToast();
    const handleDelete = async () => {
        try {
            await manageAcademicPeriodsFn({ action: 'delete', periodId: period.id, organizationId });
            toast({ title: "Success", description: "Period deleted successfully." });
            onDeleted();
        } catch (e: any) {
             const message = e.code === 'permission-denied' ? "Permission Denied: You do not have the required permissions." : `An error occurred: ${e.message}`;
            toast({ title: "Error", description: message, variant: "destructive" });
        }
    }
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the academic period.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}


export function PeriodsClient() {
    const [data, setData] = React.useState<AcademicPeriod[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isDialogOpen, setDialogOpen] = React.useState(false);
    const [isMenuOpen, setMenuOpen] = React.useState<string | null>(null);
    const [currentPeriod, setCurrentPeriod] = React.useState<AcademicPeriod | undefined>(undefined);
    const { user, claims } = useAuth();
    const { toast } = useToast();

    const fetchData = React.useCallback(async (orgId: string) => {
        setLoading(true);
        try {
            const periods = await getAcademicPeriods(orgId);
            setData(periods);
        } catch (error: any) {
            console.error("Failed to fetch academic periods:", error);
            const description = error.code === 'permission-denied' 
                ? "You do not have permission to view academic periods."
                : "Could not fetch academic periods.";
            toast({ title: "Error", description, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        if (user && claims?.organizationId) {
            fetchData(claims.organizationId);
        }
    }, [user, claims, fetchData]);

    const handleEdit = (period: AcademicPeriod) => {
        setCurrentPeriod(period);
        setDialogOpen(true);
        setMenuOpen(null);
    };

    const handleCreate = () => {
        setCurrentPeriod(undefined);
        setDialogOpen(true);
    };
    
    const handleDialogClose = () => {
        setDialogOpen(false);
        setCurrentPeriod(undefined);
        if (claims?.organizationId) fetchData(claims.organizationId);
    };

    if (loading || !claims?.organizationId) {
        return <LoadingSpinner />;
    }

  return (
    <>
        <div className="flex justify-end mb-4">
            <Button onClick={handleCreate}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Period
            </Button>
        </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((period) => (
              <TableRow key={period.id}>
                <TableCell className="font-medium">{period.name}</TableCell>
                <TableCell>{format(period.startDate, "PPP")}</TableCell>
                <TableCell>{format(period.endDate, "PPP")}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu onOpenChange={(isOpen) => setMenuOpen(isOpen ? period.id : null)} open={isMenuOpen === period.id}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(period)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                        <DeletePeriodDialog period={period} organizationId={claims.organizationId} onDeleted={() => { setMenuOpen(null); if (claims?.organizationId) fetchData(claims.organizationId); }}/>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>{currentPeriod ? "Edit Period" : "Create Period"}</DialogTitle>
                <DialogDescription>
                {currentPeriod ? "Make changes to the academic period here. Click save when you're done." : "Add a new academic period to your institution."}
                </DialogDescription>
            </DialogHeader>
            <PeriodForm period={currentPeriod} organizationId={claims.organizationId} onClose={handleDialogClose} />
            </DialogContent>
        </Dialog>

    </>
  );
}
