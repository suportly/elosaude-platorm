# =============================================================================
# Elosaude Backend - Terraform Outputs
# =============================================================================

# -----------------------------------------------------------------------------
# Compute Instance Outputs
# -----------------------------------------------------------------------------

output "instance_external_ip" {
  description = "External IP address of the backend VM"
  value       = module.compute.external_ip
}

output "instance_name" {
  description = "Name of the VM instance"
  value       = module.compute.instance_name
}

output "instance_self_link" {
  description = "Self-link of the VM instance"
  value       = module.compute.instance_self_link
}

# -----------------------------------------------------------------------------
# API Outputs
# -----------------------------------------------------------------------------

output "api_url" {
  description = "URL to access the backend API"
  value       = "http://${module.compute.external_ip}:8005"
}

output "health_check_url" {
  description = "URL for API health check"
  value       = "http://${module.compute.external_ip}:8005/api/status/"
}

# -----------------------------------------------------------------------------
# Registry Outputs
# -----------------------------------------------------------------------------

output "registry_url" {
  description = "Artifact Registry URL for Docker images"
  value       = module.registry.repository_url
}

output "docker_push_command" {
  description = "Example command to push Docker images"
  value       = "docker push ${module.registry.repository_url}/backend:latest"
}

# -----------------------------------------------------------------------------
# Service Account Outputs
# -----------------------------------------------------------------------------

output "service_account_email" {
  description = "Service account email used by the VM"
  value       = module.compute.service_account_email
}

# -----------------------------------------------------------------------------
# Deployment Information
# -----------------------------------------------------------------------------

output "ssh_command" {
  description = "Command to SSH into the VM"
  value       = "gcloud compute ssh ${module.compute.instance_name} --zone=${var.zone}"
}

output "logs_command" {
  description = "Command to view VM container logs"
  value       = "gcloud compute ssh ${module.compute.instance_name} --zone=${var.zone} --command='docker logs elosaude-backend'"
}
