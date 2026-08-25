# BookHaven DevOps Capstone — Project Explanation

## Git Workflow

The BookHaven project was developed using a feature-branch workflow with pull requests used to merge completed work into the `master` branch.

Each major phase of the project was developed separately so that changes remained organized, traceable, and easier to review. The feature branches used included:

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

After completing work on a feature, the changes were committed with descriptive commit messages, pushed to GitHub, reviewed through a pull request, and merged into `master`.

The repository uses a clean `.gitignore` to prevent generated, sensitive, and environment-specific files from being committed. This includes `.env` files, `node_modules`, Terraform state files, Terraform variable files, and other local configuration files.

## CI/CD Pipeline

GitHub Actions is used to automate continuous integration and continuous delivery.

The CI workflow runs whenever code is pushed to the repository. It installs the required dependencies and runs the available tests to help detect problems before changes are merged.

The CD workflow runs when changes are pushed to the `master` branch after the feature branch and pull request workflow. The pipeline:

1. Checks out the repository.
2. Sets up Docker Buildx.
3. Logs into Docker Hub using GitHub Actions secrets.
4. Builds the backend Docker image.
5. Builds the frontend Docker image.
6. Pushes both images to Docker Hub.

The images use semantic version tags such as `v1.0.0`, which makes releases easier to identify and manage. A `latest` tag is also maintained for convenience.

The Docker Hub repositories are:

* `hodhan/bookhaven-backend`
* `hodhan/bookhaven-frontend`

This automation reduces the need to manually build and push images and provides a repeatable process for creating container images.

## Containerization

The BookHaven application consists of a React frontend, a Node.js and Express backend, and MongoDB for data storage.

The backend and frontend each have their own Dockerfile. The Dockerfiles use lightweight base images and multi-stage builds where appropriate to reduce unnecessary dependencies in the final images.

The backend container exposes port `5000`.

The frontend is built into static production files and served using Nginx, which exposes the application on port `80`.

Docker Compose is used to orchestrate the complete application locally. It runs:

* Frontend
* Backend
* MongoDB

The services communicate through the Docker Compose network, allowing containers to communicate using their service names rather than requiring hard-coded IP addresses.

MongoDB uses a named volume to provide persistent storage. This allows database data to survive container restarts and recreation.

Semantic version tags are used for Docker images, and the images were kept within the project's target size of under 400 MB.

## Terraform and Infrastructure as Code

Terraform was used to define and provision cloud infrastructure as code.

The Terraform configuration provisions the AWS resources required for the project infrastructure, including:

* Virtual Private Cloud
* Public subnet
* Internet Gateway
* Route table and route table association
* Security group
* EC2 compute instance

Variables are used to make the Terraform configuration easier to reuse and modify, while outputs expose useful infrastructure information such as the public IP address of the provisioned instance.

Terraform separates infrastructure provisioning from application configuration. Terraform is responsible for creating the cloud resources, while Ansible is responsible for configuring the provisioned server.

The Terraform output was used to provide the public IP address required by the Ansible inventory. Manual copying of this output was used, which satisfies the project requirement, while dynamic inventory would be a possible future improvement.

The Terraform-managed AWS infrastructure was successfully provisioned and verified during development. After verification, it was destroyed using `terraform destroy` to avoid unnecessary cloud charges.

## Ansible Configuration Management

Ansible was used to configure the server provisioned by Terraform.

The Ansible inventory referenced the public IP address produced by the Terraform infrastructure.

The project contains the required roles for:

* MongoDB setup
* Backend deployment
* Frontend deployment

An additional Docker installation role is also included to ensure the required container runtime is available before deploying the application services.

The purpose of using Ansible is to make server configuration repeatable and consistent instead of relying on manual commands.

The roles use declarative Ansible tasks so that repeated execution does not unnecessarily recreate resources that are already in the desired state. This supports idempotent configuration management.

The Ansible connection to the provisioned server was verified successfully using the Ansible ping module.

## Kubernetes Orchestration

The BookHaven application is deployed on Google Kubernetes Engine (GKE).

