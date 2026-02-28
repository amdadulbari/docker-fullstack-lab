#!/usr/bin/env python
"""
Django Management Utility — manage.py
──────────────────────────────────────
Standard Django entry point for management commands.
Usage examples:
  python manage.py runserver        → start dev server
  python manage.py migrate          → apply database migrations
  python manage.py makemigrations   → create new migration files
  python manage.py createsuperuser  → create an admin user
  python manage.py shell            → open Django interactive shell
"""

import os
import sys


def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
