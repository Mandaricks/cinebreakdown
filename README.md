# 🎬 CineBreakdown: AI-Powered Script Breakdown Assistant (v1.3)

## Project Overview
**CineBreakdown** is a cutting-edge web application designed to revolutionize film pre-production. Acting as a "Digital First Assistant Director (1st AD)," the tool leverages advanced multimodal models (Google Gemini 1.5) to ingest raw scripts and automatically generate:
1.  Technical Breakdown (Scene Breakdown);
2.  Shot Lists;
3.  Art Direction and Costume Design;
4.  Visual Storyboards;
5.  Exportable Production Reports.

---

## 🏗 System Architecture & Tech Stack

### Core Framework
- **Frontend**: React 18 (SPA) with TypeScript.
- **Build Tool**: Vite.
- **Styling**: Tailwind CSS (Utility-first, responsive design, and native dark mode).
- **State Management**: React Hooks (useState, useEffect) + LocalStorage for session persistence.

### AI Integration Layer (`@google/generative-ai`)
The system's intelligence is segmented into stages to optimize tokens and accuracy:
1.  **Structural Analysis (Gemini 1.5 Flash)**: Extracts script metadata, identifies cast and props, and generates scene summaries.
2.  **Shot List Generation (Gemini 1.5 Flash)**: Acts as a Director of Photography (DoP) to generate technical shots and create optimized *Visual Prompts*.
3.  **Visual Generation (Gemini 1.5 Flash Image)**: Renders storyboards and concept art based on the *Visual Prompts*.

---

## 🚀 Key Features & Workflows (Prompt Language)

### 1. Ingestion & Analysis Engine
**PROMPT:** "You are an experienced 1st Assistant Director. Analyze the provided script (PDF or raw text). Your task is to perform a complete breakdown and return a JSON object containing: a list of all scenes with their header, summary, characters, and props (both explicit and implicit); a complete list of characters with role classification (Protagonist, Supporting, Extra) and detailed costume suggestions; and a list of all unique locations. The output language must be Brazilian Portuguese."

### 2. Interactive Scene Board
**PROMPT:** "For each scene, generate a detailed shot list. You are a Director of Photography. For each shot, define the size, angle, movement, subject, and a detailed action description. Also, create a concise, visually descriptive prompt in English for an AI image generator to create a storyboard frame. Ensure that character descriptions in the visual prompts are consistent with the global character metadata."

### 3. Character & Art Management
**PROMPT:** "Given a list of characters and their updated descriptions, your task is to scan all existing shot lists in all scenes. If a character's appearance has changed, you must rewrite the 'visual_prompt' for every shot they appear in to reflect the new description, while preserving the original camera composition and action."

### 4. Production Office (Exports)
**PROMPT:** "Consolidate all generated data (scene breakdown, character lists, shot lists, and generated images) into a professional production bible document in PDF format. Also, create a ZIP archive containing all storyboard images and CSV files for production reports (schedules, cast lists, costume sheets)."

---

## 🔮 Future Roadmap (Next Modules)

1.  **Budgeting AI Module**: Estimate production costs based on breakdown data.
2.  **Continuity Assistant**: Analyze the timeline to detect script inconsistencies.
3.  **Video Integration**: Transform static storyboards into simple animatics.
4.  **Real-time Collaboration**: Migrate to a backend to allow simultaneous editing.

---

## 🛠 Setup & Deployment

```bash
# Installation
npm install

# Development
npm run dev

# Production
npm run build
```
