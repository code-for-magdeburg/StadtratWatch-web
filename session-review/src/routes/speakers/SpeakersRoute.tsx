import { useCallback, useEffect, useReducer } from 'react';
import { useParams } from 'react-router-dom';
import type { Speaker } from '../../types';
import { env } from '../../constants/env';
import { useSessionData } from '../../hooks/useSessionData';
import { StatusGate } from '../../components/StatusGate';
import { SelectionList } from '../../components/SelectionList';
import { downloadJson } from '../../utils/download';
import {
  speakersReducer,
  initialSpeakersState,
  generateSpeeches,
} from './speakersReducer';
import { SpeakerEditor } from './SpeakerEditor';

const dataUrl = (date: string) =>
  `${env.awsCloudFrontSessionsSpeakersRedactedBaseFolder}/session-speakers-${date}.json`;
const configUrl = (date: string) =>
  `${env.awsCloudFrontSessionsConfigsBaseFolder}/config-${date}.json`;

export function SpeakersRoute() {
  const { sessionDate } = useParams();
  const dataCb = useCallback(dataUrl, []);
  const configCb = useCallback(configUrl, []);
  const { loading, error, data, config } = useSessionData<Speaker[]>(
    sessionDate,
    dataCb,
    configCb,
  );

  const [state, dispatch] = useReducer(speakersReducer, initialSpeakersState);

  useEffect(() => {
    if (data) dispatch({ type: 'init', speakers: data });
  }, [data]);

  const selected = state.speakers[state.selectedIndex] ?? null;

  function saveSpeakers() {
    if (!sessionDate) return;
    downloadJson(`session-speakers-${sessionDate}.json`, state.speakers);
  }

  function saveSpeeches() {
    if (!sessionDate) return;
    downloadJson(
      `session-speeches-${sessionDate}.json`,
      generateSpeeches(state.speakers),
    );
  }

  return (
    <StatusGate loading={loading} error={error} empty={!!data && data.length === 0}>
      <div style={{ display: 'flex', height: '100%' }}>
        <div style={{ width: 300, background: '#eee', overflowY: 'auto' }}>
          <SelectionList
            items={state.speakers}
            selectedIndex={state.selectedIndex}
            onSelect={(index) => dispatch({ type: 'select', index })}
            render={(s) => s.speaker}
          />
        </div>
        <div style={{ padding: '0 1rem' }}>
          {selected && config && (
            <SpeakerEditor
              key={state.selectedIndex}
              speaker={selected}
              config={config}
              onRename={(name) => dispatch({ type: 'rename', name })}
              onRemove={() => dispatch({ type: 'remove' })}
            />
          )}
          <div>
            <button type="button" onClick={saveSpeakers}>Save Speakers</button>
            <button type="button" onClick={() => dispatch({ type: 'compact' })}>Compact</button>
            <button type="button" onClick={saveSpeeches}>Save Speeches</button>
          </div>
        </div>
      </div>
    </StatusGate>
  );
}
