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
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { AcademicPeriod } from "@/lib/data";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { createPeriodAction, updatePeriodAction, deletePeriodAction } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { getAcademicPeriods } from "@/lib/data";
import { LoadingSpinner } from "@/components/loading-spinner";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : children}
    </Button>
  );
}

function PeriodForm({
  period,
  onClose,
}: {
  period?: AcademicPeriod;
  onClose: () => void;
}) {
  const action = period ? updatePeriodAction : createPeriodAction;
  const [state, dispatch] = useActionState(action, { message: null, errors: {} });
  const { toast } = useToast();

  React.useEffect(() => {
    if (state.message) {
        if (Object.keys(state.errors || {}).length > 0) {
            toast({ title: "Error", description: state.message, variant: "destructive" });
        } else {
            toast({ title: "Success", description: state.message });
            onClose();
        }
    }
  }, [state, toast, onClose]);

  const formatDateForInput = (date: Date | undefined) => {
    return date ? format(date, "yyyy-MM-dd") : "";
  };

  return (
    <form action={dispatch}>
      {period && <input type="hidden" name="id" value={period.id} />}
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <div className="col-span-3">
            <Input id="name" name="name" defaultValue={period?.name} />
            {state.errors?.name && <p className="text-destructive text-sm mt-1">{state.errors.name[0]}</p>}
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="startDate" className="text-right">
            Start Date
          </Label>
          <div className="col-span-3">
            <Input id="startDate" name="startDate" type="date" defaultValue={formatDateForInput(period?.startDate)} />
            {state.errors?.startDate && <p className="text-destructive text-sm mt-1">{state.errors.startDate[0]}</p>}
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="endDate" className="text-right">
            End Date
          </Label>
          <div className="col-span-3">
            <Input id="endDate" name="endDate" type="date" defaultValue={formatDateForInput(period?.endDate)} />
            {state.errors?.endDate && <p className="text-destructive text-sm mt-1">{state.errors.endDate[0]}</p>}
          </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
        </DialogClose>
        <SubmitButton>{period ? "Save Changes" : "Create Period"}</SubmitButton>
      </DialogFooter>
    </form>
  );
}

function DeletePeriodDialog({ periodId, onDeleted }: { periodId: string, onDeleted: () => void }) {
    const {toast} = useToast();
    const handleDelete = async () => {
        const result = await deletePeriodAction(periodId);
        if (result.message) {
            toast({ title: "Success", description: result.message });
            onDeleted();
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
        } catch (error) {
            console.error("Failed to fetch academic periods:", error);
            toast({ title: "Error", description: "Could not fetch academic periods.", variant: "destructive" });
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

    if (loading) {
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
                        <DeletePeriodDialog periodId={period.id} onDeleted={() => { setMenuOpen(null); if (claims?.organizationId) fetchData(claims.organizationId); }}/>
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
            <PeriodForm period={currentPeriod} onClose={handleDialogClose} />
            </DialogContent>
        </Dialog>

    </>
  );
}
