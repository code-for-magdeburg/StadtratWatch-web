import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PartiesService } from '../services/parties.service';
import { forkJoin } from 'rxjs';
import { PersonsService } from '../services/persons.service';
import { Councilor, CouncilorCardComponent } from '../components/councilor-card/councilor-card.component';
import { PartyStatsHistoryDto } from '../model/Party';
import { MetaTagsService } from '../services/meta-tags.service';
import { ELECTORAL_PERIOD_PATH } from '../app-routing.module';
import { environment } from '../../environments/environment';


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


  protected readonly ELECTORAL_PERIOD_PATH = ELECTORAL_PERIOD_PATH;

  public electoralPeriod = environment.currentElectoralPeriod;
  public party: Party | null = null;
  public councilors: Councilor[] = [];


  constructor(private readonly route: ActivatedRoute, private readonly partiesService: PartiesService,
              private readonly personsService: PersonsService, private readonly metaTagsService: MetaTagsService) {
  }


  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      this.electoralPeriod = params.get('electoralPeriod') || this.electoralPeriod;
      if (!this.electoralPeriod) {
        // TODO: Handle missing electoral period
        return;
      }

      const partyId = params.get('id');
      if (!partyId) {
        // TODO: Handle missing party id
        return;
      }

      forkJoin([
        this.partiesService.fetchParty(this.electoralPeriod, partyId),
        this.personsService.fetchPersonsByParty(this.electoralPeriod, partyId)
      ])
        .subscribe(([party, persons]) => {

          this.party = {
            name: party.name,
            votingsSuccessRate: party.votingsSuccessRate,
            uniformityScore: party.uniformityScore,
            participationRate: party.participationRate,
            abstentionRate: party.abstentionRate,
            statsHistory: party.statsHistory
          };
          this.councilors = persons
            .map(CouncilorCardComponent.mapPersonToCouncilor)
            .sort((a, b) => {
              if (a.councilorUntil && !b.councilorUntil) {
                return 1;
              }
              if (!a.councilorUntil && b.councilorUntil) {
                return -1;
              }
              return 0;
            });

          const title = `StadtratWatch: ${party.name}`;
          const description = party.name.startsWith('parteilos-')
            ? `${party.name} - Abstimmungen, Anwesenheiten und andere Daten und Analysen im Magdeburger Stadtrat`
            : `${party.name} - Abstimmungen, Anwesenheiten und andere Daten und Analysen der Partei im Magdeburger Stadtrat`;
          this.metaTagsService.updateTags({ title, description });

        });

    });

  }


}
