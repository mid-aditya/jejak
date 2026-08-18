import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { apiClient } from '../../services/api-client';
import { encryptionService } from '../../services/encryption.service';
import type { RootState } from '../index';

// ── Types ─────────────────────────────────────────────────────────────────────
export type OfflineActionType =
  | 'CREATE_POST'
  | 'UPDATE_PROFILE'
  | 'TRIGGER_SOS'
  | 'CHECK_IN'
  | 'CHECK_OUT'
  | 'UPDATE_TRIP'
  | 'CREATE_LISTING'
  | 'SEND_MESSAGE';

export interface PendingAction {
  id: string;
  type: OfflineActionType;
  payload: Record<string, any>;
  timestamp: number;
  retryCount: number;
  lastRetryAt?: number;
  error?: string;
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'failed';

export interface OfflineState {
  queue: PendingAction[];
  isOnline: boolean;
  isSyncing: boolean;
  syncStatus: SyncStatus;
  lastSyncAt: string | null;
  syncProgress: number; // 0-100
  syncError: string | null;
}

// ── State ─────────────────────────────────────────────────────────────────────
const initialState: OfflineState = {
  queue: [],
  isOnline: true,
  isSyncing: false,
  syncStatus: 'idle',
  lastSyncAt: null,
  syncProgress: 0,
  syncError: null,
};

// ── Async Thunks ──────────────────────────────────────────────────────────────
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000; // 1 second

// Start network monitoring as a side effect. The listener lives for the whole
// app session and is never unsubscribed — return void (not the unsubscribe fn)
// so the thunk payload stays serializable for redux-toolkit's check.
export const startNetworkMonitoring = createAsyncThunk<
  void,
  void,
  { dispatch: any }
>('offline/startNetworkMonitoring', async (_, { dispatch }) => {
  const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
    dispatch(setOnlineStatus(isOnline));

    if (isOnline) {
      dispatch(processOfflineQueue());
    }
  });

  // Get initial state
  const state = await NetInfo.fetch();
  const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
  dispatch(setOnlineStatus(isOnline));

  // Keep the subscription alive for the app lifetime; the returned cleanup is
  // intentionally dropped to avoid storing a function in the Redux state.
  void unsubscribe;
});

export const processOfflineQueue = createAsyncThunk<
  void,
  void,
  { state: RootState; rejectValue: void }
>('offline/processQueue', async (_, { getState, dispatch, rejectWithValue }) => {
  const { queue } = getState().offline;

  if (queue.length === 0) {
    return;
  }

  dispatch(setSyncStatus('syncing'));
  dispatch(setSyncProgress(0));

  const totalItems = queue.length;
  let processedCount = 0;
  let failedItems: PendingAction[] = [];

  for (const action of queue) {
    try {
      await sendQueuedAction(action);
      dispatch(dequeueAction(action.id));
      processedCount++;
      dispatch(setSyncProgress(Math.round((processedCount / totalItems) * 100)));
    } catch (error: any) {
      const updatedRetryCount = action.retryCount + 1;

      if (updatedRetryCount >= MAX_RETRIES) {
        // Max retries reached - mark as failed but keep in queue for manual review
        dispatch(
          updateQueueItem({
            ...action,
            retryCount: updatedRetryCount,
            lastRetryAt: Date.now(),
            error: error?.message || 'Max retries exceeded',
          }),
        );
      } else {
        // Schedule retry with exponential backoff
        const delay = BASE_RETRY_DELAY * Math.pow(2, updatedRetryCount);
        dispatch(
          updateQueueItem({
            ...action,
            retryCount: updatedRetryCount,
            lastRetryAt: Date.now(),
          }),
        );

        // Don't wait - let it retry on next sync
        setTimeout(() => {
          dispatch(processOfflineQueue());
        }, delay);
      }
    }
  }

  if (failedItems.length === 0) {
    dispatch(setSyncStatus('success'));
    dispatch(setLastSyncAt(new Date().toISOString()));
  } else {
    dispatch(setSyncStatus('failed'));
    dispatch(setSyncError(`${failedItems.length} item(s) failed to sync`));
  }

  dispatch(setSyncProgress(100));
});

