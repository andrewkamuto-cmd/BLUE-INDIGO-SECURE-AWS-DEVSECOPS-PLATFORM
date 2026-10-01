# BLUE INDIGO SECURE AWS DEVSECOPS PLATFORM
 ** PROJECT STILL IN DEVELOPMENT.
This project was built to demonstrate how I would design an architecture leveraging Terraform for Infrastructure as Code and Terragrunt to orchestrate Terraform's configuration. I validated secure container orchestration with EKS, automated CI/CD leveraging GitLab, enforced strict security governance and utilized Prometheus and Grafana for compliance across multiple AWS environments. 
 

## Business Problem 

Blue Indigo had multiple engineering teams deploying cloud infrastructure using different processes.

Some resources were being created manually while others were deployed through Infrastructure as Code. Development and production environments were becoming inconsistent, deployment permissions were difficult to control, and infrastructure changes lacked a standardized approval and auditing process.

The company also needed stronger governance around cloud deployments and a repeatable way to evaluate infrastructure against security and compliance requirements including PCI DSS, SOC 2, SOX, NIST 800-171, and ISO 27001.



## Solution

The solution was to design a centralized AWS DevSecOps platform that standardized infrastructure deployment and application delivery. Leveraged Terraform to create reusable AWS infrastructure modules and Terragrunt to manage environment-specific configurations.

Then integrated GitLab CI/CD with AWS using OIDC and AWS STS so pipelines could obtain temporary credentials instead of storing long-lived AWS access keys. I used ECS Fargate  and EKS demonstrate two container orchestration strategies. Implemented centralized logging, monitoring, security checks, configuration monitoring, and compliance evidence using CloudWatch, CloudTrail, AWS Config, GuardDuty, and Security Hub.

The final architecture demonstrates how development, staging, and production environments can be governed using consistent Infrastructure as Code, security controls, deployment standards, and automated CI/CD processes.




## Local Development Environment

I started first by preparing my local development environment with the tools required to build and manage the platform. Configured the AWS CLI for the us-east-1 region and then validated my AWS identity using AWS STS before the deploying infrastructure.



## Networking

I began provisioning a VPC and inside it I created two public subnets across separate Availability Zones ; in us-east-1a and in us-east-1b. This gave the architecture the ability to distribute workloads. 

I created an Internet Gateway and attached it to the VPC. Then created a public route table and the two public subnets were associated with this route table. This allowed resources deployed into the subnets to communicate with the internet because of their public IP adresses

## Why I did not use NAT Gateway

I intentionally avoided creating a NAT Gateway because NAT Gateways introduce additional hourly and data-processing costs. I was just being cost-conscious. But in a production , I would put application workloads and worker nodes in private subnets and provide controlled outbound connectivity through NAT Gateways.



## Security Groups

I provisoned security groups to control network traffic reaching the application. Like port 80 (HTTP). During ECS testing, I allowed  port 3000 temporarily so I could directly validate the Node.js application running inside the Fargate task. But in a production architecture, I would place an Application Load Balancer in front of the ECS service and configure the application security group to allow traffic only from the load balancer security group.



## Terragrunt 

I added Terragrunt to demonstrate how the same Terraform architecture could be reused across multiple environments (Development, staging and production)

## IAM and Least Privilege

I provisioned IAM roles for the different AWS services. ECS received its own execution role. EKS received separate IAM roles for the cluster and worker nodes.The CI/CD architecture was also designed to use a dedicated deployment role.

The separation reduces unnecessary permissions and also supportsleast privilege.


## GitLab OIDC and AWS STS

As I had stated earlier in the solution, I designed the GitLab pipeline to authenticate to AWS using OIDC instead of storing permanent AWS access keys inside GitLab. In the pipeline, GitLab generates an OIDC token. AWS validates the token through the configured IAM OIDC provider. Then the pipeline calls AWS STS and assume the authorized deployment role.


## GitLab CI/CD Pipeline

I configured a .gitlab-ci.yml file to start automating the infrastructure delivery process. The aim was to validate Terraform and security requirements before allowing infrastructure changes to move toward deployment. 


## Node.js Application

I created a lightweight Node.js and Express application which listens to port 3000 to simulate real workload for the container. Then created a root endpoint that returns information about the Blue Indigo application and the platform where it is running. And then added /health to the url in the web browser to return a healthy response.

## Docker Containerization

I then configured a Dockerfile to package the Node.js application into a portable container image. The container installs the required Node.js dependencies, copies the application files, exposes port 3000, and starts the application using npm.


## Local Container Validation

Before deploying the application into AWS, I built and tested the Docker image locally.

I validated that the application could start successfully inside the container and respond through port 3000.

I built and tested the Docker image locally before deploying the application into AWS. This allowed to know if there was an issue so that I could separate application problems from AWS infrastructure problems bef deploying the image.

## ECR

I configured an Elastic Container Registry repository and configured immutable image tags and image scanning.


## ECS Fargate Cluster

I provisioned an Amazon ECS cluster and enabled Container Insights so that ECS workload metrics could be collected through CloudWatch.

I selected AWS Fargate to be the compute model, taking away the need of creating an EC2 instance.


## ECS Task Definition

I provisoned an ECS Fargate task definition for the Faragate cluster. The task was configured with:

-CPU: 256

-Memory: 512 MB

-Container Port: 3000

-Network Mode: awsvpc

-Operating System: Linux

-Architecture: X86_64

Then I created  ECS execution role which provided the permissions required for ECS to retrieve the image and send container logs to CloudWatch for monitoring.

## ECS Fargate Service

I created an ECS service that maintains the desired number of application tasks inside the Fargate cluster. I configured a desired count of one task to the lab environment which receives its own network interface through VPC networking and is deployed using the public subnets and security group created earlier.

## CloudWatch Logging

I configured the ECS task to send the application logs to CloudWatch Logs. Then provisoned the log group and  configured a seven-day retention period for the lab environment. That prevents unnecessary long-term log storage.


## ECS Auto Scaling Design

I configured ECS Service Auto Scaling so that the application could increase or decrease its number of running tasks based on the workload. The scaling configuration uses :

Minimum Tasks: 1

Maximum Tasks: 3

Target CPU Utilization: 50%

Thus the application can respond dynamically to changing traffic.


## EKS Infrastructure

Only after I was done with provisioning the ECS section is when I began provisioning EKS which demonstrates Kubernetes-based orchestration. I then provisoned an EKS cluster.

## EKS IAM Roles

I provisioned separate IAM roles for the EKS control plane and worker nodes. The EKS cluster role provides the permissions required by EKS to manage the cluster. The worker-node role provided the permissions required for the nodes to communicate with EKS and other required AWS services.


## EKS Managed Node Group

I then provisoned an EKS managed node group. The node group was configured with:

Desired Nodes: 1

Minimum Nodes: 1

Maximum Nodes: 2

Instance Type: t3.small

The nodes uses the existing VPC networking created earlier at the founndation of this project. Then the infrastructure for the Kubernetes environment was provisioned.
