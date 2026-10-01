# BLUE INDIGO SECURE AWS DEVSECOPS PLATFORM

This project was built to demonstrate how I would design an architecture leveraging Terraform for Infrastructure as Code and Terragrunt to orchestrate Terraform's configuration. I validated secure container orchestration with EKS, automated CI/CD leveraging GitLab, enforced strict security governance and utilized Prometheus and Grafana for compliance across multiple AWS environments. 
 

## Business Problem 

Blue Indigo had multiple engineering teams deploying cloud infrastructure using different processes.

Some resources were being created manually while others were deployed through Infrastructure as Code. Development and production environments were becoming inconsistent, deployment permissions were difficult to control, and infrastructure changes lacked a standardized approval and auditing process.

The company also needed stronger governance around cloud deployments and a repeatable way to evaluate infrastructure against security and compliance requirements including PCI DSS, SOC 2, SOX, NIST 800-171, and ISO 27001.



## Solution

The solution was to design a centralized AWS DevSecOps platform that standardized infrastructure deployment and application delivery. Leveraged Terraform to create reusable AWS infrastructure modules and Terragrunt to manage environment-specific configurations.

Then integrated GitLab CI/CD with AWS using OIDC and AWS STS so pipelines could obtain temporary credentials instead of storing long-lived AWS access keys. I used ECS Fargate  and EKS demonstrate two container orchestration strategies. Implemented centralized logging, monitoring, security checks, configuration monitoring, and compliance evidence using CloudWatch, CloudTrail, AWS Config, GuardDuty, and Security Hub.

The final architecture demonstrates how development, staging, and production environments can be governed using consistent Infrastructure as Code, security controls, deployment standards, and automated CI/CD processes.