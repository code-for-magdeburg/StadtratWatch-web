import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PartiesService } from '../services/parties.service';
import { forkJoin } from 'rxjs';
import { PersonsService } from '../services/persons.service';
import { Councilor } from './councilor-card/councilor-card.component';


type Party = {
  name: string;
};


@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.scss']
})
export class PartyComponent {


  public party: Party | null = null;
  public councilors: Councilor[] = [];
  public formerCouncilors: Councilor[] = [];


  constructor(private readonly route: ActivatedRoute, private readonly partiesService: PartiesService,
              private readonly personsService: PersonsService) {
  }


  //noinspection JSUnusedGlobalSymbols
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

          this.party = { name: party.name };

          this.councilors = persons
            .filter(person => !person.councilorUntil || person.councilorUntil > today)
            .map(person => ({
              personId: person.id,
              name: person.name,
              party: person.party
            }));

          this.formerCouncilors = persons
            .filter(person => person.councilorUntil < today)
            .map(person => ({
              personId: person.id,
              name: person.name,
              party: person.party,
              councilorUntil: person.councilorUntil
            }));

        });

    });

  }


}
