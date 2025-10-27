.PHONY: install migrate run test clean seed superuser shell

install:
	pip install -r requirements.txt

migrate:
	python manage.py makemigrations
	python manage.py migrate

run:
	python manage.py runserver

test:
	python manage.py test

seed:
	python manage.py seed_data

clean:
	find . -type d -name __pycache__ -exec rm -r {} +
	find . -type f -name "*.pyc" -delete

superuser:
	python manage.py createsuperuser

shell:
	python manage.py shell
