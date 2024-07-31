import { Component, OnInit } from '@angular/core';
import { PersonsService } from '../services/persons.service';
import { ActivatedRoute } from '@angular/router';
import { VoteResult } from '../model/Session';
import { PersonDetailsDto, PersonSpeechDto, PersonVotingComparison } from '../model/Person';
import { MetaTagsService } from '../services/meta-tags.service';
import { ELECTORAL_PERIOD_PATH } from '../app-routing.module';
import { environment } from '../../environments/environment';


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


  protected readonly ELECTORAL_PERIOD_PATH = ELECTORAL_PERIOD_PATH;

  public electoralPeriod = environment.currentElectoralPeriod;
  public person: PersonDetailsDto | null = null;
  public didVote = 0;
  public comparisonMatrix: PersonVotingComparison[] = [];
  public speechesBySession: SpeechesBySession[] = [];


  constructor(private readonly route: ActivatedRoute, private readonly personsService: PersonsService,
              private readonly metaTagsService: MetaTagsService) {
  }


  ngOnInit(): void {

    this.route.paramMap.subscribe(async params => {

      this.electoralPeriod = params.get('electoralPeriod') || this.electoralPeriod;
      if (!this.electoralPeriod) {
        // TODO: Handle missing electoral period
        return;
      }

      const personId = params.get('id');
      if (!personId) {
        // TODO: Handle missing person id
        return;
      }

      const person = await this.personsService.fetchPerson(this.electoralPeriod, personId);
      this.person = person;
      this.comparisonMatrix = person.votingMatrix.sort(
        (a, b) => b.comparisonScore - a.comparisonScore
      );
      this.didVote = person.votes.length -
        person.votes.filter(vote => vote.vote === VoteResult.DID_NOT_VOTE).length;

      this.speechesBySession = this.generateSpeechesBySession(person);

      this.metaTagsService.updateTags({
        title: `StadtratWatch: ${person.name}`,
        description: `${person.name}: Abstimmungen, Anwesenheiten, Redebeiträge und andere Analysen im Magdeburger Stadtrat`
      });

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