Kubernetes was used to manage the frontend, backend, and MongoDB workloads.

The frontend and backend use Kubernetes Deployments because they are stateless application workloads that can be managed and recreated by Kubernetes.

MongoDB uses a StatefulSet because a database requires stable identity and persistent storage.

### Backend

The backend runs as a Kubernetes Deployment using the `hodhan/bookhaven-backend:v1.0.1` image.

The backend:

* Runs on port `5000`
* Uses one replica
* Has labels for identification and selection
* Has CPU and memory resource requests and limits
* Has a readiness probe
* Has a liveness probe
* Is exposed using a LoadBalancer Service

The readiness and liveness probes check the `/api/books` endpoint.

### Frontend

The frontend runs as a Kubernetes Deployment using the `hodhan/bookhaven-frontend:v1.0.3` image.

The frontend:

* Runs on port `80`
* Uses one replica
* Has labels for identification and selection
* Has CPU and memory resource requests and limits
* Has a readiness probe
* Has a liveness probe
* Is exposed using a LoadBalancer Service

The frontend probes check the `/` endpoint.

The LoadBalancer Service provides a public endpoint that allows users to access the BookHaven application.

### MongoDB

MongoDB runs as a StatefulSet because database workloads require persistent identity and persistent storage.

MongoDB uses:

* StatefulSet
* Headless Service
* PersistentVolumeClaim
* Persistent storage
* Labels
* CPU and memory resource requests and limits
* Readiness probe
* Liveness probe

The PersistentVolumeClaim is mounted at `/data/db`.

This separates the MongoDB data from the lifecycle of the database pod. If the MongoDB pod is deleted and recreated, the persistent storage remains available and can be reattached to the replacement pod.

The MongoDB PersistentVolumeClaim was verified as `Bound`.

## Health Probes

Kubernetes health probes were added to improve application reliability.

The backend readiness and liveness probes check:

`/api/books`

The frontend readiness and liveness probes check:

`/`

MongoDB uses TCP probes against port `27017`.

Readiness probes prevent Kubernetes from sending traffic to containers that are not yet ready to serve requests.

Liveness probes allow Kubernetes to detect unhealthy containers and restart them when necessary.

## Resource Management

CPU and memory resource requests and limits are configured for every application container.

Resource requests help Kubernetes make scheduling decisions based on the expected resource requirements of each workload.

Resource limits prevent containers from consuming unlimited CPU or memory resources.

This improves the stability and predictability of the Kubernetes environment.

## Application Availability

The frontend is exposed through a Kubernetes LoadBalancer.

Live frontend:

http://34.35.14.77

The backend API is also exposed through a Kubernetes LoadBalancer.

Backend API:

http://34.35.116.179:5000/api/books

The frontend loads successfully and displays book data retrieved from the backend API.

The Kubernetes deployment was verified with all required pods running:

* BookHaven frontend
* BookHaven backend
* MongoDB

## End-to-End DevOps Pipeline

The completed workflow connects source control, automation, containerization, infrastructure provisioning, configuration management, and Kubernetes orchestration.

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
    +--------------------> CI: Install Dependencies + Run Tests
    |
    +--------------------> CD: Build Docker Images
                                |
                                v
                           Docker Hub
                                |
                                v
                     Kubernetes Deployment / GKE
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
        Live Frontend       Backend API      Persistent Storage
                                                    |
                                                    v
                                               MongoDB Data


Terraform
    |
    v
AWS Infrastructure
(VPC + Subnet + Security Group + EC2)
    |
    v
Terraform Output
    |
    v
Ansible Inventory
    |
    v
Ansible Roles
    |
    +----> Install Docker
    +----> Setup MongoDB
    +----> Deploy Backend
    +----> Deploy Frontend
```

This architecture demonstrates the complete DevOps lifecycle used in the project: source control and feature branches, automated CI/CD, containerization, Docker image storage, infrastructure provisioning with Terraform, server configuration with Ansible, and application orchestration using Kubernetes with persistent database storage.
