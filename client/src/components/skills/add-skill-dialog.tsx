import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { skillFormSchema } from "@/lib/utils";

interface AddSkillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const proficiencyLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

const AddSkillDialog = ({ open, onOpenChange }: AddSkillDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<z.infer<typeof skillFormSchema>>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: {
      type: "teach",
      name: "",
      proficiency: "Beginner",
      description: "",
    },
  });
  
  const addSkillMutation = useMutation({
    mutationFn: async (values: z.infer<typeof skillFormSchema>) => {
      return apiRequest("POST", "/api/skills", values);
    },
    onSuccess: () => {
      toast({
        title: "Skill Added",
        description: "Your skill has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/current/skills'] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to add skill",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (values: z.infer<typeof skillFormSchema>) => {
    addSkillMutation.mutate(values);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass p-6 rounded-xl border border-white/10 w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Skill</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-sm text-muted">Skill Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="teach" id="teach" className="text-primary" />
                        <label htmlFor="teach">Teach</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="learn" id="learn" className="text-secondary" />
                        <label htmlFor="learn">Learn</label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-muted">Skill Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. JavaScript, Photography"
                      className="glass-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="proficiency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-muted">Proficiency Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="glass-input">
                        <SelectValue placeholder="Select proficiency level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {proficiencyLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-muted">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly describe your experience or learning goals"
                      className="glass-input resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline"
                className="border-white/20 text-muted hover:text-white hover:border-white/40 transition-colors"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="gradient-button text-white" 
                disabled={addSkillMutation.isPending}
              >
                {addSkillMutation.isPending ? "Adding..." : "Add Skill"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSkillDialog;
