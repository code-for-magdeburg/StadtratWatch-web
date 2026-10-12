import type { Speaker, SessionConfig } from '../../types';
import { secondsToTimestamp, secondsToDuration } from '../../utils/time';

interface Props {
  speaker: Speaker;
  config: SessionConfig;
  onRename: (name: string) => void;
  onRemove: () => void;
}

export function SpeakerEditor({ speaker, config, onRename, onRemove }: Props) {
  const names = config.names
    .map((n) => n.name)
    .sort((a, b) => a.localeCompare(b));

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <ul>
          {names.map((name) => (
            <li key={name}>
              <button type="button" onClick={() => onRename(name)}>{name}</button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label>
          Sprecher*in
          <br />
          <input
            style={{ width: 500 }}
            value={speaker.speaker}
            onChange={(e) => onRename(e.target.value)}
          />
        </label>

        <button type="button" onClick={onRemove}>Remove</button>

        <ul>
          {speaker.segments.map((segment, index) => (
            <li key={index}>
              <a
                href={`${config.youtubeUrl}?t=${Math.floor(segment.start)}`}
                target="_blank"
                rel="noreferrer"
              >
                {secondsToTimestamp(segment.start)} ({secondsToDuration(segment.duration)})
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
