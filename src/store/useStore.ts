import { create } from 'zustand';
import type { Channel, Profile, AppSettings } from '../types';
import { dbService } from '../services/db';
import { M3UParser } from '../services/m3u-parser';

interface StoreState {
    channels: Channel[];
    profiles: Profile[];
    settings: AppSettings;
    currentProfile: Profile | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    initializeApp: () => Promise<void>;
    fetchChannels: (url: string) => Promise<void>;
    setCurrentProfile: (profile: Profile | null) => void;
    createProfile: (name: string, avatar: string) => Promise<void>;
    deleteProfile: (id: string) => Promise<void>;
    updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
    toggleFavorite: (channelId: string) => void;
}

const DEFAULT_PLAYLIST_URL = 'https://iptv-org.github.io/iptv/index.m3u';

export const useStore = create<StoreState>((set, get) => ({
    channels: [],
    profiles: [],
    settings: {
        playlistUrl: DEFAULT_PLAYLIST_URL,
    },
    currentProfile: null,
    isLoading: false,
    error: null,

    initializeApp: async () => {
        set({ isLoading: true });
        try {
            const settings = (await dbService.getSettings()) || {
                playlistUrl: DEFAULT_PLAYLIST_URL,
            };

            const channels = await dbService.getChannels();
            const profiles = await dbService.getProfiles();

            set({ settings, channels, profiles, isLoading: false });

            if (channels.length === 0) {
                // Auto-fetch if empty
                get().fetchChannels(settings.playlistUrl);
            }
        } catch (err) {
            console.error('Failed to initialize app', err);
            set({ isLoading: false, error: 'Failed to load data.' });
        }
    },

    fetchChannels: async (url: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch playlist');
            const text = await response.text();
            const channels = M3UParser.parse(text);

            await dbService.saveChannels(channels);
            await dbService.saveSettings({ ...get().settings, lastUpdated: Date.now() });

            set({ channels, isLoading: false });
        } catch (err) {
            console.error(err);
            set({ isLoading: false, error: 'Failed to update channels. Check URL.' });
        }
    },

    setCurrentProfile: (profile) => set({ currentProfile: profile }),

    createProfile: async (name, avatar) => {
        const newProfile: Profile = {
            id: crypto.randomUUID(),
            name,
            avatar,
            favorites: [],
            theme: 'dark'
        };
        await dbService.saveProfile(newProfile);
        set((state) => ({ profiles: [...state.profiles, newProfile] }));
    },

    deleteProfile: async (id) => {
        await dbService.deleteProfile(id);
        set((state) => ({
            profiles: state.profiles.filter(p => p.id !== id),
            currentProfile: state.currentProfile?.id === id ? null : state.currentProfile
        }));
    },

    updateSettings: async (newSettings) => {
        const updated = { ...get().settings, ...newSettings };
        await dbService.saveSettings(updated);
        set({ settings: updated });
    },

    toggleFavorite: (channelId) => {
        const { currentProfile } = get();
        if (!currentProfile) return;

        const isFav = currentProfile.favorites.includes(channelId);
        const newFavorites = isFav
            ? currentProfile.favorites.filter(id => id !== channelId)
            : [...currentProfile.favorites, channelId];

        const updatedProfile = { ...currentProfile, favorites: newFavorites };

        // Optimistic update
        set((state) => ({
            currentProfile: updatedProfile,
            profiles: state.profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p)
        }));
        // Persist
        dbService.saveProfile(updatedProfile);
    }
}));
