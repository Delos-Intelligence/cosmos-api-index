"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateIndex } from "@/hooks/use-queries";

interface CreateIndexProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateIndex({
  isOpen,
  onOpenChange,
}: CreateIndexProps) {
  const createIndexMutation = useCreateIndex();

  const handleCreateIndex = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const fileInput = formData.get("files") as File;

    if (!name || !fileInput) {
      console.error("Name and file are required");
      return;
    }

    const submitData = new FormData();
    submitData.append("name", name);
    submitData.append("filesobjects", fileInput);

    try {
      await createIndexMutation.mutateAsync(submitData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating index:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">New Index</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Index</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateIndex}>
          <div className="space-y-4">
            <Input name="name" placeholder="Index Name" required />
            <Input
              name="files"
              type="file"
              multiple
              className="cursor-pointer"
              required
            />
            <Button type="submit" className="w-full">
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
