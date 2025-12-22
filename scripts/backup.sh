#!/bin/bash

################################################################################
# Bricolage - Script de Backup Automatique
#
# Ce script effectue des backups de :
# - Base de données SQLite
# - Fichiers uploadés (images, documents)
#
# Usage: ./scripts/backup.sh
# Cron: 0 2 * * * /app/bricolage/scripts/backup.sh
################################################################################

set -e  # Exit on error

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_PATH="${DB_PATH:-./backend/data/production.db}"
UPLOADS_DIR="${UPLOADS_DIR:-./backend/uploads}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"  # Garder 30 jours de backups
DATE=$(date +%Y%m%d_%H%M%S)

# Couleurs pour logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction de log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Créer le dossier de backup s'il n'existe pas
mkdir -p "$BACKUP_DIR"

log "🚀 Début du backup..."

# 1. Backup de la base de données
log "📊 Backup de la base de données SQLite..."

if [ -f "$DB_PATH" ]; then
    DB_BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.db"
    cp "$DB_PATH" "$DB_BACKUP_FILE"

    # Vérifier l'intégrité du backup
    if sqlite3 "$DB_BACKUP_FILE" "PRAGMA integrity_check;" > /dev/null 2>&1; then
        log "✅ Base de données sauvegardée : $DB_BACKUP_FILE"

        # Compresser le backup
        gzip "$DB_BACKUP_FILE"
        log "✅ Base de données compressée : ${DB_BACKUP_FILE}.gz"
    else
        error "❌ Backup de la base de données corrompu !"
        rm -f "$DB_BACKUP_FILE"
        exit 1
    fi
else
    warning "⚠️  Base de données non trouvée : $DB_PATH"
fi

# 2. Backup des fichiers uploadés
log "📁 Backup des fichiers uploadés..."

if [ -d "$UPLOADS_DIR" ]; then
    UPLOADS_BACKUP_FILE="$BACKUP_DIR/uploads_backup_$DATE.tar.gz"
    tar -czf "$UPLOADS_BACKUP_FILE" -C "$(dirname "$UPLOADS_DIR")" "$(basename "$UPLOADS_DIR")" 2>/dev/null || true

    if [ -f "$UPLOADS_BACKUP_FILE" ]; then
        UPLOAD_SIZE=$(du -h "$UPLOADS_BACKUP_FILE" | cut -f1)
        log "✅ Fichiers uploadés sauvegardés : $UPLOADS_BACKUP_FILE ($UPLOAD_SIZE)"
    else
        warning "⚠️  Aucun fichier à sauvegarder"
    fi
else
    warning "⚠️  Dossier uploads non trouvé : $UPLOADS_DIR"
fi

# 3. Nettoyage des anciens backups
log "🧹 Nettoyage des backups de plus de $RETENTION_DAYS jours..."

DELETED_COUNT=0
if [ -d "$BACKUP_DIR" ]; then
    DELETED_COUNT=$(find "$BACKUP_DIR" -name "*.gz" -type f -mtime +$RETENTION_DAYS -delete -print | wc -l)
fi

if [ "$DELETED_COUNT" -gt 0 ]; then
    log "✅ $DELETED_COUNT ancien(s) backup(s) supprimé(s)"
else
    log "ℹ️  Aucun ancien backup à supprimer"
fi

# 4. Statistiques
log "📊 Statistiques des backups :"
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "*.gz" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
log "   - Nombre total de backups : $TOTAL_BACKUPS"
log "   - Taille totale : $TOTAL_SIZE"

# 5. Liste des 5 derniers backups
log "📋 Les 5 derniers backups :"
find "$BACKUP_DIR" -name "*.gz" -type f -printf '%T@ %p\n' | sort -rn | head -5 | while read timestamp file; do
    filename=$(basename "$file")
    size=$(du -h "$file" | cut -f1)
    date=$(date -d "@${timestamp%.*}" '+%Y-%m-%d %H:%M:%S')
    echo "   - $filename ($size) - $date"
done

log "✅ Backup terminé avec succès !"

exit 0
