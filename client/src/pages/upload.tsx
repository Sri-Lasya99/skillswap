import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import UploadCard from "@/components/upload/upload-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContentWithSummary } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";

const Upload = () => {
  const { data: contentList } = useQuery<ContentWithSummary[]>({
    queryKey: ['/api/content'],
  });
  
  return (
    <>
      <Header title="Upload Content" subtitle="Share and summarize learning materials" />
      
      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <UploadCard />
          </div>
          
          <div className="lg:col-span-2">
            <Card className="glass border border-white/5">
              <CardHeader>
                <CardTitle>Your Content</CardTitle>
                <CardDescription>AI-summarized materials you've uploaded</CardDescription>
              </CardHeader>
              <CardContent>
                {contentList && contentList.length > 0 ? (
                  <div className="space-y-4">
                    {contentList.map(content => (
                      <div key={content.id} className="glass border border-white/10 p-4 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 text-white mr-3">
                              <i className={`${content.type === 'pdf' ? 'ri-file-pdf-line' : 'ri-video-line'} text-xl`}></i>
                            </div>
                            <div>
                              <h3 className="font-medium text-white">{content.filename}</h3>
                              <div className="flex items-center mt-1">
                                <span className="text-xs text-muted">{new Date(content.createdAt).toLocaleDateString()}</span>
                                <Badge className="ml-2" variant="secondary">{content.type.toUpperCase()}</Badge>
                                {content.status === 'processing' && <Badge className="ml-2 bg-secondary/20 text-secondary">Processing</Badge>}
                                {content.status === 'complete' && <Badge className="ml-2 bg-primary/20 text-primary">Summarized</Badge>}
                              </div>
                            </div>
                          </div>
                          <div className="text-muted">
                            <button className="hover:text-white transition-colors">
                              <i className="ri-more-2-fill"></i>
                            </button>
                          </div>
                        </div>
                        
                        {content.summary && (
                          <div className="mt-4">
                            <div className="text-sm font-medium mb-2">AI Summary</div>
                            <ScrollArea className="h-32 rounded-lg bg-black/20 p-3 text-sm">
                              <p className="text-white/80">{content.summary}</p>
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted">
                    <div className="text-6xl mb-4"><i className="ri-upload-cloud-line"></i></div>
                    <h3 className="text-lg font-medium mb-2">No content yet</h3>
                    <p className="max-w-md mx-auto">Upload PDF documents or video files to generate AI summaries of your content.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
};

export default Upload;
