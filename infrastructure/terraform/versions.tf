# =============================================================================
# Elosaude Backend - Terraform Provider Configuration
# =============================================================================

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  # Backend configuration for remote state (configured per environment)
  # Initialize with: terraform init -backend-config="bucket=elosaude-terraform-state"
  backend "gcs" {
    # bucket = "elosaude-terraform-state"  # Set via -backend-config
    # prefix = "backend/${var.environment}" # Set via -backend-config
  }
}

# =============================================================================
# Google Provider Configuration
# =============================================================================

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}
