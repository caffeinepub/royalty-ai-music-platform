// Audio processing utilities for Mix & Master tool

interface ProcessingSettings {
  gain: number;
  lowEQ: number;
  midEQ: number;
  highEQ: number;
}

export async function processAudio(
  audioBuffer: AudioBuffer,
  sampleRate: number,
  settings: ProcessingSettings
): Promise<AudioBuffer> {
  // Create offline context for processing
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    sampleRate
  );

  // Create source
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;

  // Create processing nodes
  const gainNode = offlineContext.createGain();
  const lowShelf = offlineContext.createBiquadFilter();
  const midPeak = offlineContext.createBiquadFilter();
  const highShelf = offlineContext.createBiquadFilter();

  // Configure gain
  gainNode.gain.value = settings.gain;

  // Configure filters
  lowShelf.type = 'lowshelf';
  lowShelf.frequency.value = 200;
  lowShelf.gain.value = settings.lowEQ;

  midPeak.type = 'peaking';
  midPeak.frequency.value = 1000;
  midPeak.Q.value = 1;
  midPeak.gain.value = settings.midEQ;

  highShelf.type = 'highshelf';
  highShelf.frequency.value = 3000;
  highShelf.gain.value = settings.highEQ;

  // Connect nodes: source -> low -> mid -> high -> gain -> destination
  source.connect(lowShelf);
  lowShelf.connect(midPeak);
  midPeak.connect(highShelf);
  highShelf.connect(gainNode);
  gainNode.connect(offlineContext.destination);

  // Start processing
  source.start();

  // Render and return processed buffer
  return offlineContext.startRendering();
}

export function downloadAudio(audioBuffer: AudioBuffer, filename: string): void {
  // Convert AudioBuffer to WAV
  const wav = audioBufferToWav(audioBuffer);
  const blob = new Blob([wav], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);

  // Create download link and trigger
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numberOfChannels = buffer.numberOfChannels;
  const length = buffer.length * numberOfChannels * 2;
  const sampleRate = buffer.sampleRate;
  const arrayBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(arrayBuffer);

  // Write WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM format
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * 2, true);
  view.setUint16(32, numberOfChannels * 2, true);
  view.setUint16(34, 16, true); // 16-bit
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);

  // Write audio data
  const channels: Float32Array[] = [];
  for (let i = 0; i < numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return arrayBuffer;
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
