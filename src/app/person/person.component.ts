import { Component, OnInit } from '@angular/core';
import { PersonsService } from '../services/persons.service';
import { ActivatedRoute } from '@angular/router';
import { VoteResult } from '../model/Session';
import { PersonDetailsDto, PersonSpeechDto, PersonVotingComparison } from '../model/Person';
import { Meta, Title } from '@angular/platform-browser';


type SpeechesBySession = {
  sessionDate: string;
  youtubeUrl: string;
  speeches: PersonSpeechDto[];
};


@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss']
})
export class PersonComponent implements OnInit {


  public person: PersonDetailsDto | null = null;
  public didVote = 0;
  public comparisonMatrix: PersonVotingComparison[] = [];
  public speechesBySession: SpeechesBySession[] = [];


  constructor(private readonly route: ActivatedRoute, private readonly personsService: PersonsService,
              private readonly meta: Meta, private readonly titleService: Title) {
  }


  ngOnInit(): void {

    this.route.paramMap.subscribe(async params => {

      const personId = params.get('id');
      if (!personId) {
        // TODO: Handle missing person id
        return;
      }

      const person = await this.personsService.fetchPerson(personId);
      this.person = person;
      this.comparisonMatrix = person.votingMatrix.sort(
        (a, b) => b.comparisonScore - a.comparisonScore
      );
      this.didVote = person.votes.length -
        person.votes.filter(vote => vote.vote === VoteResult.DID_NOT_VOTE).length;

      this.speechesBySession = this.generateSpeechesBySession(person);

      const title = `StadtratWatch: ${person.name}`;
      const description = `${person.name}: Abstimmungen, Anwesenheiten, Redebeiträge und andere Analysen im Magdeburger Stadtrat`;
      this.titleService.setTitle(title);
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:title', content: title });
      this.meta.updateTag({ property: 'og:description', content: description });
      this.meta.updateTag({ name: 'twitter:title', content: title });
      this.meta.updateTag({ name: 'twitter:description', content: description });
      // TODO: Add property og:url
      // TODO: Add property og:image
      // TODO: Add name twitter:image
      // TODO: Add name twitter:card
      // TODO: Add name twitter:domain
      // TODO: Add name twitter:url

    });

  }


  private generateSpeechesBySession(person: PersonDetailsDto): SpeechesBySession[] {

    const speechesBySessions = person.speeches.reduce(
      (acc, speech) => {
        const session = acc.find(
          s => s.sessionDate === speech.sessionDate
        );
        if (session) {
          session.speeches.push(speech);
        } else {
          acc.push({
            sessionDate: speech.sessionDate,
            youtubeUrl: speech.youtubeUrl,
            speeches: [speech]
          });
        }
        return acc;

      }, [] as SpeechesBySession[]);

    speechesBySessions.sort((a, b) =>
      b.sessionDate.localeCompare(a.sessionDate));
    speechesBySessions.forEach(speeches =>
      speeches.speeches.sort((a, b) => a.start - b.start));

    return speechesBySessions;

  }


}
