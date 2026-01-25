import { vi } from 'vitest';

vi.mock('@clerk/nextjs/server', () => ({
	currentUser: vi.fn().mockResolvedValue({
		emailAddresses: [{ emailAddress: 'test@example.com' }],
		firstName: 'Jane',
		lastName: 'Doe',
	}),
}));

vi.mock('@/lib/audit-logger', () => ({
	createAuditLog: vi.fn().mockResolvedValue(undefined),
	summarizeChanges: vi.fn(() => 'Test change'),
	getEntityAuditLog: vi.fn().mockResolvedValue([]),
	getUserAuditLog: vi.fn().mockResolvedValue([]),
	getAuditLogs: vi.fn().mockResolvedValue([]),
}));
