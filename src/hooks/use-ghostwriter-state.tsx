'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Draft {
  id: string;
  topic: string;
  format: string;
  content: string;
  createdAt: string;
}

interface GhostwriterState {
  voiceProfile: string | null;
  setVoiceProfile: (profile: string | null) => void;
  drafts: Draft[];
  addDraft: (draft: Omit<Draft, 'id' | 'createdAt'>) => void;
  deleteDraft: (id: string) => void;
  isInitialized: boolean;
}

const GhostwriterContext = createContext<GhostwriterState | undefined>(undefined);

export const GhostwriterStateProvider = ({ children }: { children: ReactNode }) => {
  const [voiceProfile, setVoiceProfileState] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedVoiceProfile = localStorage.getItem('ghostwriter_voiceProfile');
      if (storedVoiceProfile) {
        setVoiceProfileState(JSON.parse(storedVoiceProfile));
      }
      const storedDrafts = localStorage.getItem('ghostwriter_drafts');
      if (storedDrafts) {
        setDrafts(JSON.parse(storedDrafts));
      }
    } catch (error) {
      console.error('Failed to parse from localStorage', error);
    }
    setIsInitialized(true);
  }, []);

  const setVoiceProfile = (profile: string | null) => {
    setVoiceProfileState(profile);
    try {
      if (profile) {
        localStorage.setItem('ghostwriter_voiceProfile', JSON.stringify(profile));
      } else {
        localStorage.removeItem('ghostwriter_voiceProfile');
      }
    } catch (error) {
      console.error('Failed to save to localStorage', error);
    }
  };

  const addDraft = (draft: Omit<Draft, 'id' | 'createdAt'>) => {
    const newDraft: Draft = {
      ...draft,
      id: new Date().toISOString() + Math.random(),
      createdAt: new Date().toISOString(),
    };
    setDrafts(prevDrafts => {
      const updatedDrafts = [newDraft, ...prevDrafts];
      try {
        localStorage.setItem('ghostwriter_drafts', JSON.stringify(updatedDrafts));
      } catch (error) {
        console.error('Failed to save to localStorage', error);
      }
      return updatedDrafts;
    });
  };

  const deleteDraft = (id: string) => {
    setDrafts(prevDrafts => {
      const updatedDrafts = prevDrafts.filter(draft => draft.id !== id);
      try {
        localStorage.setItem('ghostwriter_drafts', JSON.stringify(updatedDrafts));
      } catch (error) {
        console.error('Failed to save to localStorage', error);
      }
      return updatedDrafts;
    });
  };

  const value = {
    voiceProfile,
    setVoiceProfile,
    drafts,
    addDraft,
    deleteDraft,
    isInitialized,
  };

  return (
    <GhostwriterContext.Provider value={value}>
      {children}
    </GhostwriterContext.Provider>
  );
};

export const useGhostwriterState = () => {
  const context = useContext(GhostwriterContext);
  if (context === undefined) {
    throw new Error('useGhostwriterState must be used within a GhostwriterStateProvider');
  }
  return context;
};
