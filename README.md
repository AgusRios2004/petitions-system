# 💼 JobFinder - Service Marketplace Platform

![Next.js](https://img.shields.io/badge/Next.js-13-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.18-000000?style=for-the-badge&logo=express&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-ORM-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)

> **Full Stack Marketplace** that connects Customers with Service Providers via a competitive bidding system. Built with a focus on clean architecture, type safety, and efficient data fetching.

## 📖 Project Overview

**JobFinder** acts as an intermediary platform where **Customers** can publish service requests ("Petitions") and **Providers** can submit detailed proposals ("Postulations"). The system facilitates the entire workflow: from the initial request to the negotiation of costs, materials, and the final selection of a winning provider.

This project was developed as a Final Programming Project, emphasizing complex database relationships and a modern frontend UX.

## ✨ Key Features

### 🔄 The "Petition-Postulation" Flow
1.  **Petition Creation:** Customers publish a job request with requirements and attachments.
2.  **Bidding System:** Providers view open petitions and submit a **Postulation**.
3.  **Detailed Proposals:** Postulations include cost breakdown, required materials, estimated time, and file attachments.
4.  **Selection:** The Customer compares proposals in a dashboard and selects a "Winner" to start the job.

### 🛠️ Technical Highlights
* **Role-Based Access:** Distinct interfaces and permissions for *Customers* and *Providers*.
* **Modern Frontend:** Built with **Next.js 13 (App Router)** leveraging Server Components for performance.
* **Data Fetching:** Implemented **React Query (TanStack Query)** for caching, optimistic updates, and invalidation strategies (avoiding prop drilling).
* **Type Safety:** End-to-end typing with **TypeScript** interfaces for Entities and DTOs.
* **Styled with Tailwind:** Responsive and custom UI components (Login, Dashboard Cards, Forms).

## 🏗️ Tech Stack

### Frontend
* **Framework:** Next.js 13 (App Router)
* **Language:** TypeScript
* **Styling:** TailwindCSS
* **State Management:** React Query (TanStack Query)
* **Forms:** React Hook Form (Recommended)

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **ORM:** Sequelize
* **Database:** MySQL / MariaDB
* **Architecture:** MVC with Service Layer

## 🗂️ Database Models

The system relies on a robust relational schema:

* **User (Base):** Authentication and common data.
* **Customer:** Can create `Petitions` and review `Postulations`.
* **Provider:** Has `Availabilities`, `Portfolios`, and creates `Postulations`.
* **Petition:** The core entity representing a job request.
* **Postulation:** The junction entity containing the proposal logic (Cost, Status, Materials).

---

## 🚀 Installation & Setup

### 1. Backend (API)

```bash
cd backend
npm install

# Configure .env
# DB_NAME=jobfinder
# DB_USER=root
# DB_PASS=password

npm run dev
