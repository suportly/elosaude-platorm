# =============================================================================
# Elosaude Backend - Artifact Registry Module Variables
# =============================================================================

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region for the registry"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "labels" {
  description = "Labels to apply to the registry"
  type        = map(string)
  default     = {}
}
