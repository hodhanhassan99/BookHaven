# BookHaven

BookHaven is a MERN stack library catalog application consisting of a React frontend, Node.js/Express backend, and MongoDB database.

This project was extended as part of the eMobilis DevOps Engineering Course final capstone to demonstrate Git workflows, CI/CD, containerization, cloud infrastructure, Ansible configuration management, and Kubernetes orchestration on GKE.

## Live Application

**Frontend:**
http://34.35.14.77

**Backend API:**
http://34.35.116.179:5000/api/books

The frontend is publicly accessible and retrieves book data from the backend API.

## Technology Stack

- React
- Node.js
- Express
- MongoDB
- Docker
- Docker Compose
- GitHub Actions
- Docker Hub
- Terraform
- Ansible
- Kubernetes
- Google Kubernetes Engine (GKE)

## Project Architecture

```text
Developer
    |
    v
Git Feature Branch
    |
    v
Pull Request
    |
    v
master
    |
    v
GitHub Actions
    |
    +----> CI Tests
    |
    +----> Build Docker Images
    |
    +----> Push Images to Docker Hub
    |
    v
Kubernetes / GKE
    |
    +----> Frontend Deployment
    |
    +----> Backend Deployment
    |
    +----> MongoDB StatefulSet
    |             |
    |             v
    |       Persistent Storage
    |
    v
LoadBalancer Services
    |
    v
Live BookHaven Application