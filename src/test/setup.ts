import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        get length() {
            return Object.keys(store).length;
        },
        key: vi.fn((index: number) => Object.keys(store)[index] || null),
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock window.location
const locationMock = {
    href: '',
    pathname: '/',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
};

Object.defineProperty(window, 'location', {
    value: locationMock,
    writable: true,
});

// Reset mocks before each test
beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    locationMock.href = '';
    locationMock.pathname = '/';
});

// Export mocks for use in tests
export { localStorageMock, locationMock };
