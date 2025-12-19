# =============================================================================
# Elosaude Backend - Networking Module (Firewall Rules)
# =============================================================================

# -----------------------------------------------------------------------------
# Local Variables
# -----------------------------------------------------------------------------

locals {
  backend_tag = "elosaude-backend"
}

# -----------------------------------------------------------------------------
# Firewall Rule: Allow HTTP on Port 8005
# -----------------------------------------------------------------------------

resource "google_compute_firewall" "allow_http" {
  project = var.project_id
  name    = "elosaude-allow-http-${var.environment}"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["8005"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = [local.backend_tag]

  description = "Allow HTTP traffic on port 8005 for Elosaude backend"
}

# -----------------------------------------------------------------------------
# Firewall Rule: Allow SSH (Restricted)
# -----------------------------------------------------------------------------

resource "google_compute_firewall" "allow_ssh" {
  count = length(var.allowed_ssh_ranges) > 0 ? 1 : 0

  project = var.project_id
  name    = "elosaude-allow-ssh-${var.environment}"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = var.allowed_ssh_ranges
  target_tags   = [local.backend_tag]

  description = "Allow SSH access for Elosaude backend (restricted to specific IPs)"
}

# -----------------------------------------------------------------------------
# Firewall Rule: Allow SSH via IAP (Always enabled)
# -----------------------------------------------------------------------------

resource "google_compute_firewall" "allow_iap_ssh" {
  project = var.project_id
  name    = "elosaude-allow-iap-ssh-${var.environment}"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  # IAP's IP range
  source_ranges = ["35.235.240.0/20"]
  target_tags   = [local.backend_tag]

  description = "Allow SSH via Identity-Aware Proxy for Elosaude backend"
}

# -----------------------------------------------------------------------------
# Firewall Rule: Allow GCP Health Checks
# -----------------------------------------------------------------------------

resource "google_compute_firewall" "allow_health_checks" {
  project = var.project_id
  name    = "elosaude-allow-health-checks-${var.environment}"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["8005"]
  }

  # GCP health checker IP ranges
  source_ranges = ["35.191.0.0/16", "130.211.0.0/22"]
  target_tags   = [local.backend_tag]

  description = "Allow GCP health check traffic for Elosaude backend"
}
