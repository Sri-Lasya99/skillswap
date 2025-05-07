import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const UploadCard = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/content/upload", undefined, {
        processData: false,
        customConfig: {
          method: "POST",
          body: formData,
          headers: {}, // No Content-Type header, let the browser set it
        }
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload successful",
        description: "Your file has been uploaded and is being processed.",
      });
      setFile(null);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0];
      validateAndSetFile(selectedFile);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };
  
  const validateAndSetFile = (file: File) => {
    // Check file type
    const validTypes = ['application/pdf', 'video/mp4'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload either a PDF or MP4 file.",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (100MB)
    const maxSizeInBytes = 100 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast({
        title: "File too large",
        description: "File size must be less than 100MB.",
        variant: "destructive",
      });
      return;
    }
    
    setFile(file);
  };
  
  const handleUpload = () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    uploadMutation.mutate(formData);
  };
  
  return (
    <div className="glass p-6 rounded-xl border border-white/5">
      <h2 className="text-xl font-semibold mb-4">Upload Content</h2>
      <p className="text-sm text-muted mb-6">Upload videos or PDFs to generate AI summaries</p>
      
      <div 
        className={`border-2 border-dashed ${isDragging ? 'border-primary/60' : 'border-white/20'} 
          ${file ? 'border-primary/40' : ''} rounded-lg p-8 text-center 
          hover:border-primary/40 transition-colors cursor-pointer`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        {!file ? (
          <>
            <i className="ri-upload-cloud-line text-4xl text-primary mb-3"></i>
            <p className="text-sm text-muted mb-2">Drag & drop files here or</p>
            <Button className="gradient-button text-white text-sm py-2 px-6 rounded-lg">Browse Files</Button>
            <p className="text-xs text-muted/60 mt-3">Supports: MP4, PDF (max 100MB)</p>
            <input 
              id="fileInput" 
              type="file"
              className="hidden"
              accept=".pdf,.mp4"
              onChange={handleFileSelect}
            />
          </>
        ) : (
          <div className="py-2">
            <i className="ri-file-line text-4xl text-primary mb-3"></i>
            <p className="text-lg text-white mb-2">{file.name}</p>
            <p className="text-sm text-muted mb-4">{(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type.split('/')[1].toUpperCase()}</p>
            <div className="flex space-x-3 justify-center">
              <Button 
                variant="outline" 
                className="border-white/20 text-muted hover:text-white hover:border-white/40"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                className="gradient-button text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload File"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadCard;
