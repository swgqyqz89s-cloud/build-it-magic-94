# AI Cover Letter Generator

Generate personalized cover letters using local AI (Ollama).

## Prerequisites

1. **Install Ollama**: Download from [ollama.ai](https://ollama.ai)
2. **Pull the llama3 model**:
   ```bash
   ollama pull llama3
   ```

## Local Setup & Running

1. **Clone the repository** (see "How can I edit this code?" section below)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start Ollama** (in a separate terminal):
   ```bash
   OLLAMA_ORIGINS="http://localhost:5173" ollama serve
   ```
   
   Then in another terminal:
   ```bash
   ollama run llama3
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:5173`

## How It Works

1. Upload your CV (optional)
2. Paste the job description
3. AI analyzes and asks gap-filling questions
4. Answer the questions (optional)
5. AI generates a personalized cover letter
6. Get a matching score analysis

## Important Notes

- Make sure Ollama is running on `localhost:11434` before using the app
- The app connects directly to your local Ollama instance
- All AI processing happens locally on your machine
- No data is sent to external servers

## Troubleshooting

If you get connection errors:
- Verify Ollama is running: `curl http://localhost:11434/api/tags`
- Make sure the llama3 model is downloaded: `ollama list`
- Check that CORS is enabled with `OLLAMA_ORIGINS="http://localhost:5173"`

---

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/ec250649-be18-4a6d-a368-131270904d5e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ec250649-be18-4a6d-a368-131270904d5e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ec250649-be18-4a6d-a368-131270904d5e) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
