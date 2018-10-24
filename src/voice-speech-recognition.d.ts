declare module 'voice-speech-recognition' {
  export interface Config {
    continuous?: boolean; // default: true, interval: {true, false}
    interimResults?: boolean; // default: true, interval: {true, false}
    maxAlternatives?: number; // default: 1, interval {1, 2, 3, 4, ...}
    lang?: string, // default: 'en-US', one of language localisation
    // grammars?: undefined, // default: new SpeechGrammarList()
    // serviceURI?: undefined, // default: undefined
  }

  export default interface VSR {
    voiceSpeechRecognition(config?: Config) : VSR;
  }
}
