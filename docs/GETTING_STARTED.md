# Getting Started with n8n Ultimate

Welcome to **n8n Ultimate** – an AI-powered toolkit that generates, validates, and optimizes n8n workflows in minutes.

> **Who is this for?**  Anyone who wants to automate tasks with n8n, from no-code enthusiasts to experienced developers.

---

## 1. Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 16 | Runtime for TypeScript/JavaScript tooling |
| npm or yarn | latest | Package manager |
| n8n | latest (npm install ‑g) | Workflow engine |
| Ollama | latest | Runs local AI models |
| Git | latest | Clone & manage the repo |

Ensure each is on your `PATH`:
```bash
node -v
npm -v
n8n --version
ollama --version
```

---

## 2. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd n8n-ultimate

# Install dependencies
npm install

# (Optional) Pull recommended local models
ollama pull deepseek-r1:1.5b
ollama pull hf.co/unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF:Q4_K_XL
```

---

## 3. Build the Project

The TypeScript source lives in `src/`. Compile it to `dist/`:
```bash
npm run build      # runs tsc
```
If you see _0 errors_, you're good to go.  
If not, run our validators (next step) to pinpoint issues.

---

## 4. Validate Your Environment

After a fresh clone you can confirm everything works:
```bash
# Run the master validation script
node dist/run-validation.js workflows/hubspot-mixpanel-integration.json
```
Expected output – a summary of broken connections / misconfigured nodes (if any).

---

## 5. Launch n8n & Import Your First Workflow

```bash
# Start n8n in another terminal
n8n start
```

1. Open `http://localhost:5678` in your browser.  
2. Click **"Import from File"** and choose any file in `workflows/`.  
3. Press **"Execute Workflow"** to see it run.

---

## 6. Using AI-Powered Generation

Inside this project we use **Task Master AI** plus internal generators to turn plain-language ideas into workflows.

Quick demo via CLI (advanced users):
```bash
node dist/generators/workflow-generator.js --prompt "Create a workflow that fetches RSS feed items and posts them to Slack"
```
Or simply tell the AI assistant in Cursor and it will orchestrate the tools for you.

---

## 7. Next Steps

1. Read **docs/BEGINNER_TUTORIAL.md** for a hands-on walkthrough.  
2. Explore **docs/ADVANCED_EXAMPLES.md** for more complex scenarios.  
3. Dive into **docs/N8N_WORKFLOW_DEBUGGING.md** to learn systematic debugging.  
4. Contribute! Open issues, PRs, or improve docs.

Happy automating! 🚀 