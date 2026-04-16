# VTON - AI Virtual Try-On Portfolio

An AI-powered application that allows users to virtually "try on" clothing by superimposing garments onto uploaded photos using machine learning.

## 🚀 Project Structure

```text
.
├── backend/             # FastAPI Server (Python)
├── Frontend/            # React + Vite UI (JSX)
└── vton_env/            # Python Virtual Environment


🛠️ Tech Stack
Frontend: React, Vite, Tailwind CSS

Backend: FastAPI, Uvicorn, Python 3.10

AI/ML: PyTorch, Torchvision (Virtual Try-On Pipeline)

⚙️ Setup & Installation
1. Backend Setup
Navigate to the backend directory and activate your virtual environment:

PowerShell
cd backend
..\vton_env\Scripts\activate
# If you haven't installed dependencies yet:
# pip install fastapi uvicorn torch torchvision
uvicorn main:app --reload
2. Frontend Setup
Open a new terminal and navigate to the Frontend directory:

PowerShell
cd Frontend
npm install
npm run dev
📸 Key Features
Image Upload: Upload a personal photo and a garment image.

AI Processing: Uses a deep learning model to realistically overlay the garment.

Interactive UI: Built with React for a smooth, responsive user experience.

Fast Execution: Backend powered by FastAPI for high-performance API calls.

📝 Roadmap
[x] Initial Project Structure

[x] Backend API Setup

[x] Frontend UI Components

[ ] Integration with AI Model Weights

[ ] Cloud Deployment (GitHub Pages/Vercel/Render)
