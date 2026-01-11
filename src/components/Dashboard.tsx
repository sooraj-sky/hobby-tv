import React, { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { ChannelCard } from './ChannelCard';
import { Search, Settings, Filter, LogOut, RefreshCw, X, Menu } from 'lucide-react';
import { useDebounce } from '../useDebounce';
import logo from '../assets/logo.png';

interface Props {
    onPlay: (channelId: string) => void;
    onOpenSettings: () => void;
}

export const Dashboard: React.FC<Props> = ({ onPlay, onOpenSettings }) => {
    const { channels, currentProfile, setCurrentProfile, fetchChannels, settings, isLoading, error } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [selectedMainCat, setSelectedMainCat] = useState<string>('Favorites');
    const [selectedSubCat, setSelectedSubCat] = useState<string | null>(null);

    // 1. Extract Languages
    const languages = useMemo(() => {
        const langs = new Set<string>();
        channels.forEach(c => {
            if (c.language) {
                langs.add(c.language);
            }
        });
        return Array.from(langs).sort();
    }, [channels]);

    // 2. Extract Main Categories (Roots) - Filter out if Language selected
    const mainCategories = useMemo(() => {
        const roots = new Set<string>();
        channels.forEach(c => {
            if (c.group) {
                const root = c.group.split(';')[0];
                roots.add(root);
            }
        });
        return Array.from(roots).sort();
    }, [channels]);

    // 3. Extract Sub Categories for current selection
    const subCategories = useMemo(() => {
        if (selectedMainCat === 'Favorites' || languages.includes(selectedMainCat)) return [];

        const subs = new Set<string>();
        channels.forEach(c => {
            if (c.group && c.group.startsWith(selectedMainCat)) {
                const parts = c.group.split(';');
                if (parts.length > 1) {
                    subs.add(parts[1]);
                }
            }
        });
        return Array.from(subs).sort();
    }, [channels, selectedMainCat, languages]);

    // Reset sub-cat when main changes
    React.useEffect(() => {
        setSelectedSubCat(null);
    }, [selectedMainCat]);

    const filteredChannels = useMemo(() => {
        // Global Search - Only active if the user has actually typed something (searchTerm isn't empty)
        // This prevents the debounce delay from showing stale results when clearing search/switching cats.
        if (searchTerm.trim() && debouncedSearch.trim()) {
            const q = debouncedSearch.toLowerCase();
            return channels.filter(c =>
                c.name.toLowerCase().includes(q) ||
                (c.group && c.group.toLowerCase().includes(q))
            );
        }

        let result = channels;

        if (selectedMainCat === 'Favorites') {
            result = result.filter(c => currentProfile?.favorites.includes(c.id));
        } else if (languages.includes(selectedMainCat)) {
            // Filter by Language
            result = result.filter(c => c.language === selectedMainCat);
        } else {
            // Filter by Main Category
            result = result.filter(c => c.group && c.group.startsWith(selectedMainCat));

            // Filter by Sub Category
            if (selectedSubCat) {
                // Check if the 2nd part matches
                result = result.filter(c => {
                    const parts = c.group?.split(';') || [];
                    return parts[1] === selectedSubCat;
                });
            }
        }

        return result;
    }, [channels, selectedMainCat, selectedSubCat, debouncedSearch, currentProfile, languages]);

    // Debug logging
    console.log('Render:', {
        searchTerm,
        debouncedSearch,
        selectedMainCat,
        filteredLength: filteredChannels.length,
        firstFewIds: filteredChannels.slice(0, 3).map(c => c.id)
    });

    const handleRefresh = async () => {
        if (!isLoading) {
            await fetchChannels(settings.playlistUrl);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', position: 'relative' }}>
            {/* Mobile Header Toggle */}
            <div className="mobile-header" style={{
                display: 'none', // Hidden by default, shown via CSS on mobile
                position: 'absolute', top: 0, left: 0, right: 0, minHeight: '60px',
                height: 'auto',
                paddingTop: 'env(safe-area-inset-top)', // Safe area for notch
                background: 'var(--bg-color)', borderBottom: '1px solid #333',
                alignItems: 'center', paddingLeft: '1rem', paddingRight: '1rem', paddingBottom: '0.5rem',
                zIndex: 50,
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="btn-ghost" style={{ color: 'white' }}>
                        <Menu size={24} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Mobile Header Logo */}
                        <img src={logo} alt="Logo" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>Hobby TV</span>
                    </div>
                </div>

                {/* Mobile Search Toggle */}
                {showSearch ? (
                    <div style={{ display: 'flex', alignItems: 'center', background: '#333', borderRadius: '4px', padding: '4px 8px', marginLeft: 'auto' }}>
                        <input
                            autoFocus
                            style={{ background: 'transparent', border: 'none', width: '120px', color: 'white', fontSize: '0.9rem' }}
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onBlur={() => !searchTerm && setShowSearch(false)}
                        />
                        <button onClick={() => { setSearchTerm(''); setShowSearch(false); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                            <X size={16} color="#888" />
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setShowSearch(true)} className="btn-ghost" style={{ color: 'white' }}>
                        <Search size={22} />
                    </button>
                )}
            </div>

            {/* Sidebar Overlay (Mobile) */}
            {showMobileMenu && (
                <div
                    onClick={() => setShowMobileMenu(false)}
                    style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90
                    }}
                    className="mobile-overlay"
                />
            )}

            {/* Sidebar */}
            <div className={`sidebar ${showMobileMenu ? 'open' : ''}`} style={{
                width: '260px',
                background: 'var(--bg-color)',
                borderRight: '1px solid #333',
                display: 'flex',
                flexDirection: 'column',
                padding: '1rem 0',
                paddingTop: 'calc(1rem + 30px)', // Account for MacOS traffic lights
                flexShrink: 0
            }}>
                <div style={{ padding: '0 1rem 1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={logo} alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                    <h2 style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Hobby TV</h2>
                    {/* Close button for mobile */}
                    <button className="mobile-close btn-ghost" onClick={() => setShowMobileMenu(false)} style={{ marginLeft: 'auto', display: 'none' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '0.5rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#333', borderRadius: '4px', padding: '0.5rem' }}>
                        <Search size={16} color="#888" />
                        <input
                            style={{ background: 'transparent', border: 'none', padding: '0 0 0 8px', width: '100%', color: 'white' }}
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button className="btn-ghost" onClick={() => setSearchTerm('')} style={{ padding: 4 }}>
                                <X size={14} color="#888" />
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                    <SidebarItem
                        label="Favorites"
                        active={selectedMainCat === 'Favorites'}
                        onClick={() => { setSelectedMainCat('Favorites'); setSearchTerm(''); setShowMobileMenu(false); }}
                        icon={<Filter size={16} />}
                    />

                    <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', marginTop: '1rem' }}>
                        Categories
                    </div>
                    {mainCategories.map(cat => (
                        <SidebarItem
                            key={cat}
                            label={cat}
                            active={selectedMainCat === cat}
                            onClick={() => { setSelectedMainCat(cat); setSearchTerm(''); setShowMobileMenu(false); }}
                        />
                    ))}

                    {languages.length > 0 && (
                        <>
                            <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', marginTop: '1rem' }}>
                                Languages
                            </div>
                            {languages.map(lang => (
                                <SidebarItem
                                    key={lang}
                                    label={lang}
                                    active={selectedMainCat === lang}
                                    onClick={() => { setSelectedMainCat(lang); setSearchTerm(''); setShowMobileMenu(false); }}
                                />
                            ))}
                        </>
                    )}
                </div>

                <div style={{ padding: '1rem', borderTop: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 4, background: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {currentProfile?.name[0]}
                        </div>
                        <span style={{ fontSize: '0.9rem' }}>{currentProfile?.name}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className={`btn-ghost ${isLoading ? 'spin' : ''}`} onClick={handleRefresh} title="Refresh Playlist">
                            <RefreshCw size={18} />
                        </button>
                        <button className="btn-ghost" onClick={onOpenSettings} title="Settings">
                            <Settings size={18} />
                        </button>
                        <button className="btn-ghost" onClick={() => setCurrentProfile(null)} title="Switch Profile">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
                <style>{`
                  .spin { animation: spin 1s linear infinite; }
                  .no-scrollbar::-webkit-scrollbar { display: none; }
                  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

                  /* Mobile Responsive Styles */
                  @media (max-width: 768px) {
                      .sidebar {
                          position: absolute;
                          top: 0; bottom: 0; left: 0;
                          z-index: 100;
                          transform: translateX(-100%);
                          transition: transform 0.3s ease;
                      }
                      .sidebar.open {
                          transform: translateX(0);
                      }
                      .mobile-header {
                          display: flex !important;
                      }
                      .mobile-overlay {
                          display: block;
                      }
                      .mobile-close {
                          display: block !important;
                      }
                      .main-content {
                          padding-top: calc(60px + env(safe-area-inset-top)); /* Space for mobile header + notch */
                      }
                  }
                `}</style>
            </div>

            {/* Main Content */}
            <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-color)', minWidth: 0 }}>
                {/* Error Banner */}
                {error && (
                    <div style={{ background: '#ff4444', color: 'white', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{error}</span>
                        <button onClick={() => fetchChannels(settings.playlistUrl)} style={{ background: 'white', color: '#ff4444', border: 'none', padding: '4px 12px', borderRadius: '4px', fontWeight: 'bold' }}>
                            Retry
                        </button>
                    </div>
                )}

                {/* Sub-Category/Header Bar */}
                <div style={{ padding: '1rem 2rem 0.5rem', borderBottom: subCategories.length > 0 ? '1px solid #333' : 'none' }}>
                    <h1 style={{ fontWeight: 300, marginBottom: '0.5rem' }}>
                        {selectedMainCat}
                        <span style={{ fontSize: '1rem', color: '#666', marginLeft: '1rem' }}>({filteredChannels.length})</span>
                    </h1>

                    {subCategories.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            <Chip
                                label="All"
                                active={selectedSubCat === null}
                                onClick={() => setSelectedSubCat(null)}
                            />
                            {subCategories.map(sub => (
                                <Chip
                                    key={sub}
                                    label={sub}
                                    active={selectedSubCat === sub}
                                    onClick={() => setSelectedSubCat(sub)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 2rem' }}>
                    {filteredChannels.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', color: '#666', gap: '1rem' }}>
                            <span>{isLoading ? 'Loading channels...' : 'No channels found.'}</span>
                            {!isLoading && !error && (
                                <button className="btn-ghost" onClick={() => fetchChannels(settings.playlistUrl)} style={{ color: 'var(--primary)', border: '1px solid var(--primary)', padding: '8px 16px', borderRadius: '4px' }}>
                                    Reload Playlist
                                </button>
                            )}
                        </div>
                    ) : (
                        <div
                            key={`${selectedMainCat}-${searchTerm}`} // Force re-render on category/search change
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                                gap: '1.5rem'
                            }}
                        >
                            {filteredChannels.slice(0, 500).map(c => (
                                <ChannelCard key={c.id} channel={c} onClick={() => onPlay(c.id)} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Chip = ({ label, active, onClick }: any) => (
    <div
        onClick={onClick}
        style={{
            padding: '6px 16px',
            borderRadius: '20px',
            background: active ? '#fff' : '#333',
            color: active ? '#000' : '#fff',
            fontSize: '0.9rem',
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s'
        }}
    >
        {label}
    </div>
);

const SidebarItem = ({ label, active, onClick, icon }: any) => {
    // Format label: Animation;Kids -> Animation › Kids
    const formattedLabel = label.replace(/;/g, ' › ');

    return (
        <div
            onClick={onClick}
            style={{
                padding: '10px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                background: active ? 'var(--primary)' : 'transparent',
                color: active ? 'white' : '#aaa',
                marginBottom: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.95rem'
            }}
            className="sidebar-item"
            title={formattedLabel}
        >
            {icon}
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formattedLabel}</span>
        </div>
    )
};
