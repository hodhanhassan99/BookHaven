# BookHaven DevOps Capstone — Project Explanation

## 1. Git Workflow

The project was developed using Git feature branches and pull requests into `master`.

Each major phase was developed separately to keep changes organized and traceable. Feature branches used included:

- `feature/local-foundation`
- `feature/containerization`
- `feature/cicd-automation`
- `feature/cloud-infrastructure`
- `feature/ansible-completion`
- `feature/kubernetes-orchestration`
- `feature/kubernetes-validation`
- `feature/kubernetes-health-probes`
- `feature/cd-pipeline`
- `feature/cd-semver`

Pull requests were used to review and merge completed work into `master`.

The repository was kept clean by avoiding `.env` files, `node_modules`, and other generated or sensitive files.

## 2. CI/CD Pipeline

GitHub Actions is used to automate the CI/CD process.

The CI workflow runs when code is pushed and installs dependencies before running the available tests.

The CD workflow runs when changes are merged into `master`. It:

1. Checks out the repository.
2. Sets up Docker Buildx.
3. Logs into Docker Hub using GitHub Actions secrets.
4. Builds the backend Docker image.
5. Builds the frontend Docker image.
6. Pushes both images to Docker Hub.

The images use semantic version tags such as `v1.0.0`. SHA and `latest` tags are also maintained for traceability and convenience.

Docker Hub repositories:

- `hodhan/bookhaven-backend`
- `hodhan/bookhaven-frontend`

## 3. Containerization

The backend and frontend each have their own Dockerfile.

The backend container uses a lightweight Node.js base image and exposes port `5000`.

The frontend uses a multi-stage build. The application is built first and the resulting static files are served using Nginx.

Docker Compose is used to run:

- Frontend
- Backend
- MongoDB

MongoDB uses a named volume so database data can survive container restarts.

The Docker images were kept below the project's 400MB target.

## 4. Terraform and Infrastructure

Terraform was used to provision the cloud infrastructure required for the Kubernetes environment.

The infrastructure configuration separates provisioning from application configuration.

Terraform is responsible for creating the required cloud resources, while Ansible is used to configure provisioned systems.

Terraform outputs can be used to provide the information required by the Ansible inventory.

## 5. Ansible Configuration

Ansible was used for configuration management.

The project contains roles for:

- MongoDB setup
- Backend deployment
- Frontend deployment

The purpose of Ansible is to make server configuration repeatable and consistent rather than relying on manual configuration.

## 6. Kubernetes Architecture

The application is deployed on Google Kubernetes Engine (GKE).

The Kubernetes deployment consists of a frontend Deployment, backend Deployment, and MongoDB StatefulSet.

The backend runs as a Kubernetes Deployment using the `hodhan/bookhaven-backend:v1.0.1` image. It exposes port `5000`, uses one replica, and has configured resource requests and limits. Readiness and liveness probes check the `/api/books` endpoint. The backend is exposed through a LoadBalancer Service.

The frontend runs as a Kubernetes Deployment using the `hodhan/bookhaven-frontend:v1.0.3` image. It exposes port `80`, uses one replica, and has configured resource requests and limits. Readiness and liveness probes check `/`. The frontend is exposed through a LoadBalancer Service.

MongoDB runs as a StatefulSet because database workloads require persistent identity and storage. MongoDB uses a StatefulSet, headless Service, PersistentVolumeClaim, persistent storage, resource requests and limits, readiness probes, and liveness probes.

The PersistentVolumeClaim is mounted at `/data/db`. This means MongoDB data is stored independently of the lifecycle of the MongoDB pod. Deleting and recreating the MongoDB pod therefore does not intentionally remove the stored database data.

## 7. Health Probes

Kubernetes health probes were added to improve reliability.

The backend readiness probe checks `/api/books`, and the backend liveness probe also checks `/api/books`.

The frontend readiness and liveness probes check `/`.

MongoDB uses TCP probes against port `27017`.

Readiness probes prevent traffic from being sent to containers that are not ready, while liveness probes allow Kubernetes to detect unhealthy containers and restart them.

## 8. Resource Management

Resource requests and limits are configured for every application container.

This allows Kubernetes to make scheduling decisions based on expected resource requirements and prevents containers from consuming unlimited cluster resources.

## 9. Application Availability

The frontend is exposed through a Kubernetes LoadBalancer.

Live frontend:

http://34.35.14.77

The backend is also exposed through a LoadBalancer.

Backend API:

http://34.35.116.179:5000/api/books

The frontend loads successfully and displays book data retrieved from the backend API.

## 10. Architecture Diagram

```text
                         GitHub Repository
                                |
                                v
                       GitHub Actions CI/CD
                                |
                    +-----------+-----------+
                    |                       |
                    v                       v
             Backend Image            Frontend Image
                    |                       |
                    +-----------+-----------+
                                |
                                v
                           Docker Hub
                                |
                                v
                         Kubernetes / GKE
                                |
              +-----------------+-----------------+
              |                 |                 |
              v                 v                 v
       Frontend Deployment Backend Deployment MongoDB StatefulSet
              |                 |                 |
              v                 v                 v
        LoadBalancer      LoadBalancer       Headless Service
              |                 |                 |
              v                 v                 v
        Live Frontend       Backend API       PersistentVolume
                                                    |
                                                    v
                                               MongoDB Data

Terraform
    |
    v
Cloud Infrastructure

Ansible
    |
    v
Server / Application Configuration


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
   +----> Tests / CI
   |
   +----> Build Docker Images
   |
   +----> Push Images to Docker Hub
   |
   v
Kubernetes / GKE
   |
   +----> Frontend
   |
   +----> Backend
   |
   +----> MongoDB + Persistent Storage
   |
   v
Live BookHaven Application