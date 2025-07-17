import { config } from 'dotenv';
config();

import '@/ai/flows/extract-objections.ts';
import '@/ai/flows/transcribe-audio.ts';
import '@/ai/flows/extract-action-items.ts';
import '@/ai/flows/summarize-meeting.ts';
