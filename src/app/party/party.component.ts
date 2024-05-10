import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PartiesService } from '../services/parties.service';
import { forkJoin } from 'rxjs';
import { PersonsService } from '../services/persons.service';
import { Councilor, CouncilorCardComponent } from '../components/councilor-card/councilor-card.component';
import { PartyStatsHistoryDto } from '../model/Party';
import { Meta } from '@angular/platform-browser';


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
              private readonly personsService: PersonsService, private readonly meta: Meta) {
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

          this.meta.addTag({ name: 'title', content: `Partei ${party.name}` });

        });

    });

  }


}
