require('@testing-library/jest-dom');
const { TextEncoder, TextDecoder } = require('util');

// Add global polyfills for Node.js environment
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder;
}

// Mock Web APIs for Node.js environment
const mockRequest = class MockRequest {
  constructor(url, options = {}) {
    this.url = url;
    this.method = options.method || 'GET';
    this.headers = new Map(Object.entries(options.headers || {}));
    this.body = options.body;
  }
  
  async json() {
    return this.body ? JSON.parse(this.body) : {};
  }
  
  async text() {
    return this.body || '';
  }
};

const mockResponse = class MockResponse {
  constructor(body, options = {}) {
    this.body = body;
    this.status = options.status || 200;
    this.statusText = options.statusText || 'OK';
    this.headers = new Map(Object.entries(options.headers || {}));
    this.ok = this.status >= 200 && this.status < 300;
  }
  
  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
  }
  
  async text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
  }
};

// Add to global scope
global.Request = mockRequest;
global.Response = mockResponse;
global.Headers = Map;

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, options = {}) => {
      return new mockResponse(data, {
        status: options.status || 200,
        headers: { 'Content-Type': 'application/json', ...options.headers }
      });
    },
    redirect: (url) => {
      return new mockResponse('', {
        status: 302,
        headers: { Location: url }
      });
    }
  },
  NextRequest: mockRequest
}));

// Mock Clerk authentication
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn(() => Promise.resolve({ userId: 'test-user-id' })),
  currentUser: jest.fn(() => Promise.resolve({ id: 'test-user-id' })),
  ClerkProvider: ({ children }) => children,
  useAuth: () => ({ isSignedIn: true, userId: 'test-user-id' }),
  useUser: () => ({ user: { id: 'test-user-id' } }),
  SignIn: () => 'SignIn Component',
  SignUp: () => 'SignUp Component',
  UserButton: () => 'UserButton Component',
}));

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock MongoDB connection
jest.mock('./lib/mongodb', () => ({
  default: Promise.resolve({
    db: () => ({
      collection: () => ({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([])
        }),
        findOne: jest.fn().mockResolvedValue(null),
        insertOne: jest.fn().mockResolvedValue({ insertedId: 'mock-id' }),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
        countDocuments: jest.fn().mockResolvedValue(0),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([])
        })
      })
    })
  })
}));

// Mock environment variables
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock';
process.env.CLERK_SECRET_KEY = 'sk_test_mock';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';

// Suppress console warnings during tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes('ReactDOMTestUtils.act')) return;
  if (args[0]?.includes('Warning: ')) return;
  originalWarn.call(console, ...args);
};
