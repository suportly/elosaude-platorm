# =============================================================================
# Elosaude Backend - Compute Module Outputs
# =============================================================================

output "instance_name" {
  description = "Name of the VM instance"
  value       = google_compute_instance.backend.name
}

output "instance_self_link" {
  description = "Self-link of the VM instance"
  value       = google_compute_instance.backend.self_link
}

output "external_ip" {
  description = "External IP address of the VM"
  value       = google_compute_instance.backend.network_interface[0].access_config[0].nat_ip
}

output "internal_ip" {
  description = "Internal IP address of the VM"
  value       = google_compute_instance.backend.network_interface[0].network_ip
}

output "service_account_email" {
  description = "Email of the service account used by the VM"
  value       = google_service_account.backend.email
}

output "zone" {
  description = "Zone where the VM is deployed"
  value       = google_compute_instance.backend.zone
}
