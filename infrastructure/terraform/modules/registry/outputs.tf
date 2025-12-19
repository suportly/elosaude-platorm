# =============================================================================
# Elosaude Backend - Artifact Registry Module Outputs
# =============================================================================

output "repository_id" {
  description = "ID of the Artifact Registry repository"
  value       = google_artifact_registry_repository.backend.repository_id
}

output "repository_name" {
  description = "Full name of the repository"
  value       = google_artifact_registry_repository.backend.name
}

output "repository_url" {
  description = "URL for Docker push/pull operations"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.backend.repository_id}"
}
