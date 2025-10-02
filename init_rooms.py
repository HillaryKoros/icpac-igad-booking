from apps.rooms.models import Room, RoomAmenity

print('Creating amenities...')

amenities_data = [
    {'name': 'Air Conditioning', 'icon': '❄️', 'description': 'Climate control'},
    {'name': 'Audio System', 'icon': '🎤', 'description': 'Sound system with microphones'},
    {'name': 'Catering Setup', 'icon': '🍽️', 'description': 'Setup for food and beverages'},
    {'name': 'Computers', 'icon': '💻', 'description': 'Computer workstations'},
    {'name': 'Internet Access', 'icon': '🌐', 'description': 'WiFi internet access'},
    {'name': 'Natural Light', 'icon': '☀️', 'description': 'Windows with natural lighting'},
    {'name': 'Printers', 'icon': '🖨️', 'description': 'Printing facilities'},
    {'name': 'Projector', 'icon': '📽️', 'description': 'Digital projector for presentations'},
    {'name': 'Screen', 'icon': '🖥️', 'description': 'Projection screen'},
    {'name': 'TV Screen', 'icon': '📺', 'description': 'Large TV screen'},
    {'name': 'Video Conferencing', 'icon': '📹', 'description': 'Video conference setup'},
    {'name': 'Whiteboard', 'icon': '📝', 'description': 'Whiteboard with markers'},
]

for amenity_data in amenities_data:
    amenity, created = RoomAmenity.objects.get_or_create(
        name=amenity_data['name'],
        defaults=amenity_data
    )
    if created:
        print(f'✓ Created amenity: {amenity.name}')
    else:
        print(f'  Amenity already exists: {amenity.name}')

print('\nCreating rooms...')

rooms_data = [
    {
        'name': 'Conference Room - Ground Floor',
        'capacity': 200,
        'category': 'conference',
        'floor': '0',
        'is_active': True,
        'description': 'Large conference room on the ground floor'
    },
    {
        'name': 'Boardroom - First Floor',
        'capacity': 25,
        'category': 'conference',
        'floor': '1',
        'is_active': True,
        'description': 'Executive boardroom on the first floor'
    },
    {
        'name': 'Small Boardroom - 1st Floor',
        'capacity': 10,
        'category': 'conference',
        'floor': '1',
        'is_active': True,
        'description': 'Small executive boardroom on the first floor'
    },
    {
        'name': 'Computer Lab 1 - Ground Floor',
        'capacity': 20,
        'category': 'training',
        'floor': '0',
        'is_active': True,
        'description': 'Computer training lab with workstations'
    },
    {
        'name': 'Computer Lab 2 - First Floor',
        'capacity': 20,
        'category': 'training',
        'floor': '1',
        'is_active': True,
        'description': 'Computer training lab on first floor'
    },
    {
        'name': 'Situation Room',
        'capacity': 8,
        'category': 'meeting',
        'floor': '0',
        'is_active': True,
        'description': 'Situation room for emergency meetings'
    },
]

for room_data in rooms_data:
    room, created = Room.objects.get_or_create(
        name=room_data['name'],
        defaults=room_data
    )
    if created:
        print(f'✓ Created room: {room.name}')
    else:
        print(f'  Room already exists: {room.name}')

print('\n✅ Initialization complete!')
