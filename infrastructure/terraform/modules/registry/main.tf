# =============================================================================
# Elosaude Backend - Artifact Registry Module
# =============================================================================

# -----------------------------------------------------------------------------
# Artifact Registry Repository for Docker Images
# -----------------------------------------------------------------------------

resource "google_artifact_registry_repository" "backend" {
  project       = var.project_id
  location      = var.region
  repository_id = "elosaude-backend-${var.environment}"
  description   = "Docker images for Elosaude backend (${var.environment})"
  format        = "DOCKER"

  # Cleanup policies to manage storage
  cleanup_policies {
    id     = "keep-minimum-versions"
    action = "KEEP"
    most_recent_versions {
      keep_count = 5
    }
  }

  cleanup_policies {
    id     = "delete-old-untagged"
    action = "DELETE"
    condition {
      tag_state  = "UNTAGGED"
      older_than = "604800s" # 7 days
    }
  }

  labels = var.labels
}
