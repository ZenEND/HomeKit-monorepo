import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, '../public/sounds/alias');

function createToneWav({ frequency, durationMs, volume = 0.25, fadeMs = 20 }) {
  const sampleRate = 44100;
  const sampleCount = Math.floor((sampleRate * durationMs) / 1000);
  const bytesPerSample = 2;
  const dataSize = sampleCount * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * bytesPerSample, 28);
  buffer.writeUInt16LE(bytesPerSample, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / sampleRate;
    const fadeIn = Math.min(1, time / (fadeMs / 1000));
    const fadeOut = Math.min(1, (durationMs / 1000 - time) / (fadeMs / 1000));
    const envelope = Math.min(fadeIn, fadeOut);
    const sample = Math.sin(2 * Math.PI * frequency * time) * volume * envelope;
    buffer.writeInt16LE(Math.max(-32767, Math.min(32767, Math.floor(sample * 32767))), 44 + index * 2);
  }

  return buffer;
}

function createSweepWav({ startFrequency, endFrequency, durationMs, volume = 0.2 }) {
  const sampleRate = 44100;
  const sampleCount = Math.floor((sampleRate * durationMs) / 1000);
  const bytesPerSample = 2;
  const dataSize = sampleCount * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * bytesPerSample, 28);
  buffer.writeUInt16LE(bytesPerSample, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let index = 0; index < sampleCount; index += 1) {
    const progress = index / sampleCount;
    const frequency = startFrequency + (endFrequency - startFrequency) * progress;
    const time = index / sampleRate;
    const envelope = Math.min(1, progress * 8, (1 - progress) * 8);
    const sample = Math.sin(2 * Math.PI * frequency * time) * volume * envelope;
    buffer.writeInt16LE(Math.max(-32767, Math.min(32767, Math.floor(sample * 32767))), 44 + index * 2);
  }

  return buffer;
}

mkdirSync(outputDir, { recursive: true });

const sounds = {
  'approve.wav': createToneWav({ frequency: 880, durationMs: 180, volume: 0.22 }),
  'skip.wav': createSweepWav({ startFrequency: 420, endFrequency: 220, durationMs: 160, volume: 0.18 }),
  'tick.wav': createToneWav({ frequency: 660, durationMs: 70, volume: 0.12 }),
  'time-up.wav': createToneWav({ frequency: 180, durationMs: 420, volume: 0.28 }),
  'start.wav': createToneWav({ frequency: 520, durationMs: 120, volume: 0.2 }),
};

for (const [filename, data] of Object.entries(sounds)) {
  writeFileSync(join(outputDir, filename), data);
}

console.log(`Generated ${Object.keys(sounds).length} sounds in ${outputDir}`);
