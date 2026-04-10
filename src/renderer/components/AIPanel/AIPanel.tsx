import React, { useState } from 'react';
import { useBrowserStore } from '../../store';
import { ConnectionStatus } from './ConnectionStatus';
import { FolderTree } from './FolderTree';
import { Button } from '../common';

// Terminal icon
const TerminalIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// VSCode icon
const VSCodeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.583 2.833L12.2 7.2 7.25 3.533l-4.583 2.3v12.334l4.583 2.3 4.95-3.667 5.383 4.367L22 18.5V5.5l-4.417-2.667zM17 16.267l-4.017-3.1L17 10.067v6.2zM7 16.5v-9l4.6 4.5-4.6 4.5z"/>
  </svg>
);

interface AIConfig {
  id: string;
  name: string;
  color: string;
  command: string;
  letter: string;
}

const AI_CONFIGS: AIConfig[] = [
  { id: 'claude', name: 'Claude', color: '#CC785C', command: 'claude', letter: 'C' },
  { id: 'openai', name: 'OpenAI', color: '#74AA9C', command: 'codex', letter: 'O' },
  { id: 'gemini', name: 'Gemini', color: '#4285F4', command: 'gemini', letter: 'G' },
];

export function AIPanel() {
  const aiPanelVisible = useBrowserStore((state) => state.aiPanelVisible);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedAI, setSelectedAI] = useState<AIConfig>(AI_CONFIGS[0]);

  const handleOpenTerminal = async () => {
    if (!selectedProject) {
      alert('Please select a project folder first');
      return;
    }
    try {
      await window.electronAPI.openAIInTerminal(selectedAI.command, selectedProject);
    } catch (error) {
      console.error('Failed to open terminal:', error);
    }
  };

  const handleOpenVSCode = async () => {
    if (!selectedProject) {
      alert('Please select a project folder first');
      return;
    }
    try {
      await window.electronAPI.openAIInVSCode(selectedAI.command, selectedProject);
    } catch (error) {
      console.error('Failed to open VSCode:', error);
    }
  };

  if (!aiPanelVisible) {
    return null;
  }

  return (
    <div className="w-[350px] flex flex-col eaight-aipanel h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 eaight-aipanel-header flex-shrink-0" style={{ borderBottom: '1px solid var(--aiPanel-border, var(--color-border-default))' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-white text-xs font-bold">8</span>
          </div>
          <span className="font-medium">eaight AI</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="icon" size="sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Connection status */}
      <ConnectionStatus />

      {/* AI Selector */}
      <div className="px-3 py-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--aiPanel-border, var(--color-border-default))' }}>
        <div className="text-xs mb-2" style={{ color: 'var(--color-fg-muted)' }}>Select AI</div>
        <div className="flex gap-2">
          {AI_CONFIGS.map((ai) => (
            <button
              key={ai.id}
              onClick={() => setSelectedAI(ai)}
              className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                selectedAI.id === ai.id ? 'ring-2 ring-offset-1' : ''
              }`}
              style={{
                backgroundColor: selectedAI.id === ai.id ? ai.color + '30' : 'var(--color-bg-tertiary)',
                ringColor: ai.color,
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: ai.color }}
              >
                <span className="text-white text-xs font-bold">{ai.letter}</span>
              </div>
              <span className="text-xs" style={{ color: selectedAI.id === ai.id ? ai.color : 'var(--color-fg-secondary)' }}>
                {ai.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Folder Tree */}
      <div className="flex-1 min-h-0 overflow-hidden" style={{ borderBottom: '1px solid var(--aiPanel-border, var(--color-border-default))' }}>
        <div className="px-3 py-2 text-xs" style={{ color: 'var(--color-fg-muted)', borderBottom: '1px solid var(--color-border-default)' }}>
          Select Project
        </div>
        <div className="h-[calc(100%-32px)] overflow-hidden">
          <FolderTree
            onSelectFolder={setSelectedProject}
            selectedFolder={selectedProject}
          />
        </div>
      </div>

      {/* Launch Buttons */}
      <div className="p-3 flex-shrink-0">
        <div className="flex gap-2">
          <button
            onClick={handleOpenTerminal}
            disabled={!selectedProject}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: selectedProject ? selectedAI.color : 'var(--color-bg-tertiary)',
              color: selectedProject ? 'white' : 'var(--color-fg-muted)',
            }}
          >
            <TerminalIcon />
            <span className="text-sm font-medium">Terminal</span>
          </button>
          <button
            onClick={handleOpenVSCode}
            disabled={!selectedProject}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: selectedProject ? selectedAI.color : 'var(--color-bg-tertiary)',
              color: selectedProject ? 'white' : 'var(--color-fg-muted)',
            }}
          >
            <VSCodeIcon />
            <span className="text-sm font-medium">VSCode</span>
          </button>
        </div>
        {selectedProject && (
          <div className="mt-2 text-xs text-center" style={{ color: 'var(--color-fg-muted)' }}>
            Launch <span style={{ color: selectedAI.color }}>{selectedAI.name}</span> in{' '}
            <span style={{ color: 'var(--color-accent-primary)' }}>{selectedProject.split(/[/\\]/).pop()}</span>
          </div>
        )}
      </div>

      {/* Footer with MCP status */}
      <div className="px-3 py-2 text-xs text-center flex-shrink-0" style={{ color: 'var(--color-fg-muted)', borderTop: '1px solid var(--aiPanel-border, var(--color-border-default))' }}>
        MCP: <code style={{ color: 'var(--color-accent-primary)' }}>ws://localhost:9222/mcp</code>
      </div>
    </div>
  );
}

export default AIPanel;
