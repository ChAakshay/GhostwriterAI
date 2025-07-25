'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Draft {
  id: string;
  topic: string;
  format: string;
  content: string;
  createdAt: string;
  scheduledDate?: string | null;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
}

interface GhostwriterState {
  voiceProfile: string | null;
  setVoiceProfile: (profile: string | null) => void;
  drafts: Draft[];
  addDraft: (draft: Omit<Draft, 'id' | 'createdAt'>) => void;
  deleteDraft: (id: string) => void;
  scheduleDraft: (id: string, date: Date) => void;
  unscheduleDraft: (id: string) => void;
  personas: Persona[];
  addPersona: (persona: Omit<Persona, 'id'>) => void;
  deletePersona: (id: string) => void;
  isInitialized: boolean;
}

const GhostwriterContext = createContext<GhostwriterState | undefined>(undefined);

export const GhostwriterStateProvider = ({ children }: { children: ReactNode }) => {
  const [voiceProfile, setVoiceProfileState] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedVoiceProfile = localStorage.getItem('ghostwriter_voiceProfile');
      if (storedVoiceProfile) setVoiceProfileState(JSON.parse(storedVoiceProfile));
      
      const storedDrafts = localStorage.getItem('ghostwriter_drafts');
      if (storedDrafts) setDrafts(JSON.parse(storedDrafts));

      const storedPersonas = localStorage.getItem('ghostwriter_personas');
      if (storedPersonas) setPersonas(JSON.parse(storedPersonas));

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
      console.error('Failed to save voice profile to localStorage', error);
    }
  };

  const updateAndSaveDrafts = (newDrafts: Draft[]) => {
     const sortedDrafts = newDrafts.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setDrafts(sortedDrafts);
    try {
      localStorage.setItem('ghostwriter_drafts', JSON.stringify(sortedDrafts));
    } catch (error) {
      console.error('Failed to save drafts to localStorage', error);
    }
  };

  const addDraft = (draft: Omit<Draft, 'id' | 'createdAt'>) => {
    const newDraft: Draft = {
      ...draft,
      id: new Date().toISOString() + Math.random(),
      createdAt: new Date().toISOString(),
      scheduledDate: null,
    };
    updateAndSaveDrafts([newDraft, ...drafts]);
  };

  const deleteDraft = (id: string) => {
    const updatedDrafts = drafts.filter(draft => draft.id !== id);
    updateAndSaveDrafts(updatedDrafts);
  };
  
  const scheduleDraft = (id: string, date: Date) => {
    const updatedDrafts = drafts.map(d => d.id === id ? { ...d, scheduledDate: date.toISOString() } : d);
    updateAndSaveDrafts(updatedDrafts);
  };

  const unscheduleDraft = (id: string) => {
    const updatedDrafts = drafts.map(d => d.id === id ? { ...d, scheduledDate: null } : d);
    updateAndSaveDrafts(updatedDrafts);
  };
  
  const addPersona = (persona: Omit<Persona, 'id'>) => {
    const newPersona: Persona = {
      ...persona,
      id: new Date().toISOString() + Math.random(),
    };
    setPersonas(prevPersonas => {
      const updatedPersonas = [...prevPersonas, newPersona];
       try {
        localStorage.setItem('ghostwriter_personas', JSON.stringify(updatedPersonas));
      } catch (error) {
        console.error('Failed to save personas to localStorage', error);
      }
      return updatedPersonas;
    });
  };

  const deletePersona = (id: string) => {
    setPersonas(prevPersonas => {
        const updatedPersonas = prevPersonas.filter(p => p.id !== id);
        try {
            localStorage.setItem('ghostwriter_personas', JSON.stringify(updatedPersonas));
        } catch (error) {
            console.error('Failed to save personas to localStorage', error);
        }
        return updatedPersonas;
    });
  };


  const value = {
    voiceProfile,
    setVoiceProfile,
    drafts,
    addDraft,
    deleteDraft,
    scheduleDraft,
    unscheduleDraft,
    personas,
    addPersona,
    deletePersona,
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
