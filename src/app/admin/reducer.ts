import { SubmissionData, PlaylistItemData } from '../../../lib/types';

// 1. Define the state shape
export interface AdminState {
  submissions: SubmissionData[];
  queue: PlaylistItemData[];
  played: PlaylistItemData[];
  nowPlaying: PlaylistItemData | null;
  isPlayingNext: boolean;
  currentRating: number;
  isSavingRating: boolean;
  isQueueLocked: boolean;
  leftHudOpen: boolean;
  rightHudOpen: boolean;
  isClearingPlayed: boolean;
}

// 2. Define the initial state
export const initialState: AdminState = {
  submissions: [],
  queue: [],
  played: [],
  nowPlaying: null,
  isPlayingNext: false,
  currentRating: 50,
  isSavingRating: false,
  isQueueLocked: false,
  leftHudOpen: false,
  rightHudOpen: false,
  isClearingPlayed: false,
};

// 3. Define the actions
export type AdminAction =
  | { type: 'FETCH_SUCCESS'; payload: { submissions: SubmissionData[]; queue: PlaylistItemData[]; played: PlaylistItemData[]; nowPlaying: PlaylistItemData | null; isQueueLocked: boolean; } }
  | { type: 'PLAY_NEXT_START' }
  | { type: 'PLAY_NEXT_FINISH' }
  | { type: 'RATING_CHANGE'; payload: number }
  | { type: 'RATING_SAVE_START' }
  | { type: 'RATING_SAVE_FINISH' }
  | { type: 'TOGGLE_LOCK_SUCCESS'; payload: boolean }
  | { type: 'DND_UPDATE'; payload: { submissions: SubmissionData[]; queue: PlaylistItemData[]; played: PlaylistItemData[]; } }
  | { type: 'TOGGLE_LEFT_HUD' }
  | { type: 'TOGGLE_RIGHT_HUD' };

// 4. Create the reducer function
export const adminReducer = (state: AdminState, action: AdminAction): AdminState => {
  switch (action.type) {
    case 'FETCH_SUCCESS':
      return { ...state, ...action.payload };
    case 'PLAY_NEXT_START':
      return { ...state, isPlayingNext: true };
    case 'PLAY_NEXT_FINISH':
      return { ...state, isPlayingNext: false };
    case 'RATING_CHANGE':
      return { ...state, currentRating: action.payload };
    case 'RATING_SAVE_START':
      return { ...state, isSavingRating: true };
    case 'RATING_SAVE_FINISH':
      return { ...state, isSavingRating: false };
    case 'TOGGLE_LOCK_SUCCESS':
      return { ...state, isQueueLocked: action.payload };
    case 'DND_UPDATE':
      return { ...state, ...action.payload };
    case 'TOGGLE_LEFT_HUD':
      return { ...state, leftHudOpen: !state.leftHudOpen };
    case 'TOGGLE_RIGHT_HUD':
      return { ...state, rightHudOpen: !state.rightHudOpen };
    default:
      return state;
  }
};