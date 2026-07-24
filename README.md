<div align="center">

<img src="./irth-frontend/public/irth-header.png" alt="IRTH Logo" width="180" />

# IRTH | إرث

### AI-Powered Saudi Architectural Identity Analysis Platform

A smart web platform that analyzes architectural designs and evaluates their alignment with Saudi architectural identity.

[Live Demo](https://irth-saudi-architecture.vercel.app)

</div>

---

## About the Project

IRTH is an AI-powered web platform developed to support the preservation of Saudi architectural identity and improve the architectural design review process.

The platform analyzes uploaded architectural designs based on the **19 Saudi architectural styles** defined by the Saudi Architecture Initiative.

Users can select a city or architectural region, upload a building design, and receive a structured architectural compliance analysis.

The generated result includes:

- Architectural compliance score
- Detected architectural characteristics
- Identified design issues
- Improvement recommendations
- Downloadable analysis report

The current deployed version focuses on providing a direct and simple design-analysis workflow without requiring account registration.

---

## Project Objectives

IRTH aims to:

- Preserve Saudi architectural and cultural identity.
- Help designers understand regional architectural requirements.
- Identify potential design issues before official submission.
- Reduce the time required for initial architectural reviews.
- Provide clear and structured architectural recommendations.
- Support the objectives of Saudi Vision 2030.

---

## Main Features

### City and Region Selection

Users can select the city or architectural region associated with the building design.

### Design Upload

The platform supports uploading architectural designs for AI-based analysis.

### AI Architectural Analysis

The AI Agent examines architectural elements such as:

- Facades
- Windows and openings
- Arches
- Materials
- Colors
- Proportions
- Decorative elements

### Compliance Evaluation

The platform generates a compliance score indicating how well the design aligns with the selected Saudi architectural style.

### Findings and Recommendations

Users receive detailed findings, identified issues, and recommendations for improving the design.

### PDF Report

The analysis result can be exported as a structured PDF report.

### Responsive Design

The interface is designed to work across desktop and mobile devices.

---

## Technology Stack

### Frontend

- React.js
- JavaScript
- HTML5
- CSS3
- React Router
- jsPDF
- html2canvas

### Backend

- Node.js
- Express.js
- REST API
- AI Agent integration
- Multer for file uploads

### Deployment

- Vercel — Frontend
- Render — Backend
- GitHub — Source code and version control

---

## Project Structure

```text
IRTH2026/
│
├── irth-frontend/
│   ├── public/
│   ├── src/
│   ├── .env
│   ├── package.json
│   └── vercel.json
│
├── irth-backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── uploads/
│   ├── reports/
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure the following tools are installed:

- Node.js
- npm
- Git

---

## Backend Setup

Open a terminal and navigate to the backend folder:

```bash
cd irth-backend
```

Install the required packages:

```bash
npm install
```

Create a `.env` file inside `irth-backend`:

```env
GEMINI_API_KEY=your_api_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
PUBLIC_BASE_URL=http://localhost:5000
```

Start the backend server:

```bash
npm start
```

The backend will run at:

```text
http://localhost:5000
```

To test the backend health:

```text
http://localhost:5000/health
```

---

## Frontend Setup

Open another terminal and navigate to the frontend folder:

```bash
cd irth-frontend
```

Install the required packages:

```bash
npm install
```

Create a `.env` file inside `irth-frontend`:

```env
REACT_APP_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm start
```

The frontend will run at:

```text
http://localhost:3000
```

---

## Environment Variables

### Backend

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | API key used by the AI analysis service |
| `NODE_ENV` | Application environment |
| `FRONTEND_URL` | Allowed frontend URL for CORS |
| `PUBLIC_BASE_URL` | Public URL of the backend service |

### Frontend

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | URL of the deployed backend API |

> Environment files are excluded from GitHub to protect API keys and private configuration.

---

## Deployment

### Backend Deployment

The backend is deployed on Render using:

```text
Root Directory: irth-backend
Build Command: npm install
Start Command: npm start
Health Check Path: /health
```

### Frontend Deployment

The frontend is deployed on Vercel using:

```text
Root Directory: irth-frontend
Framework: Create React App
Build Command: npm run build
Output Directory: build
```

---

## Important Notice

IRTH is designed to support architectural review and decision-making. The generated analysis should not replace final evaluation or approval by qualified architects, specialists, or municipal authorities.

---

## Future Improvements

Potential future developments include:

- Construction-site analysis using drone images
- Integration with official municipal platforms
- Expansion of the architectural knowledge base
- AI-generated Saudi architectural design suggestions
- Additional testing with architects and municipality employees
- Advanced analytics and compliance dashboards

---

## Saudi Vision 2030

IRTH contributes to Saudi Vision 2030 by combining cultural preservation with modern technology and encouraging architectural development that maintains authentic Saudi identity.

---

## Repository

This repository contains the frontend and backend source code for the IRTH platform.

```text
https://github.com/RanaAlsaggaf/irth2026
```

---

<div align="center">

### IRTH — Preserving Identity Through Technology

Made with care for Saudi architectural heritage.

</div>