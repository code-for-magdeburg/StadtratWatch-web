import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PartiesService } from '../services/parties.service';
import { forkJoin } from 'rxjs';
import { PersonsService } from '../services/persons.service';
import { Councilor, CouncilorCardComponent } from '../components/councilor-card/councilor-card.component';
import { PartyStatsHistoryDto } from '../model/Party';
import { MetaTagsService } from '../services/meta-tags.service';
import { ELECTION_PERIOD_PATH } from '../app-routing.module';


export type Party = {
  name: string;
  uniformityScore: number;
  votingsSuccessRate: number;
  participationRate: number;
  abstentionRate: number;
  statsHistory: PartyStatsHistoryDto;
};


@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.scss']
})
export class PartyComponent implements OnInit {


  protected readonly ELECTION_PERIOD_PATH = ELECTION_PERIOD_PATH;

  public electionPeriod = 0;
  public party: Party | null = null;
  public councilors: Councilor[] = [];
  public formerCouncilors: Councilor[] = [];


  constructor(private readonly route: ActivatedRoute, private readonly partiesService: PartiesService,
              private readonly personsService: PersonsService, private readonly metaTagsService: MetaTagsService) {
  }


  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      this.electionPeriod = +(params.get('electionPeriod') || 0);
      if (!this.electionPeriod) {
        // TODO: Handle missing election period
        return;
      }

      const partyId = params.get('id');
      if (!partyId) {
        // TODO: Handle missing party id
        return;
      }

      forkJoin([
        this.partiesService.fetchParty(this.electionPeriod, partyId),
        this.personsService.fetchPersonsByParty(this.electionPeriod, partyId)
      ])
        .subscribe(([party, persons]) => {

          const today = new Date().toISOString().substring(0, 10);

          this.party = {
            name: party.name,
            votingsSuccessRate: party.votingsSuccessRate,
            uniformityScore: party.uniformityScore,
            participationRate: party.participationRate,
            abstentionRate: party.abstentionRate,
            statsHistory: party.statsHistory
          };
          this.councilors = persons
            .filter(person => !person.councilorUntil || person.councilorUntil >= today)
            .map(CouncilorCardComponent.mapPersonToCouncilor);
          this.formerCouncilors = persons
            .filter(person => person.councilorUntil && person.councilorUntil < today)
            .map(CouncilorCardComponent.mapPersonToCouncilor);

          const title = `StadtratWatch: ${party.name}`;
          const description = party.name.startsWith('parteilos-')
            ? `${party.name} - Abstimmungen, Anwesenheiten und andere Daten und Analysen im Magdeburger Stadtrat`
            : `${party.name} - Abstimmungen, Anwesenheiten und andere Daten und Analysen der Partei im Magdeburger Stadtrat`;
          this.metaTagsService.updateTags({ title, description });

        });

    });

  }


}
