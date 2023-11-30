import { Component, Input } from '@angular/core';


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


}
