import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { VotingsRoute } from './routes/votings/VotingsRoute';
import { SpeakersRoute } from './routes/speakers/SpeakersRoute';
import { SpeechesRoute } from './routes/speeches/SpeechesRoute';

function NoSession() {
  return (
    <p style={{ padding: '1rem' }}>
      Please provide a session date in the URL, e.g.{' '}
      <code>/session/2025-01-01/votings</code>.
    </p>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/session/:sessionDate/votings" element={<VotingsRoute />} />
        <Route path="/session/:sessionDate/speakers" element={<SpeakersRoute />} />
        <Route path="/session/:sessionDate/speeches" element={<SpeechesRoute />} />
        <Route path="*" element={<NoSession />} />
      </Routes>
    </BrowserRouter>
  );
}
