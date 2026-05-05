interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): { transcript: string };
  [index: number]: { transcript: string };
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((ev: Event) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

type WindowWithSpeech = typeof window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

export function isVoiceInputSupported(): boolean {
  const w = window as WindowWithSpeech;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

function getRecognitionCtor(): SpeechRecognitionConstructor | null {
  const w = window as WindowWithSpeech;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export interface VoiceController {
  start(): void;
  stop(): void;
}

export interface VoiceCallbacks {
  onTranscript: (text: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
}

export function createVoiceController(callbacks: VoiceCallbacks): VoiceController | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = 'fr-FR';
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const result = event.results[0];
    if (!result || result.length === 0) return;
    const transcript = result[0].transcript.trim();
    if (transcript) callbacks.onTranscript(transcript);
  };

  recognition.onerror = (event) => {
    const err = event as Event & { error?: string };
    callbacks.onError?.(err.error || 'Erreur de reconnaissance vocale');
  };

  recognition.onend = () => {
    active = false;
    callbacks.onEnd?.();
  };

  let active = false;
  return {
    start: () => {
      if (active) return;
      try {
        recognition.start();
        active = true;
        callbacks.onStart?.();
      } catch (e) {
        callbacks.onError?.((e as Error).message || 'Démarrage impossible');
      }
    },
    stop: () => {
      if (!active) return;
      try {
        recognition.stop();
      } catch {
        /* noop */
      }
      active = false;
    },
  };
}
