"""
Management command: python manage.py seed_data
Creates sample genres and games for development/demo purposes.
Run this once after: python manage.py migrate
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.games.models import Genre, Game
from datetime import date


class Command(BaseCommand):
    help = 'Seeds the database with sample genres, games, and a demo user.'

    def handle(self, *args, **kwargs):
        self.stdout.write('🌱 Seeding database...')

        # ── Create Genres ──────────────────────────────────────────────────
        genres_data = ['RPG', 'FPS', 'Strategy', 'Adventure', 'Sports',
                       'Simulation', 'Horror', 'Platformer', 'Indie', 'Racing']
        genres = {}
        for name in genres_data:
            g, created = Genre.objects.get_or_create(name=name)
            genres[name] = g
            if created:
                self.stdout.write(f'  ✓ Genre: {name}')

        # ── Create Games ───────────────────────────────────────────────────
        games_data = [
            {
                'title': 'The Witcher 3: Wild Hunt',
                'description': 'An open-world RPG set in a visually stunning fantasy universe full of meaningful choices and impactful consequences.',
                'developer': 'CD Projekt Red',
                'publisher': 'CD Projekt',
                'genre': genres['RPG'],
                'price': 19.99,
                'release_date': date(2015, 5, 19),
            },
            {
                'title': 'Counter-Strike 2',
                'description': 'The world\'s most iconic competitive first-person shooter returns with a new engine and improved gameplay.',
                'developer': 'Valve',
                'publisher': 'Valve',
                'genre': genres['FPS'],
                'price': 0.00,
                'release_date': date(2023, 9, 27),
            },
            {
                'title': 'Civilization VI',
                'description': 'Build an empire to stand the test of time. Explore a new land, research technology, build cities.',
                'developer': 'Firaxis Games',
                'publisher': '2K',
                'genre': genres['Strategy'],
                'price': 29.99,
                'release_date': date(2016, 10, 21),
            },
            {
                'title': 'Hollow Knight',
                'description': 'Forge your own path in Hollow Knight! An epic action-adventure through a vast ruined kingdom of insects.',
                'developer': 'Team Cherry',
                'publisher': 'Team Cherry',
                'genre': genres['Indie'],
                'price': 14.99,
                'release_date': date(2017, 2, 24),
            },
            {
                'title': 'FIFA 24',
                'description': 'EA SPORTS FC 24 welcomes you to The World\'s Game with HyperMotionV technology.',
                'developer': 'EA Sports',
                'publisher': 'Electronic Arts',
                'genre': genres['Sports'],
                'price': 59.99,
                'release_date': date(2023, 9, 29),
            },
            {
                'title': 'Stardew Valley',
                'description': 'You\'ve inherited your grandfather\'s old farm plot in Stardew Valley. Build the farm of your dreams!',
                'developer': 'ConcernedApe',
                'publisher': 'ConcernedApe',
                'genre': genres['Simulation'],
                'price': 13.99,
                'release_date': date(2016, 2, 26),
            },
            {
                'title': 'Alien: Isolation',
                'description': 'Discover the true meaning of fear in Alien: Isolation. A first-person survival horror game set in an atmosphere of constant dread.',
                'developer': 'Creative Assembly',
                'publisher': 'SEGA',
                'genre': genres['Horror'],
                'price': 24.99,
                'release_date': date(2014, 10, 7),
            },
            {
                'title': 'Celeste',
                'description': 'Help Madeline survive her journey to the top of Celeste Mountain in this precise platformer.',
                'developer': 'Maddy Thorson',
                'publisher': 'Matt Makes Games',
                'genre': genres['Platformer'],
                'price': 19.99,
                'release_date': date(2018, 1, 25),
            },
        ]

        for data in games_data:
            game, created = Game.objects.get_or_create(
                title=data['title'],
                defaults=data
            )
            if created:
                self.stdout.write(f'  ✓ Game: {game.title}')

        # ── Create Demo User ───────────────────────────────────────────────
        if not User.objects.filter(username='demo').exists():
            User.objects.create_user(
                username='demo',
                email='demo@ministeam.com',
                password='demo1234!',
                first_name='Demo',
                last_name='User'
            )
            self.stdout.write('  ✓ Demo user created (username: demo / password: demo1234!)')

        self.stdout.write(self.style.SUCCESS('\n✅ Database seeded successfully!'))
        self.stdout.write('   Run: python manage.py runserver')
        self.stdout.write('   Admin: http://localhost:8000/admin/')
        self.stdout.write('   Demo login: demo / demo1234!')
