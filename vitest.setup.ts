import { vi } from 'vitest';

vi.mock('@clerk/nextjs/server', () => ({
	currentUser: vi.fn().mockResolvedValue({
		emailAddresses: [{ emailAddress: 'test@example.com' }],
		firstName: 'Jane',
		lastName: 'Doe',
	}),
}));


