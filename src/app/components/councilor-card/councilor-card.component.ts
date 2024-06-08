import { Component, Input } from '@angular/core';
import { PersonLightDto } from '../../model/Person';
import { ELECTION_PERIOD_PATH } from '../../app-routing.module';


export type Councilor = {
  personId: string;
  name: string;
  party: string;
  councilorUntil: string | null;
};


@Component({
  selector: 'app-councilor-card',
  templateUrl: './councilor-card.component.html',
  styleUrls: ['./councilor-card.component.scss']
})
export class CouncilorCardComponent {


  protected readonly ELECTION_PERIOD_PATH = ELECTION_PERIOD_PATH;


  @Input() public electionPeriod!: number;
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
