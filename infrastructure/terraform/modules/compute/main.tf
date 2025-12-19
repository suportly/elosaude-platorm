# =============================================================================
# Elosaude Backend - Compute Module (GCE VM)
# =============================================================================

# -----------------------------------------------------------------------------
# Service Account for the VM
# -----------------------------------------------------------------------------

resource "google_service_account" "backend" {
  project      = var.project_id
  account_id   = "elosaude-backend-${var.environment}"
  display_name = "Elosaude Backend Service Account (${var.environment})"
}

# -----------------------------------------------------------------------------
# IAM Role Bindings for Service Account
# -----------------------------------------------------------------------------

resource "google_project_iam_member" "logging" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

resource "google_project_iam_member" "monitoring" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

resource "google_project_iam_member" "artifact_registry" {
  project = var.project_id
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

# -----------------------------------------------------------------------------
# Container Declaration for Container-Optimized OS
# -----------------------------------------------------------------------------

locals {
  container_declaration = yamlencode({
    spec = {
      containers = [{
        name  = "elosaude-backend"
        image = var.container_image
        ports = [{
          containerPort = 8005
          hostPort      = 8005
        }]
        env = [
          {
            name  = "DATABASE_URL"
            value = var.database_url
          },
          {
            name  = "DJANGO_SECRET_KEY"
            value = var.django_secret_key
          },
          {
            name  = "DJANGO_DEBUG"
            value = "False"
          },
          {
            name  = "DJANGO_ALLOWED_HOSTS"
            value = var.django_allowed_hosts
          },
          {
            name  = "PYTHONUNBUFFERED"
            value = "1"
          }
        ]
        volumeMounts = [{
          name      = "media"
          mountPath = "/app/media"
        }]
      }]
      volumes = [{
        name = "media"
        hostPath = {
          path = "/var/elosaude/media"
        }
      }]
      restartPolicy = "Always"
    }
  })
}

# -----------------------------------------------------------------------------
# Compute Engine Instance
# -----------------------------------------------------------------------------

resource "google_compute_instance" "backend" {
  project      = var.project_id
  name         = "elosaude-backend-${var.environment}"
  machine_type = var.machine_type
  zone         = var.zone

  # Use Container-Optimized OS
  boot_disk {
    initialize_params {
      image = "cos-cloud/cos-stable"
      size  = 20
      type  = "pd-standard"
    }
  }

  # Network configuration with external IP
  network_interface {
    network = "default"

    access_config {
      # Ephemeral external IP
    }
  }

  # Container declaration metadata for COS
  metadata = {
    gce-container-declaration = local.container_declaration
    google-logging-enabled    = "true"
    google-monitoring-enabled = "true"
  }

  # Startup script to prepare the host
  metadata_startup_script = <<-EOF
    #!/bin/bash
    # Create media directory for persistent storage
    mkdir -p /var/elosaude/media
    chmod 777 /var/elosaude/media
  EOF

  # Service account for IAM
  service_account {
    email  = google_service_account.backend.email
    scopes = ["cloud-platform"]
  }

  # Network tags for firewall rules
  tags = var.network_tags

  # Labels for organization
  labels = merge(var.labels, {
    container-vm = "elosaude-backend"
  })

  # Allow stopping for updates
  allow_stopping_for_update = true

  # Ensure service account is created first
  depends_on = [
    google_service_account.backend,
    google_project_iam_member.logging,
    google_project_iam_member.monitoring,
    google_project_iam_member.artifact_registry
  ]
}
