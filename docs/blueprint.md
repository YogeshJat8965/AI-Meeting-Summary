# **App Name**: Insight Extractor

## Core Features:

- Transcript Upload: Enable users to upload meeting transcripts as text or audio files.
- Audio Transcription: Use Whisper API to transcribe uploaded audio files into text. Provide progress status updates to the user during transcription.
- Meeting Summary: Summarize the meeting transcript using the OpenAI GPT-4 API tool. Provide a concise summary of key discussion points.
- Objection Analysis: Use the OpenAI GPT-4 API tool to identify and extract client pain points, objections, and resolutions discussed during the meeting.
- Action Item Extraction: Identify and extract action items and follow-up tasks mentioned in the meeting transcript using the OpenAI GPT-4 API tool.
- Timeline Visualization: Visualize the meeting timeline, mapping discussion topics to specific timestamps. Simulate timestamps where they are not explicitly available in the transcript.
- Data Export: Provide options to export the extracted summary, objections, and action items as JSON and CSV files.

## Style Guidelines:

- Primary color: A vibrant blue (#29ABE2) to convey trust and intelligence. This will be used for primary buttons, highlights, and key interactive elements.
- Background color: A light grey (#F5F5F5) for a clean and professional look. This provides a neutral backdrop that ensures the content and interactive elements stand out.
- Accent color: An analogous green (#2ECC71), used for action confirmations and progress indicators, creating a sense of efficiency. Green naturally conveys successful progress.
- Body and headline font: 'Inter', a sans-serif font known for its modern and readable qualities, ensures a clear presentation.
- Use minimalist icons from a consistent set (e.g., Font Awesome or Material Icons) to represent actions and file types (JSON, CSV) in export options.
- Implement a clean, card-based layout using Tailwind CSS, separating meeting summary, objections, action items, and timeline into distinct sections for easy navigation.
- Use subtle transition animations (e.g., fade-in effects) when displaying summarized content to provide a smooth, user-friendly experience.