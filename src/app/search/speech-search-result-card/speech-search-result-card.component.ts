import { Component, Input } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';


export type SpeechSearchResultItem = {
  id: string;
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


  @Input() public speech!: SpeechSearchResultItem;


}
