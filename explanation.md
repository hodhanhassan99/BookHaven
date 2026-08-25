# BookHaven DevOps Capstone — Project Explanation

## 1. Git Workflow

The BookHaven project was developed using a feature-branch workflow with pull requests used to merge completed work into the `master` branch.

Each major phase was developed separately so that changes remained organized, traceable, and easier to review.

Feature branches used during development included:

* `feature/local-foundation`
* `feature/containerization`
* `feature/cicd-automation`
* `feature/cloud-infrastructure`
* `feature/ansible-completion`
* `feature/kubernetes-orchestration`
* `feature/kubernetes-validation`
* `feature/kubernetes-health-probes`
* `feature/cd-pipeline`
* `feature/cd-semver`
* `feature/documentation`
* `fix/ci-node-version`

Changes were committed using descriptive commit messages, pushed to GitHub, reviewed through pull requests, and merged into `master`.

The repository also maintains a clean `.gitignore` that prevents sensitive and generated files from being committed. This includes:

* `.env` files
* `node_modules`
* Terraform state files
* Terraform variable files
* local development configuration
* editor and IDE files

This workflow provides traceable development history and separates work into logical project phases.

## 2. CI/CD Pipeline

GitHub Actions is used to automate continuous integration and continuous delivery.

### Continuous Integration

The CI workflow runs on every push to the repository.

The workflow:

1. Checks out the repository.
2. Sets up the required Node.js environment.
3. Installs application dependencies.
4. Runs the available application tests.

This allows errors to be detected automatically before changes are considered complete.

### Continuous Delivery

The CD workflow runs when changes are pushed to the `master` branch.

The workflow:

1. Checks out the repository.
2. Sets up Docker Buildx.
3. Logs into Docker Hub using GitHub Actions repository secrets.
4. Builds the backend Docker image.
5. Builds the frontend Docker image.
6. Applies semantic version tags.
7. Pushes the images to Docker Hub.

The Docker images use semantic version tags such as `v1.0.0`, allowing releases to be identified and reproduced more easily. A `latest` tag is also maintained for convenience.

Docker Hub repositories:

* `hodhan/bookhaven-backend`
* `hodhan/bookhaven-frontend`

The CI and CD workflows were successfully executed, with both GitHub Actions checks completing successfully.

This automation creates a repeatable path from source-code changes to container images ready for deployment.

## 3. Containerization

BookHaven consists of:

* React frontend
* Node.js/Express backend
* MongoDB database

The frontend and backend have separate Dockerfiles.

### Backend

The backend container uses a lightweight Node.js base image and exposes port `5000`.

The container packages the Node.js application and its production dependencies so that the backend can run consistently across environments.

### Frontend

The frontend uses a multi-stage Docker build.

The first stage installs dependencies and builds the React application. The resulting production files are then copied into an Nginx image.

Nginx serves the generated static files on port `80`.

Using a multi-stage build prevents development dependencies and build tooling from unnecessarily increasing the size of the final production image.

### Docker Compose

Docker Compose is provided for local orchestration of the complete application.

The Compose configuration runs:

* Frontend
* Backend
* MongoDB

The containers communicate through the Docker Compose network using service names rather than hard-coded container IP addresses.

MongoDB uses a named volume for persistent storage. This allows database data to survive container restarts and container recreation.

Docker image tags follow semantic-versioning conventions, and the images were kept within the project's target of less than 400 MB.

## 4. Terraform and Infrastructure as Code

Terraform was used to define cloud infrastructure as code.

The Terraform configuration provisions the infrastructure required for the project environment, including:

* Virtual Private Cloud
* Public subnet
* Internet Gateway
* Route table
* Route table association
* Security group
* EC2 compute instance

Variables make the infrastructure configuration reusable and easier to modify, while Terraform outputs expose useful information such as the public IP address of the provisioned node.

Terraform separates infrastructure provisioning from configuration management.

Terraform is responsible for provisioning infrastructure, while Ansible is responsible for configuring the provisioned server.

The Terraform public-IP output was used to populate the Ansible inventory. Manual copying of the Terraform output was used, which is permitted by the project requirements. Dynamic inventory could be implemented as a future improvement.

This Infrastructure-as-Code approach makes the infrastructure configuration repeatable and reduces reliance on manually created cloud resources.

## 5. Ansible Configuration Management

Ansible was used to configure the infrastructure provisioned by Terraform.

The Ansible inventory uses the public IP address produced by Terraform.

The project contains roles for:

* MongoDB setup
* Backend deployment
* Frontend deployment

An additional Docker installation role is included to ensure that the required container runtime is available.

The roles are organized so that server configuration can be repeated consistently instead of relying on manual configuration commands.

The Ansible tasks are designed to be idempotent, meaning that running the configuration repeatedly should result in the same desired state without unnecessarily recreating resources.

The connection to the provisioned node was verified successfully using the Ansible `ping` module, which returned `pong`.

This demonstrates the separation between:

**Terraform → infrastructure provisioning**

and

**Ansible → server configuration**

## 6. Kubernetes Orchestration

BookHaven is deployed using Kubernetes.

Kubernetes is responsible for managing the frontend, backend, and MongoDB workloads.

Different Kubernetes objects were selected based on the requirements of each workload.

### Backend Deployment

The backend is deployed using a Kubernetes Deployment because it is a stateless application workload.

The backend:

