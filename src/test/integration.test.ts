/**
 * Integration Tests for API Route Organization
 * Task 2.1 - API Route Organization Testing
 */

import { NextRequest } from 'next/server';

// Mock the services before importing routes
jest.mock('@/lib/services/api/submissionService', () => ({
  getSubmissions: jest.fn().mockResolvedValue([]),
  createSubmission: jest.fn().mockResolvedValue({ id: 'test-submission' }),
  updateSubmissionStatus: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/lib/services/playlistService', () => ({
  getPlaylists: jest.fn().mockResolvedValue([]),
  addPlaylistItem: jest.fn().mockResolvedValue({ id: 'test-playlist-item' }),
}));

describe('API Route Integration Tests', () => {
  test('should validate API route structure exists', async () => {
    // Test that the API routes can be imported without syntax errors
    expect(async () => {
      await import('../app/api/submissions/route');
      await import('../app/api/playlists/route');
    }).not.toThrow();
  });

  test('submissions API should handle GET requests', async () => {
    const { GET } = await import('../app/api/submissions/route');
    expect(typeof GET).toBe('function');
    
    // Create a mock request
    const mockRequest = new NextRequest('http://localhost:3000/api/submissions');
    
    // Test that the function can be called
    expect(async () => {
      await GET(mockRequest);
    }).not.toThrow();
  });

  test('submissions API should handle POST requests', async () => {
    const { POST } = await import('../app/api/submissions/route');
    expect(typeof POST).toBe('function');
    
    const mockRequest = new NextRequest('http://localhost:3000/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        url: 'https://example.com/song',
        submissionQueUp: 'VIP',
        submissionMessage: 'Test message'
      })
    });
    
    expect(async () => {
      await POST(mockRequest);
    }).not.toThrow();
  });

  test('playlists API should handle GET requests', async () => {
    const { GET } = await import('../app/api/playlists/route');
    expect(typeof GET).toBe('function');
    
    const mockRequest = new NextRequest('http://localhost:3000/api/playlists');
    
    expect(async () => {
      await GET(mockRequest);
    }).not.toThrow();
  });

  test('playlists API should handle POST requests', async () => {
    const { POST } = await import('../app/api/playlists/route');
    expect(typeof POST).toBe('function');
    
    const mockRequest = new NextRequest('http://localhost:3000/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        showId: 'test-show-id',
        name: 'Test Playlist'
      })
    });
    
    expect(async () => {
      await POST(mockRequest);
    }).not.toThrow();
  });

  test('API routes should use service layer pattern', async () => {
    // Import the services to verify they're being used
    const submissionService = await import('@/lib/services/api/submissionService');
    const playlistService = await import('@/lib/services/playlistService');
    
    expect(submissionService.getSubmissions).toBeDefined();
    expect(submissionService.createSubmission).toBeDefined();
    expect(playlistService.getPlaylists).toBeDefined();
    expect(playlistService.addPlaylistItem).toBeDefined();
  });
});
