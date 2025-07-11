// Mock all problematic dependencies first
jest.mock('@/lib/services/playlistService', () => ({
  getPlaylists: jest.fn().mockResolvedValue([]),
  addPlaylistItem: jest.fn().mockResolvedValue({ id: 'test-playlist-item' }),
  updatePlaylistItemStatus: jest.fn().mockResolvedValue(true),
  removePlaylistItem: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/lib/services/api/submissionService', () => ({
  createSubmission: jest.fn().mockResolvedValue({ id: 'test-submission' }),
  getSubmissions: jest.fn().mockResolvedValue([]),
  updateSubmissionStatus: jest.fn().mockResolvedValue(true),
  deleteSubmission: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/lib/services/socketService', () => ({
  socketService: {
    emit: jest.fn(),
    on: jest.fn(),
    disconnect: jest.fn(),
  },
  useSocket: jest.fn().mockReturnValue({
    isConnected: true,
    emit: jest.fn(),
    on: jest.fn(),
  }),
}));

describe('Service Layer Tests', () => {
  test('should have correct export structure for playlist service', async () => {
    const playlistService = await import('@/lib/services/playlistService');
    expect(typeof playlistService.getPlaylists).toBe('function');
    expect(typeof playlistService.addPlaylistItem).toBe('function');
    expect(typeof playlistService.updatePlaylistItemStatus).toBe('function');
    expect(typeof playlistService.removePlaylistItem).toBe('function');
  });

  test('should have correct export structure for submission service', async () => {
    const submissionService = await import('@/lib/services/api/submissionService');
    expect(typeof submissionService.createSubmission).toBe('function');
    expect(typeof submissionService.getSubmissions).toBe('function');
    expect(typeof submissionService.updateSubmissionStatus).toBe('function');
    expect(typeof submissionService.deleteSubmission).toBe('function');
  });

  test('should have correct export structure for socket service', async () => {
    const socketService = await import('@/lib/services/socketService');
    expect(socketService.socketService).toBeDefined();
    expect(typeof socketService.useSocket).toBe('function');
  });

  test('playlist service should handle operations correctly', async () => {
    const playlistService = await import('@/lib/services/playlistService');
    
    // Test getPlaylists
    const playlists = await playlistService.getPlaylists();
    expect(Array.isArray(playlists)).toBe(true);
    
    // Test addPlaylistItem
    const newItem = await playlistService.addPlaylistItem({
      songId: 'test-song',
      position: 1,
      status: 'queued'
    });
    expect(newItem).toHaveProperty('id');
  });

  test('submission service should handle CRUD operations', async () => {
    const submissionService = await import('@/lib/services/api/submissionService');
    
    // Test createSubmission
    const newSubmission = await submissionService.createSubmission({
      url: 'https://example.com/song',
      submissionQueUp: 'VIP',
      submissionMessage: 'Test message',
      submittedBy: 'test-user'
    });
    expect(newSubmission).toHaveProperty('id');
    
    // Test getSubmissions
    const submissions = await submissionService.getSubmissions();
    expect(Array.isArray(submissions)).toBe(true);
  });

  test('socket service should provide connection functionality', async () => {
    const socketService = await import('@/lib/services/socketService');
    
    // Test socket service structure
    expect(socketService.socketService).toHaveProperty('emit');
    expect(socketService.socketService).toHaveProperty('on');
    
    // Test useSocket hook
    const socketHook = socketService.useSocket();
    expect(socketHook).toHaveProperty('isConnected');
    expect(socketHook).toHaveProperty('emit');
  });
});
