import React from 'react';
import type { Channel } from '../types';
import { Heart, Play } from 'lucide-react';
import { useStore } from '../store/useStore';

interface Props {
    channel: Channel;
    onClick: () => void;
}

export const ChannelCard: React.FC<Props> = ({ channel, onClick }) => {
    const { toggleFavorite, currentProfile } = useStore();
    const isFavorite = currentProfile?.favorites.includes(channel.id);

    const [imgError, setImgError] = React.useState(false);

    return (
        <div
            className="channel-card"
            onClick={onClick}
            style={{
                position: 'relative',
                background: '#1f1f1f',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                // Remove aspectRatio from here to avoid clipping footer
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.zIndex = '10';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.5)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.zIndex = '1';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a0a0a',
                width: '100%',
                aspectRatio: '16/9', // Enforce 16:9 for the image area specifically
                position: 'relative'
            }}>
                {channel.logo && !imgError ? (
                    <img
                        src={channel.logo}
                        alt={channel.name}
                        style={{ width: '80%', height: '80%', objectFit: 'contain' }}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#555' }}>
                        {channel.name.slice(0, 2).toUpperCase()}
                    </span>
                )}
            </div>

            <div style={{
                padding: '12px 14px',
                background: '#1a1a1a',
                borderTop: '1px solid #333',
                flexGrow: 1
            }}>
                <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: '#e0e0e0',
                    margin: 0
                }}>
                    {channel.name || 'Unknown Channel'}
                </h3>
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(channel.id); }}
                className="btn-ghost"
                style={{ position: 'absolute', top: 5, right: 5, padding: 4, zIndex: 10 }}
            >
                <Heart size={16} fill={isFavorite ? '#e50914' : 'none'} color={isFavorite ? '#e50914' : 'white'} />
            </button>

            {/* Play Overlay */}
            <div className="play-overlay" style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.2s'
            }}>
                <Play fill="white" size={32} />
            </div>
            <style>{`
        .channel-card:hover .play-overlay { opacity: 1; }
      `}</style>
        </div>
    );
};
