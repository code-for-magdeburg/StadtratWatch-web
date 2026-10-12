import { assertEquals } from '@std/assert';
import { describe, it } from '@std/testing/bdd';
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

    assertEquals(serializeSpeeches(JSON.parse(fileContent)), fileContent);
  });
});
