#!/bin/bash

################################################################################
# Bricolage - Script de Restauration
#
# Ce script restaure un backup de la base de données et/ou des fichiers
#
# Usage: ./scripts/restore.sh [backup_date]
# Example: ./scripts/restore.sh 20250122_140000
################################################################################

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_PATH="${DB_PATH:-./backend/data/production.db}"
UPLOADS_DIR="${UPLOADS_DIR:-./backend/uploads}"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Vérifier que le dossier de backup existe
if [ ! -d "$BACKUP_DIR" ]; then
    error "Dossier de backup non trouvé : $BACKUP_DIR"
    exit 1
fi

# Si aucune date spécifiée, lister les backups disponibles
if [ -z "$1" ]; then
    info "Backups disponibles :"
    echo ""
    find "$BACKUP_DIR" -name "db_backup_*.db.gz" -type f -printf '%T@ %p\n' | \
        sort -rn | while read timestamp file; do
        date=$(basename "$file" | sed 's/db_backup_\(.*\)\.db\.gz/\1/')
        size=$(du -h "$file" | cut -f1)
        echo "  📅 $date ($size)"
    done
    echo ""
    info "Usage: ./scripts/restore.sh [backup_date]"
    info "Example: ./scripts/restore.sh 20250122_140000"
    exit 0
fi

BACKUP_DATE="$1"
DB_BACKUP_FILE="$BACKUP_DIR/db_backup_${BACKUP_DATE}.db.gz"
UPLOADS_BACKUP_FILE="$BACKUP_DIR/uploads_backup_${BACKUP_DATE}.tar.gz"

log "🔄 Restauration du backup du $BACKUP_DATE"

# Demander confirmation
warning "⚠️  ATTENTION : Cette opération va écraser les données actuelles !"
read -p "Voulez-vous continuer ? (oui/non) : " confirmation

if [ "$confirmation" != "oui" ]; then
    log "❌ Restauration annulée"
    exit 0
fi

# 1. Restaurer la base de données
if [ -f "$DB_BACKUP_FILE" ]; then
    log "📊 Restauration de la base de données..."

    # Backup de la DB actuelle avant restauration
    if [ -f "$DB_PATH" ]; then
        SAFETY_BACKUP="${DB_PATH}.before_restore_$(date +%Y%m%d_%H%M%S)"
        cp "$DB_PATH" "$SAFETY_BACKUP"
        log "✅ Backup de sécurité créé : $SAFETY_BACKUP"
    fi

    # Décompresser et restaurer
    gunzip -c "$DB_BACKUP_FILE" > "$DB_PATH"

    # Vérifier l'intégrité
    if sqlite3 "$DB_PATH" "PRAGMA integrity_check;" > /dev/null 2>&1; then
        log "✅ Base de données restaurée avec succès"
    else
        error "❌ Base de données restaurée corrompue !"
        if [ -f "$SAFETY_BACKUP" ]; then
            mv "$SAFETY_BACKUP" "$DB_PATH"
            log "✅ Restauration du backup de sécurité"
        fi
        exit 1
    fi
else
    warning "⚠️  Backup de base de données non trouvé : $DB_BACKUP_FILE"
fi

# 2. Restaurer les fichiers uploadés
if [ -f "$UPLOADS_BACKUP_FILE" ]; then
    log "📁 Restauration des fichiers uploadés..."

    # Backup du dossier actuel
    if [ -d "$UPLOADS_DIR" ]; then
        SAFETY_UPLOADS="${UPLOADS_DIR}_before_restore_$(date +%Y%m%d_%H%M%S)"
        mv "$UPLOADS_DIR" "$SAFETY_UPLOADS"
        log "✅ Backup de sécurité des uploads : $SAFETY_UPLOADS"
    fi

    # Restaurer
    mkdir -p "$(dirname "$UPLOADS_DIR")"
    tar -xzf "$UPLOADS_BACKUP_FILE" -C "$(dirname "$UPLOADS_DIR")"
    log "✅ Fichiers uploadés restaurés avec succès"
else
    warning "⚠️  Backup des uploads non trouvé : $UPLOADS_BACKUP_FILE"
fi

log "✅ Restauration terminée avec succès !"
log "ℹ️  Pensez à redémarrer l'application : docker-compose restart"

exit 0
