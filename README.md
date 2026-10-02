# BLUE INDIGO SECURE AWS DEVSECOPS PLATFORM
 
This project was built to demonstrate how I would design an architecture leveraging Terraform for Infrastructure as Code and Terragrunt to orchestrate Terraform's configuration. I validated secure container orchestration with EKS, automated CI/CD leveraging GitLab, enforced strict security governance and utilized Prometheus and Grafana for compliance across multiple AWS environments. Every resource and tool was provisoned and configured in terraform.
 

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

The nodes uses the existing VPC networking created earlier at the foundation of this project. Then the infrastructure for the Kubernetes environment was provisioned.


## Kubernetes Deployment

After the EKS infrastructure was available, I configured kubectl to communicate with the cluster and deployed the Blue Indigo application using Kubernetes. Then configured a namespace, ConfigMap, Deployment, LoadBalancer Service, and Horizontal Pod Autoscaler. The LoadBalancer exposed the application externally while Kubernetes maintained the desired application state.


## Kubernetes Horizontal Pod Autoscaling

I configured a Horizontal Pod Autoscaler to scale the application based on CPU utilization. The configuration uses:

- Minimum Pods: 1
- Maximum Pods: 3
- Target CPU Utilization: 50%

Then I installed the Metrics Server so Kubernetes could collect resource metrics required by the HPA to respond to workload changes without manually increasing the number of pods.


## Prometheus and Grafana Monitoring

I deployed the Prometheus and Grafana monitoring stack. Prometheus collected Kubernetes infrastructure and workload metrics while Grafana provided dashboards for visualizing cluster health, node utilization, pods, CPU, and memory. This provided a second observability layer in addition to CloudWatch.


## AWS Security and Governance

I then added a security and governance layer. This was to demonstrate that infrastructure should not only be deployable and scalable, but also it should be auditable and continuously evaluated against security requirements.


## AWS CloudTrail

I provisioned AWS CloudTrail to create an audit trail of AWS API activity. CloudTrail logs were then delivered to a dedicated S3 bucket with public access blocked and server-side encryption enabled.

I also enabled the following:

- Multi-Region trail
- Global service events
- Log file validation


## AWS Config

I enabled AWS Config to record AWS resource configurations and evaluate them against security rules. I provisioned a dedicated S3 bucket for Config records and an IAM role that allowed AWS Config to perform the required configuration-recording operations.

I then added managed Config rules to evaluate important controls including:

- S3 public read access
- EBS volume encryption
- Unrestricted SSH access

CloudTrail was useful because it told me what AWS API activity occurred, while AWS Config helped me understand resource configuration and whether resources meet the selected configuration rules.


## Amazon GuardDuty

GuardDuty was included in the security architecture for managed threat detection.

The Terraform configuration I created was:

```hcl
resource "aws_guardduty_detector" "main" {
  enable = true

  tags = local.common_tags
}

But during deployment, AWS returned a SubscriptionRequiredException because GuardDuty was not available for activation through the current account configuration. I removed the GuardDuty resource from the active deployment while keeping it documented as part of the production architecture. In a production environment, I would use GuardDuty to continuously analyze and identify suspicious activity and potential threats affecting AWS accounts.


## Security Hub

Security Hub was included in the target architecture as the centralized security posture layer. In a production environment, I would use Security Hub to aggregate security findings and evaluate AWS resources against enabled security controls and standards.


## Compliance 

The architecture demonstrates technical alignment with common security and compliace requirements found across:

- PCI DSS
- SOC 2
- SOX
- NIST SP 800-171
- ISO/IEC 27001


