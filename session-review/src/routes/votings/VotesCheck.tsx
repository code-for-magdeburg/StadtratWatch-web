import type { Voting, SessionConfig } from '../../types';
import { env } from '../../constants/env';
import { voteColor } from '../../constants/domain';

interface Props {
  sessionDate: string;
  voting: Voting;
  config: SessionConfig;
}

export function VotesCheck({ sessionDate, voting, config }: Props) {
  const src = `${env.awsCloudFrontSessionsRawBaseFolder}/${sessionDate}/${voting.votingFilename}`;

  const dots = voting.votes.flatMap((vote) => {
    const nameConfig = config.names.find((n) => n.name === vote.name);
    if (!nameConfig) {
      console.warn(`No seat config for vote name: ${vote.name} — dot skipped`);
      return [];
    }
    return [{
      name: vote.name,
      top: 185 + nameConfig.rowIndex * 19.5,
      left: 250 + nameConfig.columnIndex * 280,
      color: voteColor(vote.vote),
    }];
  });

  return (
    <div style={{ position: 'relative', height: 800 }}>
      <img src={src} style={{ height: '100%', width: '100%', objectFit: 'contain' }} alt="" />
      {dots.map((dot) => (
        <div
          key={dot.name}
          style={{
            position: 'absolute',
            top: dot.top,
            left: dot.left,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: dot.color,
            border: '1px solid black',
          }}
        />
      ))}
    </div>
  );
}
