# Insight Extractor

Insight Extractor is a Next.js application that uses AI to analyze meeting transcripts. You can either paste a text transcript or upload an audio file, and the application will provide a concise summary, identify key objections or pain points, and list actionable follow-up items.

The project is built with Next.js, TypeScript, Tailwind CSS, ShadCN for UI components, and Genkit for the AI-powered features.

## Features

-   **Text & Audio Input**: Analyze meetings by pasting a transcript or uploading an audio file (MP3, WAV, M4A, etc.).
-   **AI-Powered Analysis**:
    -   **Meeting Summary**: Get a concise summary of the key discussion points.
    -   **Objection & Resolution Tracking**: Automatically extract client objections and pain points.
    -   **Action Item Extraction**: Identify all follow-up tasks and action items.
-   **Interactive Timeline**: Visualize when topics were discussed during the meeting.
-   **Export & Share**:
    -   Download insights as JSON or CSV.
    -   Email the summary and action items directly from the app.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 20 or later recommended)
-   [npm](https://www.npmjs.com/) or another package manager like yarn or pnpm

### Setup and Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the root of your project by copying the example:

    ```bash
    cp .env.example .env
    ```

    Now, open the `.env` file and add the following credentials.

    -   `GEMINI_API_KEY`: Your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    -   `GMAIL_EMAIL`: The Gmail address you want to send summary emails from.
    -   `GMAIL_APP_PASSWORD`: A 16-character [Google App Password](https://myaccount.google.com/apppasswords) for the Gmail account.

    Your `.env` file should look like this:

    ```env
    # Google AI
    GEMINI_API_KEY="AIzaSy..."

    # Nodemailer (for sending emails)
    GMAIL_EMAIL="your-email@gmail.com"
    GMAIL_APP_PASSWORD="your16characterapppassword"
    ```

### Running the Application

This project requires two separate processes to run concurrently in development: the Next.js web server and the Genkit AI server.

1.  **Start the Next.js development server:**

    Open a terminal and run:

    ```bash
    npm run dev
    ```

    This will start the web application, typically on `http://localhost:9002`.

2.  **Start the Genkit development server:**

    Open a **second terminal** and run:

    ```bash
    npm run genkit:dev
    ```

    This starts the Genkit server, which makes the AI flows available for the Next.js application to call.

    You can now access the application in your browser and start extracting insights!
