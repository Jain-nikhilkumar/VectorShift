# VectorShift Frontend Technical Assessment — Complete Solution

## 📁 File Placement

Replace / add these files in your project:

### Frontend (`/frontend/src/`)
- `App.js` — replace
- `index.css` — replace
- `store.js` — replace
- `submit.js` — replace
- `toolbar.js` — replace
- `draggableNode.js` — replace
- `ui.js` — replace
- `nodes/BaseNode.js` — NEW (the abstraction)
- `nodes/inputNode.js` — replace
- `nodes/outputNode.js` — replace
- `nodes/llmNode.js` — replace
- `nodes/textNode.js` — replace
- `nodes/filterNode.js` — NEW
- `nodes/mathNode.js` — NEW
- `nodes/apiNode.js` — NEW
- `nodes/delayNode.js` — NEW
- `nodes/databaseNode.js` — NEW

### Frontend root
- `package.json` — replace (adds `zustand` dependency)

### Backend
- `main.py` — replace

---

## 🚀 Run Instructions

### One-time setup

**Frontend** (in `/frontend`):
```bash
npm install
```

**Backend** (in `/backend`):
```bash
pip install fastapi uvicorn
```

### Run

**Terminal 1 — Backend:**
```bash
cd backend
uvicorn main:app --reload
```
Backend runs on `http://localhost:8000`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```
Frontend runs on `http://localhost:3000`

---

## ✅ What's Included

### Part 1 — Node Abstraction ✓
- `BaseNode.js` is a single reusable component that handles header, body, fields, and handles
- All 4 original nodes refactored to use it
- **5 new nodes**: Filter, Math, API, Delay, Database

### Part 2 — Styling ✓
- Modern gradient header
- Color-coded nodes with icons
- Hover effects on toolbar items and submit button
- Soft shadows, rounded corners, clean typography
- Styled minimap and controls

### Part 3 — Text Node Logic ✓
- Textarea auto-resizes width AND height as you type
- `{{ variableName }}` regex parsing creates dynamic input handles on the left
- Labels next to each handle show variable name
- Variables list shown below the textarea

### Part 4 — Backend Integration ✓
- `submit.js` POSTs `{nodes, edges}` to `/pipelines/parse`
- Backend uses Kahn's algorithm for DAG detection
- CORS enabled for the frontend
- User-friendly alert displays results

---

## 🧪 Test the DAG Logic

1. Drag 3 nodes onto the canvas (e.g. Input → LLM → Output)
2. Connect them in order → click Submit → `is_dag: true` ✓
3. Connect Output back to Input (creating a cycle) → Submit → `is_dag: false` ✘
