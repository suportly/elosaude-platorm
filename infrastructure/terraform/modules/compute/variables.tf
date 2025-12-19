# =============================================================================
# Elosaude Backend - Compute Module Variables
# =============================================================================

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
}

variable "zone" {
  description = "GCP Zone"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "machine_type" {
  description = "GCE machine type"
  type        = string
  default     = "e2-small"
}

variable "container_image" {
  description = "Docker image URL for the backend container"
  type        = string
}

variable "database_url" {
  description = "PostgreSQL connection string"
  type        = string
  sensitive   = true
}

variable "django_secret_key" {
  description = "Django SECRET_KEY"
  type        = string
  sensitive   = true
}

variable "django_allowed_hosts" {
  description = "Django ALLOWED_HOSTS setting"
  type        = string
  default     = "*"
}

variable "network_tags" {
  description = "Network tags for firewall rules"
  type        = list(string)
  default     = ["elosaude-backend"]
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default     = {}
}
