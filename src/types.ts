export interface Channel {
    id: string; // unique ID, preferably from tvg-id or hash of url
    name: string;
    logo?: string;
    group?: string;
    url: string;
    tvgId?: string;
    language?: string;
    country?: string;
}

export interface Profile {
    id: string;
    name: string;
    avatar: string; // emoji or url
    favorites: string[]; // list of channel IDs
    theme: 'dark' | 'light';
}

export interface AppSettings {
    playlistUrl: string;
    lastUpdated?: number;
}
