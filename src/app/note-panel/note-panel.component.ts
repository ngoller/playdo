import { Component, OnInit } from '@angular/core';
import Vex from "vexflow";
import { AnimationDurations } from '@angular/material/core';
import {interval, Subscription} from 'rxjs';
import {MidiService} from '../midi.service';

@Component({
  selector: 'note-panel',
  templateUrl: './note-panel.component.html',
  styleUrls: ['./note-panel.component.sass']
})
export class NotePanelComponent implements OnInit {
  notes: [Vex.Flow.StaveNote, Node][] = [];
  i: number = 0;
  music: Vex.Flow.Music = new Vex.Flow.Music();

  constructor(private midi: MidiService) {}

  ngOnInit(): void {
    const VF = Vex.Flow;
    const div = document.getElementById('vex-target')
    const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    renderer.resize(500, 500);
    const context = renderer.getContext()
    
    // Create a stave of width 10000 at position 10, 40 on the canvas.
    const stave = new VF.Stave(10, 10, 10000).addClef('treble');
    // Connect it to the rendering context and draw!
    stave.setContext(context).draw();
    const tickContext = new VF.TickContext();

    this.midi.noteEmitter.subscribe((note) => {
      if (this.i < this.notes.length) {
        const n = this.notes[this.i];
        const key = n[0].getKeys()[0];
        const noteName = key[0];
        const octave = Number(key[key.length-1]) + 1;
        // get note value and move it based on octave
        const absoluteNote = this.music.getNoteValue(noteName) + octave * VF.Music.NUM_TONES;
        if (absoluteNote === note) {
          n[0].setStyle({fillStyle: 'green', strokeStyle: 'green'});
          this.i++; 
        }
        else {
          n[0].setStyle({fillStyle: 'red', strokeStyle: 'red'});
          this.i++;
        }
        n[0].draw();

        console.log(absoluteNote + " - midi note: " + note);
      }
    });

    interval(1000).subscribe(() => this.drawNote(tickContext, stave, context));
  }

  getRandomNote(): Vex.Flow.StaveNote {
    const durations = ['8', '4', '2', '1'];
    let letter = String.fromCharCode('a'.charCodeAt(0) + Math.floor(Math.random() * 7))
    let octave = `${4 + Math.floor(Math.random() * 1)}` 
    let acc = '';
    const note = new Vex.Flow.StaveNote({
      clef: 'treble',
      keys: [`${letter}${acc}/${octave}`],
      duration: '4',
    })

    if (acc) note.addAccidental(0, new Vex.Flow.Accidental(acc));

    return note;
  }

  drawNote(tc: Vex.Flow.TickContext, s: Vex.Flow.Stave, c : Vex.IRenderContext): void {
    const group = c.openGroup(); // create an SVG group element
    
    const note = this.getRandomNote();
    this.notes.push([note, group]);

    tc.addTickable(note);
    note.setContext(c).setStave(s)

    tc.preFormat().setX(400)
    note.draw();

    group.classList.add('scroll');
    c.closeGroup();
    const box = group.getBoundingClientRect();

    group.classList.add('scrolling'); // and now start it scrolling
    setTimeout(() => group.classList.add('hidden'), 5000);
  }
}
