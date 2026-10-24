import { describe, expect, it } from 'bun:test';

import { serializeSpeeches } from './speeches-file.ts';

describe('serializeSpeeches', () => {
  it('reproduces an unchanged speeches file byte for byte, including the final newline', () => {
    const fileContent = `[
  {
    "speaker": "Max Mustermann",
    "start": 120,
    "duration": 45,
    "transcription": "Sehr geehrte Damen und Herren, für die Bürgerinnen und Bürger."
  }
]
`;

    expect(serializeSpeeches(JSON.parse(fileContent))).toEqual(fileContent);
  });
});
