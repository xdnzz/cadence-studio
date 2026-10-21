export interface WordTimestamp {
    id: string;
    word: string;
    start: number;
    end: number;
    confidence: number;
  }
  
  export interface Speaker {
    id: string;
    name: string;
    avatarUrl?: string;
    color: string;
  }
  
  export interface TranscriptSegment {
    id: string;
    speakerId: string;
    speakerName: string;
    start: number;
    end: number;
    text: string;
    words: WordTimestamp[];
  }
  
  export interface TranscriptFilter {
    searchQuery: string;
    selectedSpeakerIds: string[];
  }