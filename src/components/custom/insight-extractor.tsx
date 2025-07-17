"use client";

import { useState, useTransition, type FormEvent, type ChangeEvent, useRef } from 'react';
import { BrainCircuit, FileText, AlertOctagon, ListChecks, Clock, Download, Mail, UploadCloud, FileAudio } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { processMeeting, sendEmail } from '@/app/actions';
import { exportAsJson, exportAsCsv } from '@/lib/export';
import type { ResultState } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const InsightExtractor = () => {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<ResultState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'audio'>('text');
  const [file, setFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResults(null);
    setError(null);
    const formData = new FormData(event.currentTarget);
    
    if (activeTab === 'text' && !formData.get('transcript')?.toString().trim()) {
      setError("Please paste a transcript.");
      return;
    }
    if (activeTab === 'audio' && !file) {
      setError("Please select an audio file.");
      return;
    }

    startTransition(async () => {
      if (activeTab === 'audio' && file) {
        if (!file.type.startsWith("audio/")) {
            setError("Invalid file type. Please upload an audio file.");
            toast({
              variant: "destructive",
              title: "Invalid File Type",
              description: "Please upload a valid audio file.",
            });
            return;
        }
        try {
            const audioDataUri = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === 'string') {
                  resolve(reader.result);
                } else {
                  reject(new Error('Failed to read file as Data URI'));
                }
              };
              reader.onerror = (error) => reject(error);
              reader.readAsDataURL(file);
            });
            formData.append('audioDataUri', audioDataUri);
        } catch (e) {
            setError("Could not read the audio file.");
            toast({
              variant: "destructive",
              title: "File Read Error",
              description: "There was a problem reading your audio file.",
            });
            return;
        }
      }

      const result = await processMeeting(formData);
      if (result.error) {
        setError(result.error);
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: result.error,
        });
      } else {
        setResults(result.data);
      }
    });
  };

  const handleEmail = async () => {
    if (!results) return;
    startTransition(async () => {
        const { message } = await sendEmail(results);
        toast({
            title: "Email",
            description: message,
        });
    });
  };
  
  const handleExportJson = () => {
    if (!results) return;
    exportAsJson(results, 'meeting_insights');
  };

  const handleExportCsv = () => {
    if (!results) return;
    exportAsCsv(results, 'meeting_insights');
  };

  const Timeline = ({ transcript }: { transcript: string }) => {
    const sentences = transcript.split(/[.?!]/).filter(s => s.trim().length > 5);
    if(sentences.length === 0) return null;

    const totalDuration = 30; // Assume 30 minutes
    const chunks: string[][] = [];
    const numChunks = Math.min(sentences.length, 5); // Max 5 points on timeline
    const chunkSize = Math.ceil(sentences.length / numChunks);
  
    for (let i = 0; i < sentences.length; i += chunkSize) {
      chunks.push(sentences.slice(i, i + chunkSize));
    }
  
    return (
      <div className="relative w-full h-20 flex items-center">
        <div className="w-full h-1 bg-primary/20 rounded-full" />
        <div className="absolute w-full h-full top-0 left-0 flex items-center justify-between">
        {chunks.map((chunk, index) => {
          const percentage = chunks.length > 1 ? (index / (chunks.length - 1)) * 100 : 50;
          const timeInMinutes = (percentage / 100) * totalDuration;
  
          return (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="absolute top-1/2 w-4 h-4 bg-primary rounded-full -translate-y-1/2 -translate-x-1/2 cursor-pointer transition-all hover:scale-125"
                    style={{ left: `${percentage}%` }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-bold text-base">~{Math.round(timeInMinutes)} min</p>
                  <p className="max-w-xs text-sm text-muted-foreground">{chunk.join('. ')}.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
        </div>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="space-y-6 animate-fade-in">
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </CardContent>
            </Card>
        </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <header className="text-center mb-10">
        <div className="inline-flex items-center gap-4">
          <BrainCircuit className="h-12 w-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Insight Extractor</h1>
        </div>
        <p className="mt-4 text-lg text-muted-foreground">
          Upload a meeting transcript or audio file to generate a summary, identify objections, and extract action items.
        </p>
      </header>

      <Card className="mb-8 shadow-lg">
        <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'text' | 'audio')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Paste Transcript</TabsTrigger>
            <TabsTrigger value="audio">Upload Audio</TabsTrigger>
          </TabsList>
          <form ref={formRef} onSubmit={handleSubmit}>
            <TabsContent value="text" className="mt-4">
                <Textarea
                    name="transcript"
                    placeholder="Paste your meeting transcript here..."
                    className="min-h-[200px] text-base"
                    disabled={isPending}
                />
            </TabsContent>
            <TabsContent value="audio" className="mt-4">
                <div className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg">
                    <UploadCloud className="w-12 h-12 text-muted-foreground" />
                    <Input id="file" name="file" type="file" className="hidden" accept="audio/*" onChange={handleFileChange} disabled={isPending}/>
                    <label htmlFor="file" className="mt-4 font-medium text-primary underline cursor-pointer">
                        {file ? "Change file" : "Choose an audio file"}
                    </label>
                    {file ? (
                        <p className="mt-2 text-sm text-muted-foreground flex items-center gap-2"><FileAudio className="w-4 h-4"/> {file.name}</p>
                    ) : (
                        <p className="mt-2 text-sm text-muted-foreground">MP3, WAV, M4A, etc.</p>
                    )}
                </div>
            </TabsContent>
            <Button type="submit" className="w-full mt-6 text-lg py-6" disabled={isPending}>
                {isPending ? "Extracting Insights..." : "Extract Insights"}
            </Button>
            {error && <p className="text-destructive mt-4 text-center">{error}</p>}
          </form>
        </Tabs>
        </CardContent>
      </Card>
      
      {isPending && <LoadingSkeleton />}

      {results && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="outline" onClick={handleExportJson} disabled={isPending}><Download className="mr-2 h-4 w-4"/> JSON</Button>
            <Button variant="outline" onClick={handleExportCsv} disabled={isPending}><Download className="mr-2 h-4 w-4"/> CSV</Button>
            <Button onClick={handleEmail} disabled={isPending}><Mail className="mr-2 h-4 w-4"/> Email Summary</Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl"><FileText/> Meeting Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">{results.summary}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl"><AlertOctagon/> Objections & Resolutions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {results.objections.map((item, i) => <li key={i} className="text-base">{item}</li>)}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl"><ListChecks/> Action Items</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {results.actionItems.map((item, i) => <li key={i} className="text-base">{item}</li>)}
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl"><Clock/> Meeting Timeline</CardTitle>
                <CardDescription>A visual representation of when topics were likely discussed.</CardDescription>
            </CardHeader>
            <CardContent>
                <Timeline transcript={results.transcript} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InsightExtractor;
