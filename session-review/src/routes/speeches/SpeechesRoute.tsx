import { useCallback, useEffect, useReducer } from 'react';
import { useParams } from 'react-router-dom';
import type { Speech } from '../../types';
import { env } from '../../constants/env';
import { CHAIR_PERSONS } from '../../constants/domain';
import { useSessionData } from '../../hooks/useSessionData';
import { StatusGate } from '../../components/StatusGate';
import { downloadJson } from '../../utils/download';
import {
  speechesReducer,
  initialSpeechesState,
  speechesForSave,
} from './speechesReducer';
import { SpeechesSelection } from './SpeechesSelection';
import { SpeechEditor } from './SpeechEditor';

const dataUrl = (date: string) =>
  `${env.awsCloudFrontSessionsSpeechesRedactedBaseFolder}/session-speeches-${date}.json`;
const configUrl = (date: string) =>
  `${env.awsCloudFrontSessionsConfigsBaseFolder}/config-${date}.json`;

export function SpeechesRoute() {
  const { sessionDate } = useParams();
  const dataCb = useCallback(dataUrl, []);
  const configCb = useCallback(configUrl, []);
  const { loading, error, data, config } = useSessionData<Speech[]>(
    sessionDate,
    dataCb,
    configCb,
  );

  const [state, dispatch] = useReducer(speechesReducer, initialSpeechesState);

  useEffect(() => {
    if (data) dispatch({ type: 'init', speeches: data });
  }, [data]);

  const selected = state.speeches[state.selectedIndex] ?? null;

  function save() {
    if (!sessionDate) return;
    downloadJson(`session-speeches-${sessionDate}.json`, speechesForSave(state.speeches));
  }

  return (
    <StatusGate loading={loading} error={error} empty={!!data && data.length === 0}>
      <div style={{ display: 'flex', height: '100%' }}>
        <div style={{ width: 1500, background: '#eee', overflowY: 'auto' }}>
          <SpeechesSelection
            speeches={state.speeches}
            selectedIndex={state.selectedIndex}
            onSelect={(index) => dispatch({ type: 'select', index })}
          />
        </div>

        <div style={{ padding: '0 1rem' }}>
          {selected && config && (
            <SpeechEditor
              key={state.selectedIndex}
              speech={selected}
              config={config}
              onChairPersonChange={(value) => dispatch({ type: 'setChairPerson', value })}
              onOnBehalfOfChange={(value) => dispatch({ type: 'setOnBehalfOf', value })}
            />
          )}

          <hr />

          <div>
            <h3>Toggle Stadtratsvorsitz</h3>
            {CHAIR_PERSONS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => dispatch({ type: 'toggleChairByName', name })}
              >
                {name}
              </button>
            ))}
          </div>

          <hr />

          <button type="button" onClick={save}>Save</button>
        </div>
      </div>
    </StatusGate>
  );
}
