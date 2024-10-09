import { Component, Input } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ELECTORAL_PERIOD_PATH } from 'src/app/app-routing.module';


export type SpeechSearchResultItem = {
  id: string;
  electoralPeriod: string;
  session: string;
  sessionDate: number;
  start: number;
  speaker: string;
  faction?: string;
  onBehalfOf?: string;
  content: string;
};


@Component({
  selector: 'app-speech-search-result-card',
  standalone: true,
  imports: [
    NgIf,
    DatePipe,
    RouterLink
  ],
  templateUrl: './speech-search-result-card.component.html',
  styleUrl: './speech-search-result-card.component.scss'
})
export class SpeechSearchResultCardComponent {


  protected readonly ELECTORAL_PERIOD_PATH = ELECTORAL_PERIOD_PATH;


  @Input() public speech!: SpeechSearchResultItem;


}
