🌐 Live Website
-----------------------------------
http://32516assignment2kunwang25042870.us-east-1.elasticbeanstalk.com/

🔐 Test Account Credentials
-----------------------------------
Email: john.doe@example.com  
Password: Password123



==============================
  Project Deployment Guide
==============================

📌 Project Overview
-----------------------------------
This is a full-stack web application built with React.js and Node.js. It includes:

- A modern and responsive user interface
- Functional search and navigation
- User login system
- API integration and data interaction
- Static assets support and page routing

The frontend is built with React, and the backend is powered by a standalone Next.js server with integrated routing and static file handling.

⚙️ Architecture Summary
-----------------------------------
Deployment package structure:

- server.js             ← Entry point of the Next.js server
- .next/static/         ← Static assets (CSS, JS chunks)
- public/               ← Public resources like images
- package.json          ← Project dependencies
- Procfile              ← Startup command for Elastic Beanstalk: web: node server.js

Deployment Type: Next.js Standalone Mode + Static Hosting

☁️ Deployment Platform
-----------------------------------
Platform: AWS Elastic Beanstalk  
Environment: Node.js 22 on 64bit Amazon Linux 2023  
Deployment Method: Upload ZIP package with Procfile for server launch

