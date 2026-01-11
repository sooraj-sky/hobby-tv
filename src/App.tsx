import { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { ProfileSelector } from './components/ProfileSelector';
import { Dashboard } from './components/Dashboard';
import { Player } from './components/Player';
import { SettingsModal } from './components/SettingsModal';

function App() {
  const { initializeApp, currentProfile, isLoading, channels } = useStore();
  const [playingChannel, setPlayingChannel] = useState<string | null>(null);
  const [playerMode, setPlayerMode] = useState<'full' | 'mini'>('full');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  const handlePlay = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    if (channel) {
      setPlayingChannel(channel.url);
      setPlayerMode('full');
    }
  };

  if (isLoading && channels.length === 0) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader" style={{ fontSize: '1.5rem' }}>Loading Content...</div>
        <style>{`
            .loader:after { content: ' .'; animation: dots 1s steps(5, end) infinite; }
            @keyframes dots { 0%, 20% { content: ' .'; } 40% { content: ' ..'; } 60% { content: ' ...'; } 100% { content: ''; } }
         `}</style>
      </div>
    );
  }

  if (!currentProfile) {
    return <ProfileSelector />;
  }

  return (
    <>
      <Dashboard
        onPlay={handlePlay}
        onOpenSettings={() => setShowSettings(true)}
      />

      {playingChannel && (
        <Player
          url={playingChannel}
          mode={playerMode}
          onClose={() => setPlayingChannel(null)}
          onMinimize={() => setPlayerMode('mini')}
          onMaximize={() => setPlayerMode('full')}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}

export default App;
