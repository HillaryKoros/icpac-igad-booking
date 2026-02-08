from django.core.management.base import BaseCommand
from apps.rooms.models import Room, RoomAmenity


class Command(BaseCommand):
    help = 'Initialize rooms and amenities with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Creating amenities...')

        amenities_data = [
            {'name': 'Projector', 'icon': '📽️', 'description': 'Digital projector for presentations'},
            {'name': 'Whiteboard', 'icon': '📝', 'description': 'Whiteboard with markers'},
            {'name': 'Video Conferencing', 'icon': '📹', 'description': 'Video conference setup'},
            {'name': 'Audio System', 'icon': '🎤', 'description': 'Sound system with microphones'},
            {'name': 'TV Screen', 'icon': '📺', 'description': 'Large TV screen'},
            {'name': 'Screen', 'icon': '🖥️', 'description': 'Projection screen'},
            {'name': 'Computers', 'icon': '💻', 'description': 'Computer workstations'},
            {'name': 'Internet Access', 'icon': '🌐', 'description': 'WiFi internet access'},
            {'name': 'Printers', 'icon': '🖨️', 'description': 'Printing facilities'},
            {'name': 'Air Conditioning', 'icon': '❄️', 'description': 'Climate control'},
            {'name': 'Natural Light', 'icon': '☀️', 'description': 'Windows with natural lighting'},
            {'name': 'Catering Setup', 'icon': '🍽️', 'description': 'Setup for food and beverages'},
        ]

        for amenity_data in amenities_data:
            amenity, created = RoomAmenity.objects.get_or_create(
                name=amenity_data['name'],
                defaults=amenity_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Created amenity: {amenity.name}'))
            else:
                self.stdout.write(f'  Amenity already exists: {amenity.name}')

        self.stdout.write('\nCreating rooms...')

        rooms_data = [
            {
                'name': 'Conference Room - Ground Floor',
                'capacity': 200,
                'category': 'conference',
                'floor': '0',
                'location': 'Main Building, Ground Floor',
                'is_active': True,
                'description': 'Large conference room on the ground floor with modern AV equipment',
                'amenities': ['Projector', 'Whiteboard', 'Video Conferencing', 'Audio System', 'Air Conditioning', 'Catering Setup']
            },
            {
                'name': 'Boardroom - First Floor',
                'capacity': 25,
                'category': 'boardroom',
                'floor': '1',
                'location': 'Main Building, First Floor',
                'is_active': True,
                'description': 'Executive boardroom on the first floor for high-level meetings',
                'amenities': ['TV Screen', 'Whiteboard', 'Video Conferencing', 'Air Conditioning']
            },
            {
                'name': 'Computer Lab 1 - Ground Floor',
                'capacity': 20,
                'category': 'training',
                'floor': '0',
                'location': 'ICT Wing, Ground Floor',
                'is_active': True,
                'description': 'Computer training lab with workstations and modern equipment',
                'amenities': ['Computers', 'Projector', 'Whiteboard', 'Internet Access', 'Air Conditioning', 'Printers']
            },
            {
                'name': 'Computer Lab 2 - First Floor',
                'capacity': 25,
                'category': 'training',
                'floor': '1',
                'location': 'ICT Wing, First Floor',
                'is_active': True,
                'description': 'Advanced computer lab for technical training and workshops',
                'amenities': ['Computers', 'Projector', 'Whiteboard', 'Internet Access', 'Air Conditioning']
            },
            {
                'name': 'Situation Room',
                'capacity': 8,
                'category': 'meeting',
                'floor': '1',
                'location': 'Main Building, First Floor',
                'is_active': True,
                'description': 'Small meeting room ideal for team discussions and planning sessions',
                'amenities': ['Screen', 'Whiteboard', 'Natural Light']
            },
            {
                'name': 'Small Boardroom - 1st Floor',
                'capacity': 12,
                'category': 'meeting',
                'floor': '1',
                'location': 'Main Building, First Floor',
                'is_active': True,
                'description': 'Compact boardroom for small group meetings and interviews',
                'amenities': ['TV Screen', 'Whiteboard', 'Air Conditioning', 'Natural Light']
            },
        ]

        for room_data in rooms_data:
            room, created = Room.objects.get_or_create(
                name=room_data['name'],
                defaults=room_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Created room: {room.name}'))
            else:
                self.stdout.write(f'  Room already exists: {room.name}')

        self.stdout.write(self.style.SUCCESS('\n✅ Initialization complete!'))
