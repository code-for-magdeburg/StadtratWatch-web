import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PartiesService } from '../services/parties.service';
import { forkJoin } from 'rxjs';
import { PersonsService } from '../services/persons.service';
import { Councilor, CouncilorCardComponent } from '../components/councilor-card/councilor-card.component';
import { PartyStatsHistoryDto } from '../model/Party';
import { Meta, Title } from '@angular/platform-browser';


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


  public party: Party | null = null;
  public councilors: Councilor[] = [];
  public formerCouncilors: Councilor[] = [];


  constructor(private readonly route: ActivatedRoute, private readonly partiesService: PartiesService,
              private readonly personsService: PersonsService, private readonly meta: Meta,
              private readonly titleService: Title) {
  }


  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const partyId = params.get('id');
      if (!partyId) {
        // TODO: Handle missing party id
        return;
      }

      forkJoin([
        this.partiesService.fetchParty(partyId),
        this.personsService.fetchPersonsByParty(partyId)
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

          const description = party.name.startsWith('parteilos-')
            ? `${party.name} - Abstimmungen, Anwesenheiten und andere Statistiken im Magdeburger Stadtrat`
            : `${party.name} - Abstimmungen, Anwesenheiten und andere Statistiken der Partei im Magdeburger Stadtrat`;
          const title = `${party.name} im Magdeburger Stadtrat`;
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

    });

  }


}
