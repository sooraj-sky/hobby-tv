import { openDB, type DBSchema } from 'idb';
import type { Channel, Profile, AppSettings } from '../types';

interface TVAppDB extends DBSchema {
    channels: {
        key: string;
        value: Channel[];
    };
    settings: {
        key: string;
        value: AppSettings;
    };
    profiles: {
        key: string;
        value: Profile;
    };
}

const DB_NAME = 'tv-app-db';
const DB_VERSION = 1;

export async function initDB() {
    return openDB<TVAppDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('channels')) {
                db.createObjectStore('channels');
            }
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings');
            }
            if (!db.objectStoreNames.contains('profiles')) {
                db.createObjectStore('profiles', { keyPath: 'id' });
            }
        },
    });
}

export const dbService = {
    async saveChannels(channels: Channel[]) {
        const db = await initDB();
        await db.put('channels', channels, 'all');
    },

    async getChannels(): Promise<Channel[]> {
        const db = await initDB();
        return (await db.get('channels', 'all')) || [];
    },

    async saveSettings(settings: AppSettings) {
        const db = await initDB();
        await db.put('settings', settings, 'config');
    },

    async getSettings(): Promise<AppSettings | undefined> {
        const db = await initDB();
        return await db.get('settings', 'config');
    },

    async saveProfile(profile: Profile) {
        const db = await initDB();
        await db.put('profiles', profile);
    },

    async getProfiles(): Promise<Profile[]> {
        const db = await initDB();
        return await db.getAll('profiles');
    },

    async deleteProfile(id: string) {
        const db = await initDB();
        await db.delete('profiles', id);
    }
};
