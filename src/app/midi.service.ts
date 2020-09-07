import { Injectable, EventEmitter } from '@angular/core';
import { OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MidiService {
  inputs: any[] = [];
  noteEmitter: EventEmitter<Number> = new EventEmitter();
  constructor() { 
    this.accessMidi();
  }

  accessMidi(): void {
    const onMIDISuccess = (access) => {
      for (let input of access.inputs.values()) {
        this.inputs.push(input);
        input.onmidimessage = (message) => {
          if (message.data[0] === 144 && message.data[2] > 0) {
            this.noteEmitter.emit(message.data[1]);
          } else if (message.data[0] === 128 || message.data[2] === 0) {
            // stop note
          }
        };
      }
      access.onstatechange = function (e) {
        // Print information about the (dis)connected MIDI controller
        console.log(e.port.name, e.port.manufacturer, e.port.state);
      };
    }
    navigator.requestMIDIAccess().then(onMIDISuccess);
  }
}
