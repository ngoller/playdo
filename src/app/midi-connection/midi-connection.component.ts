import { Component, OnInit } from '@angular/core';
import { MidiService } from '../midi.service';

@Component({
  selector: 'midi-connection',
  templateUrl: './midi-connection.component.html',
  styleUrls: ['./midi-connection.component.sass']
})
export class MidiConnectionComponent implements OnInit {

  constructor(public midi: MidiService) { }

  ngOnInit(): void {
  }

}
