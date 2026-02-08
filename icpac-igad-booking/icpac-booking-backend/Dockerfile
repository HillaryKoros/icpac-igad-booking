# Use Python 3.11 slim image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV DJANGO_SETTINGS_MODULE=icpac_booking.settings

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create staticfiles directory
RUN mkdir -p staticfiles

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Create entrypoint script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Wait for postgres\n\
echo "Waiting for postgres..."\n\
while ! pg_isready -h $PGHOST -p $PGPORT -U $PGUSER; do\n\
  echo "Postgres is unavailable - sleeping"\n\
  sleep 1\n\
done\n\
echo "Postgres is up - executing command"\n\
\n\
# Run migrations\n\
python manage.py migrate\n\
\n\
# Initialize rooms and amenities\n\
echo "Initializing rooms..."\n\
python manage.py init_rooms\n\
\n\
# Create default admin if no superuser exists\n\
python manage.py shell -c "\n\
from apps.authentication.models import User\n\
if not User.objects.filter(is_superuser=True).exists():\n\
    user = User.objects.create_superuser(\n\
        username=\"admin\",\n\
        email=\"admin@icpac.net\",\n\
        password=\"admin123\",\n\
        first_name=\"Admin\",\n\
        last_name=\"User\"\n\
    )\n\
    user.is_email_verified = True\n\
    user.role = \"super_admin\"\n\
    user.save()\n\
    print(\"Default admin created: admin@icpac.net / admin123\")\n\
else:\n\
    print(\"Superuser already exists, skipping.\")\n\
"\n\
\n\
# Start server\n\
exec "$@"' > /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]