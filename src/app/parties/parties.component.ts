import { Component } from '@angular/core';
import { PartiesService } from '../services/parties.service';
import { PartyDto } from '../model/Party';
import { map } from "rxjs";


@Component({
  selector: 'app-parties',
  templateUrl: './parties.component.html',
  styleUrls: ['./parties.component.scss']
})
export class PartiesComponent {


  public parties: PartyDto[] = [];


  constructor(private readonly partiesService: PartiesService) {
  }


  //noinspection JSUnusedGlobalSymbols
  ngOnInit() {
    this.partiesService
      .fetchParties()
      .subscribe(parties => {
        this.parties = parties;
        this.parties.sort((a, b) => b.membersCount - a.membersCount);
      });
  }

  
}
