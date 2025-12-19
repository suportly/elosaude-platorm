# =============================================================================
# Elosaude Backend - Networking Module Outputs
# =============================================================================

output "backend_network_tags" {
  description = "Network tags for the backend VM"
  value       = ["elosaude-backend"]
}

output "http_firewall_name" {
  description = "Name of the HTTP firewall rule"
  value       = google_compute_firewall.allow_http.name
}

output "health_check_firewall_name" {
  description = "Name of the health check firewall rule"
  value       = google_compute_firewall.allow_health_checks.name
}
