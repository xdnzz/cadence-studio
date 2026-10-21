import { describe, it, expect, beforeEach } from 'vitest';
import { useAudioStore } from '../useAudioStore';
import { AudioMetadata } from '@/types/audio';

const mockTrack: AudioMetadata = {
  id: 'track-1',
  title: 'Q3 Product Strategy Alignment',
  fileName: 'q3-alignment.mp3',
  duration: 180,
  sampleRate: 44100,
  channels: 2,
  audioUrl: 'https://cdn.example.com/audio/q3-alignment.mp3',
};

describe('useAudioStore', () => {
  beforeEach(() => {
    useAudioStore.getState().reset();
  });

  it('deve inicializar com o estado padrão', () => {
    const state = useAudioStore.getState();

    expect(state.status).toBe('idle');
    expect(state.currentTime).toBe(0);
    expect(state.duration).toBe(0);
    expect(state.playbackRate).toBe(1.0);
    expect(state.volume).toBe(1.0);
    expect(state.isMuted).toBe(false);
    expect(state.activeTrack).toBeNull();
    expect(state.error).toBeNull();
  });

  it('deve definir a faixa ativa e atualizar o status para loading', () => {
    useAudioStore.getState().setActiveTrack(mockTrack);
    const state = useAudioStore.getState();

    expect(state.activeTrack).toEqual(mockTrack);
    expect(state.status).toBe('loading');
    expect(state.duration).toBe(180);
    expect(state.currentTime).toBe(0);
  });

  it('deve atualizar o status de reprodução', () => {
    useAudioStore.getState().setStatus('playing');
    expect(useAudioStore.getState().status).toBe('playing');

    useAudioStore.getState().setStatus('paused');
    expect(useAudioStore.getState().status).toBe('paused');
  });

  it('deve atualizar o currentTime', () => {
    useAudioStore.getState().setCurrentTime(45.5);
    expect(useAudioStore.getState().currentTime).toBe(45.5);
  });

  it('deve limitar o volume entre 0 e 1', () => {
    useAudioStore.getState().setVolume(1.5);
    expect(useAudioStore.getState().volume).toBe(1.0);

    useAudioStore.getState().setVolume(-0.2);
    expect(useAudioStore.getState().volume).toBe(0.0);
    expect(useAudioStore.getState().isMuted).toBe(true);

    useAudioStore.getState().setVolume(0.7);
    expect(useAudioStore.getState().volume).toBe(0.7);
    expect(useAudioStore.getState().isMuted).toBe(false);
  });

  it('deve alternar o estado de mudo', () => {
    expect(useAudioStore.getState().isMuted).toBe(false);

    useAudioStore.getState().toggleMute();
    expect(useAudioStore.getState().isMuted).toBe(true);

    useAudioStore.getState().toggleMute();
    expect(useAudioStore.getState().isMuted).toBe(false);
  });

  it('deve definir a velocidade de reprodução', () => {
    useAudioStore.getState().setPlaybackRate(1.5);
    expect(useAudioStore.getState().playbackRate).toBe(1.5);
  });

  it('deve registrar erro e alterar status para error', () => {
    useAudioStore.getState().setError('Falha ao decodificar áudio');
    const state = useAudioStore.getState();

    expect(state.error).toBe('Falha ao decodificar áudio');
    expect(state.status).toBe('error');
  });

  it('deve resetar o estado para os valores iniciais', () => {
    useAudioStore.getState().setActiveTrack(mockTrack);
    useAudioStore.getState().setCurrentTime(90);
    useAudioStore.getState().setStatus('playing');

    useAudioStore.getState().reset();
    const state = useAudioStore.getState();

    expect(state.status).toBe('idle');
    expect(state.currentTime).toBe(0);
    expect(state.activeTrack).toBeNull();
  });
});