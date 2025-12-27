# Health Habit Tracker – Cloud-Based Web Application

## Overview
Health Habit Tracker is a beginner-friendly cloud-based web application designed to help users track daily health habits such as sleep, steps, and water intake.

The application runs entirely in the browser and connects directly to Firebase for authentication and cloud data storage, without using a traditional backend server.

---

## Technologies Used
- HTML
- CSS
- JavaScript
- Firebase
  - Authentication
  - Firestore Database
  - Cloud Storage

---

## Project Type
Cloud-Based Web Application (Serverless Architecture)

---

## Features
- User authentication (Email/Password & Google Sign-In)
- Secure cloud data storage using Firebase Firestore
- Real-time data synchronization
- Offline data persistence
- Simple and user-friendly interface
- Serverless architecture with Firebase integration

---

## Project Structure
- `index.html` – Application entry point  
- `app.js` – Firebase initialization and authentication logic  
- `dashboard.html` – User dashboard  
- `css/` – Styling files  

---

## How the Application Works
- The application connects to Firebase automatically using the Firebase Web SDK.
- Firebase Authentication handles user login and registration.
- Firestore is used to store and retrieve user health habit data.
- No custom backend server is required.

---

## How to Run the Project
1. Clone or download the repository
2. Open `index.html` in any modern web browser
3. The application connects to Firebase automatically

> No local server, npm installation, or backend setup is required.

---

## Firebase Configuration
This project uses Firebase’s client-side configuration required for browser-based applications.  
All sensitive credentials such as service account keys have been removed and are excluded from the repository for security reasons.

---

## Security Note
- No private Firebase service account keys are included in this repository.
- Firebase Authentication and Firestore Security Rules protect user data.
- Public Firebase configuration is safe and required for client-side applications.

---

## Learning Outcomes
- Understanding serverless web application architecture
- Practical experience with Firebase integration
- Implementing authentication and cloud databases
- Managing real-time and offline data
- Secure handling of cloud configurations
