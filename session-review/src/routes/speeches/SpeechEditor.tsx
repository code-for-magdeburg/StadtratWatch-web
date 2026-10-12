import type { Speech, SessionConfig } from '../../types';
import { secondsToTimestamp } from '../../utils/time';
import { SPEECH_COMMITTEES } from '../../constants/domain';

interface Props {
  speech: Speech;
  config: SessionConfig;
  onChairPersonChange: (value: boolean) => void;
  onOnBehalfOfChange: (value: string) => void;
}

export function SpeechEditor({ speech, config, onChairPersonChange, onOnBehalfOfChange }: Props) {
  return (
    <div>
      <h1>{secondsToTimestamp(speech.start)} - {speech.speaker}</h1>

      <div>
        <a href={`${config.youtubeUrl}?t=${speech.start}`} target="_blank" rel="noreferrer">
          {secondsToTimestamp(speech.start)} ({speech.duration}s)
        </a>
      </div>

      <hr />

      <div>
        <label>
          <input
            type="checkbox"
            checked={!!speech.isChairPerson}
            onChange={(e) => onChairPersonChange(e.target.checked)}
          />
          Stadtratsvorsitz
        </label>
      </div>

      <hr />

      <div>
        {SPEECH_COMMITTEES.map((committee) => (
          <label key={committee} style={{ display: 'block' }}>
            <input
              type="radio"
              name="onBehalfOf"
              value={committee}
              checked={speech.onBehalfOf === committee}
              onChange={() => onOnBehalfOfChange(committee)}
            />
            {committee}
          </label>
        ))}

        <input
          style={{ width: 600 }}
          value={speech.onBehalfOf ?? ''}
          onChange={(e) => onOnBehalfOfChange(e.target.value)}
        />
      </div>
    </div>
  );
}
