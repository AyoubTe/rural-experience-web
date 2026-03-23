import { http, HttpResponse } from 'msw';

export const handlers = [

  // Experience search
  http.get('/api/v1/experiences', ({ request }) => {
    const url      = new URL(request.url);
    const keyword  = url.searchParams.get('keyword') ?? '';

    return HttpResponse.json({
      content: [
        {
          id: 1,
          title: 'Three-Day Lavender Harvest',
          description: 'Harvest lavender in Provence...',
          pricePerPerson: 120,
          durationDays: 3,
          maxGuests: 6,
          averageRating: 4.8,
          reviewCount: 23,
          status: 'PUBLISHED',
          location: 'Valensole',
          country: 'France',
          coverPhotoUrl: null,
          category: { id: 1, name: 'Farm Life', emoji: '��' },
          host: {
            id: 2, firstName: 'Jean', lastName: 'Martin',
            isVerified: true, avatarUrl: null,
          },
        },
      ].filter(e =>
        !keyword || e.title.toLowerCase().includes(keyword)
      ),
      page: 0, size: 12, totalElements: 1,
      totalPages: 1, first: true, last: true, numberOfElements: 1,
    });
  }),

  // Create booking
  http.post('/api/v1/bookings', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      id:              42,
      status:          'PENDING',
      startDate:       body.startDate,
      endDate:         body.endDate,
      numberOfGuests:  body.numberOfGuests,
      totalPrice:      720,
      specialRequests: body.specialRequests ?? null,
      createdAt:       new Date().toISOString(),
      experience: {
        id: body.experienceId, title: 'Three-Day Lavender Harvest',
        coverPhotoUrl: null, location: 'Valensole',
      },
      explorer: {
        id: 1, firstName: 'Marie', lastName: 'Dupont', avatarUrl: null
      },
      host: {
        id: 2, firstName: 'Jean', lastName: 'Martin', avatarUrl: null
      },
    }, { status: 201 });
  }),

  // Auth login
  http.post('/api/v1/auth/login', async ({ request }) => {
    const { email, password } = await request.json() as any;

    if (email === 'explorer@test.com' && password === 'Password1!') {
      return HttpResponse.json({
        accessToken:  'test-access-token',
        refreshToken: 'test-refresh-token',
        tokenType:    'Bearer',
        expiresIn:    900,
        user: {
          id: 1, email, firstName: 'Marie', lastName: 'Dupont',
          role: 'EXPLORER', avatarUrl: null,
        },
      });
    }

    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }),
];
