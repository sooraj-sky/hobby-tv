import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, RefreshCw, Save } from 'lucide-react';

interface Props {
    onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ onClose }) => {
    const { settings, fetchChannels, updateSettings, isLoading, error } = useStore();
    const [url, setUrl] = useState(settings.playlistUrl);

    const handleSave = async () => {
        await updateSettings({ playlistUrl: url });
        await fetchChannels(url);
        if (!error) onClose();
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{ background: '#222', padding: '2rem', borderRadius: '8px', width: '500px', maxWidth: '90%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h2>Settings</h2>
                    <button className="btn-ghost" onClick={onClose}><X /></button>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Playlist Source URL (M3U)</label>
                    <input
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        style={{ width: '100%', padding: '12px' }}
                    />
                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                        Supported formats: .m3u, .m3u8 containing channel list.
                    </p>
                </div>

                {error && <p style={{ color: '#e50914', marginBottom: '1rem' }}>{error}</p>}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button
                        className="btn-primary"
                        onClick={handleSave}
                        disabled={isLoading}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                        Save & update
                    </button>
                </div>

                <div style={{ marginTop: '2rem', borderTop: '1px solid #333', paddingTop: '1rem' }}>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                        Last Updated: {settings.lastUpdated ? new Date(settings.lastUpdated).toLocaleString() : 'Never'}
                    </p>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                        App Version: 1.0.0
                    </p>
                </div>
            </div>
            <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};
