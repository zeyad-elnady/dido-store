#!/bin/bash
set -e

echo "==> Dido Store Backend Entrypoint"

# Wait for database to be ready (extra safety beyond healthcheck)
echo "==> Waiting for database connection..."
until php artisan db:monitor --databases=mysql 2>/dev/null; do
    echo "    Database not ready, retrying in 2s..."
    sleep 2
done
echo "==> Database is ready!"

# Create storage symlink
echo "==> Creating storage symlink..."
php artisan storage:link --force 2>/dev/null || true

# Run migrations
echo "==> Running migrations..."
php artisan migrate --force

# Check if seeder has already run (check if admin user exists)
ADMIN_EXISTS=$(php artisan tinker --execute="echo \App\Models\User::count();" 2>/dev/null || echo "0")
if [ "$ADMIN_EXISTS" = "0" ]; then
    echo "==> Running seeders (first start)..."
    php artisan db:seed --force
else
    echo "==> Seeders already ran, skipping."
fi

# Cache config and routes for production
if [ "$APP_ENV" != "local" ]; then
    echo "==> Caching config and routes..."
    php artisan config:cache || true
    php artisan route:cache || true
fi

echo "==> Starting PHP-FPM..."
exec "$@"