// ── Helpers ──────────────────────────────────────────────────────────────────
async function sendQueuedAction(action: PendingAction): Promise<void> {
  // The queued payload captures the original request (endpoint + body) at the
  // moment it failed, so replay it as-is instead of guessing a route.
  const { endpoint, data } = (action.payload ?? {}) as {
    endpoint?: string;
    data?: any;
  };
  const url = endpoint || '/unknown';

  // axios may have stringified the body by the time the error fired — restore
  // the object shape so the backend receives the same payload as before.
  let body = data ?? action.payload;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      // Keep as-is if it isn't valid JSON
    }
  }

  // The body was already encrypted by the request interceptor before it was
  // queued — tell the interceptor not to encrypt it again, but DO send the
  // encryption key so the backend can still decrypt the stored fields.
  const encryptionKey = await encryptionService.getOrCreateKey();
  const config = {
    headers: { 'X-Skip-Encryption': 'true', 'X-Encryption-Key': encryptionKey },
  };

  switch (action.type) {
    case 'UPDATE_PROFILE':
    case 'UPDATE_TRIP':
      await apiClient.patch(url, body, config);
      break;
    default:
      await apiClient.post(url, body, config);
  }
}

// ── Slice ─────────────────────────────────────────────────────────────────────
const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    enqueueAction(state, action: PayloadAction<Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>>) {
      const newAction: PendingAction = {
        ...action.payload,
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retryCount: 0,
      };
      state.queue.push(newAction);
    },
    dequeueAction(state, action: PayloadAction<string>) {
      state.queue = state.queue.filter((item) => item.id !== action.payload);
    },
    updateQueueItem(state, action: PayloadAction<PendingAction>) {
      const index = state.queue.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.queue[index] = action.payload;
      }
    },
    clearQueue(state) {
      state.queue = [];
    },
    removeFailedActions(state) {
      state.queue = state.queue.filter(
        (item) => item.retryCount < MAX_RETRIES,
      );
    },
    setOnlineStatus(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
    },
    setSyncStatus(state, action: PayloadAction<SyncStatus>) {
      state.syncStatus = action.payload;
      if (action.payload === 'syncing') {
        state.isSyncing = true;
      } else {
        state.isSyncing = false;
      }
    },
    setSyncProgress(state, action: PayloadAction<number>) {
      state.syncProgress = action.payload;
    },
    setLastSyncAt(state, action: PayloadAction<string>) {
      state.lastSyncAt = action.payload;
    },
    setSyncError(state, action: PayloadAction<string | null>) {
      state.syncError = action.payload;
    },
    resetSyncState(state) {
      state.syncStatus = 'idle';
      state.syncProgress = 0;
      state.syncError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processOfflineQueue.pending, (state) => {
        state.syncStatus = 'syncing';
        state.isSyncing = true;
      })
      .addCase(processOfflineQueue.fulfilled, (state) => {
        state.syncStatus = 'success';
        state.isSyncing = false;
        state.syncProgress = 100;
        state.lastSyncAt = new Date().toISOString();
        state.syncError = null;
      })
      .addCase(processOfflineQueue.rejected, (state, action) => {
        state.syncStatus = 'failed';
        state.isSyncing = false;
        state.syncError = action.error?.message || 'Sync failed';
      });
  },
});

export const {
  enqueueAction,
  dequeueAction,
  updateQueueItem,
  clearQueue,
  removeFailedActions,
  setOnlineStatus,
  setSyncStatus,
  setSyncProgress,
  setLastSyncAt,
  setSyncError,
  resetSyncState,
} = offlineSlice.actions;

export default offlineSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectQueueCount = (state: RootState) => state.offline.queue.length;
export const selectIsOnline = (state: RootState) => state.offline.isOnline;
export const selectIsSyncing = (state: RootState) => state.offline.isSyncing;
export const selectLastSyncAt = (state: RootState) => state.offline.lastSyncAt;
export const selectPendingActions = (state: RootState) => state.offline.queue;
