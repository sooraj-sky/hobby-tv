import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { X, AlertCircle, Minimize2, Maximize2 } from 'lucide-react';

interface Props {
    url: string;
    onClose: () => void;
    onMinimize: () => void;
    onMaximize: () => void;
    mode: 'full' | 'mini';
}

export const Player: React.FC<Props> = ({ url, onClose, onMinimize, onMaximize, mode }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let hls: Hls | null = null;
        setError(null);

        const handlePlayerError = (_event: string, data: any) => {
            if (data.fatal) {
                setError("Stream failed to load.");
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        hls?.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        hls?.recoverMediaError();
                        break;
                    default:
                        hls?.destroy();
                        break;
                }
            }
        };

        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, handlePlayerError);
            video.play().catch(e => console.error("Auto-play failed", e));
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.play();
        } else {
            setError("Your browser does not support HLS playback.");
        }

        return () => {
            if (hls) hls.destroy();
        };
    }, [url]);

    const isMini = mode === 'mini';

    return (
        <div style={{
            position: 'fixed',
            inset: isMini ? 'auto' : 0,
            bottom: isMini ? '20px' : 0,
            right: isMini ? '20px' : 0,
            width: isMini ? '400px' : '100%',
            height: isMini ? '225px' : '100%',
            background: 'black',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isMini ? '0 10px 30px rgba(0,0,0,0.5)' : 'none',
            borderRadius: isMini ? '12px' : '0',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
            {error && (
                <div style={{ position: 'absolute', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
                    <AlertCircle size={isMini ? 24 : 48} color="#e50914" />
                    {!isMini && <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>{error}</p>}
                </div>
            )}

            <video
                ref={videoRef}
                controls={!isMini}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onClick={isMini ? onMaximize : undefined}
            />

            {/* Controls Overlay */}
            <div className="player-controls" style={{
                position: 'absolute',
                top: isMini ? 5 : 20,
                right: isMini ? 5 : 20,
                zIndex: 1001,
                display: 'flex',
                gap: '8px'
            }}>
                {isMini ? (
                    <button className="btn-ghost" onClick={onMaximize} style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '8px' }}>
                        <Maximize2 size={16} color="white" />
                    </button>
                ) : (
                    <button className="btn-ghost" onClick={onMinimize} style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '12px' }}>
                        <Minimize2 size={24} color="white" />
                    </button>
                )}

                <button className="btn-ghost" onClick={onClose} style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: isMini ? '8px' : '12px' }}>
                    <X size={isMini ? 16 : 24} color="white" />
                </button>
            </div>
        </div>
    );
};
