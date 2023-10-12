import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PartiesService } from '../services/parties.service';
import { forkJoin } from 'rxjs';
import { PersonsService } from '../services/persons.service';


type Party = {
  name: string;
};

type PartyMember = {
  personId: string;
  name: string;
  party: string;
};


@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.scss']
})
export class PartyComponent {


  public party: Party | null = null;
  public members: PartyMember[] = [];


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
          this.party = { name: party.name };
          this.members = persons.map(person => ({
            personId: person.id,
            name: person.name,
            party: person.party
          }));
        });

    });

  }


}