* Uses the `hodhan/bookhaven-backend:v1.0.1` image
* Runs on port `5000`
* Uses a Deployment
* Uses labels for identification and service selection
* Defines CPU and memory resource requests
* Defines CPU and memory resource limits
* Uses a readiness probe
* Uses a liveness probe
* Is exposed through a LoadBalancer Service

The backend health probes check the `/api/books` endpoint.

The Deployment allows Kubernetes to recreate the backend pod if it fails.

### Frontend Deployment

The frontend is deployed using a Kubernetes Deployment because it is also a stateless application workload.

The frontend:

* Uses the `hodhan/bookhaven-frontend:v1.0.3` image
* Runs on port `80`
* Uses a Deployment
* Uses labels for identification and service selection
* Defines CPU and memory resource requests
* Defines CPU and memory resource limits
* Uses a readiness probe
* Uses a liveness probe
* Is exposed through a LoadBalancer Service

The frontend health probes check the `/` endpoint.

The LoadBalancer Service provides public access to the frontend application.

### MongoDB StatefulSet

MongoDB is deployed using a StatefulSet because it is a stateful database workload.

Unlike the frontend and backend, MongoDB must retain its data independently of the lifecycle of an individual pod.

MongoDB uses:

* StatefulSet
* Headless Service
* PersistentVolumeClaim
* Persistent storage
* Labels
* CPU and memory resource requests
* CPU and memory resource limits
* Readiness probe
* Liveness probe

The PersistentVolumeClaim is mounted at:

`/data/db`

The PVC provides persistent storage for MongoDB.

If the MongoDB pod is deleted and recreated, the persistent volume can be reattached to the replacement pod, preventing normal pod deletion from removing the stored database data.

The MongoDB service is headless so that the StatefulSet can provide stable network identity for the database workload.

## 7. Health Probes

Health probes were added to improve Kubernetes reliability.

### Backend

Readiness probe:

`/api/books`

Liveness probe:

`/api/books`

### Frontend

Readiness probe:

`/`

Liveness probe:

`/`

### MongoDB

MongoDB uses TCP health checks against port `27017`.

Readiness probes prevent Kubernetes from sending traffic to containers that are not ready.

Liveness probes allow Kubernetes to detect unhealthy containers and restart them when necessary.

## 8. Resource Management

CPU and memory resource requests and limits are configured for the application containers.

Resource requests tell Kubernetes how much CPU and memory a container is expected to require and help Kubernetes make scheduling decisions.

Resource limits prevent a container from consuming unlimited CPU or memory.

This provides more predictable resource usage and improves the stability of the Kubernetes environment.

## 9. Application Availability

The frontend is exposed using a Kubernetes LoadBalancer Service.

Live frontend:

http://34.35.14.77

The backend is also exposed using a Kubernetes LoadBalancer Service.

Backend API:

http://34.35.116.179:5000/api/books

The application was verified through the Kubernetes services, with the frontend and backend exposed through their respective external LoadBalancer addresses.

The running Kubernetes workloads were verified with:

* BookHaven frontend pod — Running
* BookHaven backend pod — Running
* MongoDB pod — Running

The MongoDB service is a headless service and the MongoDB workload uses persistent storage.

## 10. End-to-End DevOps Pipeline

The completed project connects source control, CI/CD, containerization, infrastructure provisioning, configuration management, and Kubernetes orchestration.

The application workflow is:

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
    +----> CI
    |       |
    |       +----> Install Dependencies
    |       |
    |       +----> Run Tests
    |
    +----> CD
            |
            +----> Build Backend Image
            |
            +----> Build Frontend Image
            |
            +----> Apply Semantic Version Tags
            |
            v
        Docker Hub
            |
            v
       Kubernetes
            |
      +-----+-----+----------------+
      |           |                |
      v           v                v
 Frontend      Backend          MongoDB
 Deployment    Deployment       StatefulSet
      |           |                |
      v           v                v
LoadBalancer LoadBalancer    Headless Service
                               |
                               v
                              PVC
                               |
                               v
                         Persistent Data
```

The infrastructure and configuration workflow is:

```text
Terraform
    |
    v
Cloud Infrastructure
    |
    +----> VPC
    +----> Subnet
    +----> Internet Gateway
    +----> Route Table
    +----> Security Group
    +----> EC2 Node
    |
    v
Terraform Output
    |
    v
Ansible Inventory
    |
    v
Ansible
    |
    +----> Install Docker
    +----> Configure MongoDB
    +----> Configure Backend
    +----> Configure Frontend
```

Together, these workflows demonstrate the complete DevOps lifecycle used for BookHaven:

**Source Control → CI/CD → Docker → Docker Hub → Infrastructure as Code → Configuration Management → Kubernetes → Persistent Storage → Live Application**

## 11. Summary

The project demonstrates the major DevOps practices required by the capstone:

* Git feature branches and pull requests
* Descriptive commit history
* Clean `.gitignore`
* Automated CI testing
* Automated Docker image builds
* Docker Hub image publishing
* Semantic image versioning
* Multi-stage containerization
* Docker Compose orchestration
* Persistent MongoDB storage
* Terraform Infrastructure as Code
* Ansible configuration management
* Idempotent configuration roles
* Kubernetes Deployments
* Kubernetes StatefulSet
* Headless MongoDB Service
* PersistentVolumeClaim
* LoadBalancer Services
* Resource requests and limits
* Kubernetes readiness and liveness probes
* Labels for workload identification
* Live application access

The architecture diagram for the project is provided separately in `architecture.md`.
