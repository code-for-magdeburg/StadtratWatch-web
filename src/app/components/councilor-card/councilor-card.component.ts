import { Component, Input } from '@angular/core';
import { PersonLightDto } from '../../model/Person';


export type Councilor = {
  personId: string;
  name: string;
  party: string;
  councilorUntil?: string;
};


@Component({
  selector: 'app-councilor-card',
  templateUrl: './councilor-card.component.html',
  styleUrls: ['./councilor-card.component.scss']
})
export class CouncilorCardComponent {


  @Input() public councilor!: Councilor;


  public static mapPersonToCouncilor(person: PersonLightDto): Councilor {
    return {
      personId: person.id,
      name: person.name,
      party: person.party,
      councilorUntil: person.councilorUntil
    };
  }


}