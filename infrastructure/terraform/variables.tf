# =============================================================================
# Elosaude Backend - Terraform Variables
# =============================================================================

# -----------------------------------------------------------------------------
# Project Configuration
# -----------------------------------------------------------------------------

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP Zone"
  type        = string
  default     = "us-central1-a"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod"
  }
}

# -----------------------------------------------------------------------------
# Compute Configuration
# -----------------------------------------------------------------------------

variable "machine_type" {
  description = "GCE machine type for the backend VM"
  type        = string
  default     = "e2-small"
}

variable "container_image" {
  description = "Docker image URL for the backend container"
  type        = string
}

# -----------------------------------------------------------------------------
# Database Configuration (Sensitive)
# -----------------------------------------------------------------------------

variable "database_url" {
  description = "PostgreSQL connection string"
  type        = string
  sensitive   = true
}

# -----------------------------------------------------------------------------
# Django Configuration (Sensitive)
# -----------------------------------------------------------------------------

variable "django_secret_key" {
  description = "Django SECRET_KEY for cryptographic signing"
  type        = string
  sensitive   = true
}

variable "django_allowed_hosts" {
  description = "Django ALLOWED_HOSTS setting"
  type        = string
  default     = "*"
}

# -----------------------------------------------------------------------------
# Network Configuration
# -----------------------------------------------------------------------------

variable "allowed_ssh_ranges" {
  description = "IP CIDR ranges allowed to SSH into the VM"
  type        = list(string)
  default     = []
}

# -----------------------------------------------------------------------------
# Labels
# -----------------------------------------------------------------------------

variable "labels" {
  description = "Labels to apply to all resources"
  type        = map(string)
  default = {
    project    = "elosaude"
    managed_by = "terraform"
  }
}
