# =============================================================================
# Elosaude Backend - Main Terraform Configuration
# =============================================================================

# -----------------------------------------------------------------------------
# Local Variables
# -----------------------------------------------------------------------------

locals {
  common_labels = merge(var.labels, {
    environment = var.environment
  })
}

# -----------------------------------------------------------------------------
# Enable Required GCP APIs
# -----------------------------------------------------------------------------

resource "google_project_service" "required_apis" {
  for_each = toset([
    "compute.googleapis.com",
    "artifactregistry.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
  ])

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

# -----------------------------------------------------------------------------
# Networking Module (Firewall Rules)
# -----------------------------------------------------------------------------

module "networking" {
  source = "./modules/networking"

  project_id         = var.project_id
  environment        = var.environment
  allowed_ssh_ranges = var.allowed_ssh_ranges

  depends_on = [google_project_service.required_apis]
}

# -----------------------------------------------------------------------------
# Artifact Registry Module
# -----------------------------------------------------------------------------

module "registry" {
  source = "./modules/registry"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  labels      = local.common_labels

  depends_on = [google_project_service.required_apis]
}

# -----------------------------------------------------------------------------
# Compute Module (GCE VM)
# -----------------------------------------------------------------------------

module "compute" {
  source = "./modules/compute"

  project_id           = var.project_id
  region               = var.region
  zone                 = var.zone
  environment          = var.environment
  machine_type         = var.machine_type
  container_image      = var.container_image
  database_url         = var.database_url
  django_secret_key    = var.django_secret_key
  django_allowed_hosts = var.django_allowed_hosts
  network_tags         = module.networking.backend_network_tags
  labels               = local.common_labels

  depends_on = [
    google_project_service.required_apis,
    module.networking,
    module.registry
  ]
}
