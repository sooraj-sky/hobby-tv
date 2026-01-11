import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Trash2, User } from 'lucide-react';

export const ProfileSelector: React.FC = () => {
    const { profiles, setCurrentProfile, createProfile, deleteProfile } = useStore();
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');

    const handleCreate = () => {
        if (newName.trim()) {
            createProfile(newName, 'default');
            setNewName('');
            setIsCreating(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: '2rem'
        }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 500 }}>Who's Watching?</h1>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {profiles.map(profile => (
                    <div key={profile.id} className="animate-fade-in" style={{ textAlign: 'center', position: 'relative' }}>
                        <div
                            onClick={() => setCurrentProfile(profile)}
                            style={{
                                width: '150px',
                                height: '150px',
                                borderRadius: '8px',
                                background: '#333',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                border: '2px solid transparent',
                                transition: 'all 0.2s',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'white'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                        >
                            <User size={64} color="#ccc" />
                        </div>
                        <p style={{ marginTop: '1rem', color: '#888', fontSize: '1.2rem' }}>{profile.name}</p>
                        <button
                            onClick={(e) => { e.stopPropagation(); deleteProfile(profile.id); }}
                            className="btn-ghost"
                            style={{ position: 'absolute', top: 5, right: 5, color: '#ff4444' }}
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}

                <div style={{ textAlign: 'center' }}>
                    <div
                        onClick={() => setIsCreating(true)}
                        style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%', // Circle for "Add"
                            border: '2px solid #444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'white'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#444'}
                    >
                        <Plus size={64} color="#666" />
                    </div>
                    <p style={{ marginTop: '1rem', color: '#888', fontSize: '1.2rem' }}>Add Profile</p>
                </div>
            </div>

            {isCreating && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ background: '#222', padding: '2rem', borderRadius: '8px', width: '400px' }}>
                        <h2>Create Profile</h2>
                        <input
                            autoFocus
                            placeholder="Name"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1.2rem' }}
                            onKeyDown={e => e.key === 'Enter' && handleCreate()}
                        />
                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn-ghost" onClick={() => setIsCreating(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleCreate}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
