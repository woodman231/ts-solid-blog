import { io, Socket } from 'socket.io-client';
import { BaseRequest, BaseResponse } from '@blog/shared/src/index';
import { getAccessToken, hasTokenTimingIssues, clearTokenCache } from '../auth/msal';
import { create } from 'zustand';

interface SocketStore {
    socket: Socket | null;
    connected: boolean;
    connecting: boolean;
    initialize: () => Promise<void>;
    disconnect: () => void;
    sendRequest: <Req extends BaseRequest, Res extends BaseResponse>(
        request: Req
    ) => Promise<Res>;
}

export const useSocketStore = create<SocketStore>((set, get) => ({
    socket: null,
    connected: false,
    connecting: false,

    initialize: async () => {
        const initId = Math.random().toString(36).substr(2, 9);
        console.log(`Socket: initialize() called [${initId}]`);
        // Check if socket already exists and is connected
        const { socket } = get();
        if (socket && socket.connected) {
            console.log(`Socket: Already connected, skipping initialization [${initId}]`);
            return;
        }

        // Get authentication token with retry logic
        let token: string | null = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (!token && attempts < maxAttempts) {
            attempts++;
            console.log(`Socket: Attempting to get access token (attempt ${attempts}/${maxAttempts}) [${initId}]`);

            try {
                token = await getAccessToken();
                if (token) {
                    // Check for timing issues
                    if (hasTokenTimingIssues(token)) {
                        console.warn(`Socket: Token has timing issues, clearing cache and retrying [${initId}]`);
                        await clearTokenCache();
                        token = null; // Force retry
                    } else {
                        console.log(`Socket: Token acquired successfully on attempt ${attempts} [${initId}]`);
                    }
                } else {
                    console.warn(`Socket: No token received on attempt ${attempts} [${initId}]`);
                    if (attempts < maxAttempts) {
                        // Wait a bit before retrying to allow for potential timing issues
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            } catch (error) {
                console.error(`Socket: Error getting token on attempt ${attempts} [${initId}]:`, error);
                if (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        if (!token) {
            console.error(`Socket: Cannot initialize socket: No authentication token available after ${maxAttempts} attempts [${initId}]`);
            return;
        }

        set({ connecting: true });

        try {
            // Close existing socket if any
            if (socket) {
                console.log(`Socket: Closing existing socket [${initId}]`);
                socket.disconnect();
            }

            // Create new socket connection with auth token
            const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;

            console.log(`Socket: Creating new connection to ${socketUrl} [${initId}]`);
            const newSocket = io(socketUrl, {
                auth: { token },
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            // Set up event listeners
            newSocket.on('connect', () => {
                console.log('Socket connected');
                set({ connected: true, connecting: false });
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
                set({ connected: false });
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                set({ connected: false, connecting: false });

                // If the error might be due to token timing issues, retry after a delay
                if (error.message && error.message.includes('jwt not active')) {
                    console.log('Token timing issue detected, retrying connection in 5 seconds...');
                    setTimeout(() => {
                        get().initialize();
                    }, 5000);
                }
            });

            // Store the socket instance
            set({ socket: newSocket });
        } catch (error) {
            console.error('Error initializing socket:', error);
            set({ connecting: false });
        }
    },

    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, connected: false });
        }
    },

    sendRequest: <Req extends BaseRequest, Res extends BaseResponse>(request: Req) => {
        return new Promise<Res>((resolve, reject) => {
            const { socket, connected } = get();

            if (!socket || !connected) {
                reject(new Error('Socket not connected'));
                return;
            }

            // Send the request with acknowledgment
            socket.emit('request', request, (response: Res) => {
                if (response.responseType === 'error') {
                    reject(new Error(response.responseParams.error?.message || 'Unknown error'));
                } else {
                    resolve(response);
                }
            });
        });
    },
}));