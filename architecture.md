# BookHaven Architecture

## Overview

BookHaven uses a complete DevOps workflow covering source control, continuous integration and delivery, containerization, cloud infrastructure, configuration management, and Kubernetes orchestration.

```text
                         DEVELOPER
                             |
                             | git push
                             v
                    GitHub Repository
                             |
                             v
                    GitHub Actions
                       CI / CD Pipeline
                             |
                +------------+------------+
                |                         |
             CI: Tests              CD: Build & Push
                                          |
                                          v
                                     Docker Hub
                                  +------+------+
                                  |             |
                                  v             v
                              Backend       Frontend
                               Image          Image
                                  |             |
                                  +------+------+
                                         |
                                         v
                                  Kubernetes / GKE
                                         |
              +--------------------------+--------------------------+
              |                          |                          |
              v                          v                          v
      Frontend Deployment       Backend Deployment        MongoDB StatefulSet
              |                          |                          |
              v                          v                          v
       LoadBalancer Service      LoadBalancer Service       Headless Service
              |                          |                          |
              v                          v                          v
       34.35.14.77              34.35.116.179:5000              PVC
                                                                  |
                                                                  v
                                                            MongoDB Data


        TERRAFORM
            |
            v
     AWS Cloud Infrastructure
            |
            v
        EC2 Node
            |
            v
         ANSIBLE
            |
            v
    Server Configuration
