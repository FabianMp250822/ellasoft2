
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
import { Textarea } from "@/components/ui/textarea";
import type { GradingSystem } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { getGradingSystems, updateGradingSystem, deleteGradingSystem } from "@/lib/data";
import { LoadingSpinner } from "@/components/loading-spinner";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

function GradingSystemForm({
  system,
  organizationId,
  onClose,
}: {
  system?: GradingSystem;
  organizationId: string;
  onClose: () => void;
}) {
  const [name, setName] = React.useState(system?.name || "");
  const [description, setDescription] = React.useState(system?.description || "");
  const [scale, setScale] = React.useState(system?.scale || "");
  const [isSubmitting, setSubmitting] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
        if (system) {
            await updateGradingSystem(system.id, { name, description, scale });
            toast({ title: "Success", description: "Grading system updated successfully." });
        } else {
            const createGradingSystemFn = httpsCallable(functions, 'createGradingSystem');
            await createGradingSystemFn({ organizationId, name, description, scale });
            toast({ title: "Success", description: "Grading system created successfully." });
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
          <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Numerical (0-5)"
              className="col-span-3"
            />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the grading system"
              className="col-span-3"
            />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="scale" className="text-right">
            Scale
          </Label>
          <Input
              id="scale"
              value={scale}
              onChange={(e) => setScale(e.target.value)}
              placeholder="e.g., 0.0-5.0"
              className="col-span-3"
            />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost" type="button">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : (system ? "Save Changes" : "Create System")}
        </Button>
      </DialogFooter>
    </form>
  );
}

function DeleteSystemDialog({ systemId, onDeleted }: { systemId: string, onDeleted: () => void }) {
    const {toast} = useToast();
    const handleDelete = async () => {
        try {
            await deleteGradingSystem(systemId);
            toast({ title: "Success", description: "Grading system deleted successfully." });
            onDeleted();
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
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
                        This action cannot be undone. This will permanently delete the grading system.
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

export function GradingSystemsClient() {
  const [data, setData] = React.useState<GradingSystem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const [isMenuOpen, setMenuOpen] = React.useState<string | null>(null);
  const [currentSystem, setCurrentSystem] = React.useState<
    GradingSystem | undefined
  >(undefined);
  const { user, claims } = useAuth();
  const { toast } = useToast();

  const fetchData = React.useCallback(async (orgId: string) => {
    setLoading(true);
    try {
      const systems = await getGradingSystems(orgId);
      setData(systems);
    } catch (error) {
      console.error("Failed to fetch grading systems:", error);
      toast({ title: "Error", description: "Could not fetch grading systems.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (user && claims?.organizationId) {
      fetchData(claims.organizationId);
    }
  }, [user, claims, fetchData]);

  const handleEdit = (system: GradingSystem) => {
    setCurrentSystem(system);
    setDialogOpen(true);
    setMenuOpen(null);
  };

  const handleCreate = () => {
    setCurrentSystem(undefined);
    setDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentSystem(undefined);
    if (claims?.organizationId) fetchData(claims.organizationId);
  }

  if (loading || !claims?.organizationId) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create System
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Scale</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((system) => (
              <TableRow key={system.id}>
                <TableCell className="font-medium">{system.name}</TableCell>
                <TableCell>{system.description}</TableCell>
                <TableCell>{system.scale}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu onOpenChange={(isOpen) => setMenuOpen(isOpen ? system.id : null)} open={isMenuOpen === system.id}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(system)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DeleteSystemDialog systemId={system.id} onDeleted={() => { setMenuOpen(null); if (claims?.organizationId) fetchData(claims.organizationId);}} />
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
            <DialogTitle>{currentSystem ? "Edit System" : "Create System"}</DialogTitle>
            <DialogDescription>
              {currentSystem
                ? "Make changes to the grading system here. Click save when you're done."
                : "Add a new grading system to your institution."}
            </DialogDescription>
          </DialogHeader>
          <GradingSystemForm system={currentSystem} organizationId={claims.organizationId} onClose={handleDialogClose} />
        </DialogContent>
      </Dialog>
    </>
  );
}
