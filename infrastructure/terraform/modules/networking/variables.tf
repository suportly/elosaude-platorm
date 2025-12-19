# =============================================================================
# Elosaude Backend - Networking Module Variables
# =============================================================================

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "allowed_ssh_ranges" {
  description = "IP CIDR ranges allowed to SSH into the VM"
  type        = list(string)
  default     = []
}
