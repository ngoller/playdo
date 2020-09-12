import { Component, OnInit } from '@angular/core';
import Vex from "vexflow";
import { interval } from 'rxjs';
import { MidiService } from '../midi.service';
import { DisplayNote } from '../../display-note'

const SPEED_FACTOR: number = .1;

@Component({
  selector: 'note-panel',
  templateUrl: './note-panel.component.html',
  styleUrls: ['./note-panel.component.sass']
})
export class NotePanelComponent implements OnInit {
  notes: DisplayNote[] = [];
  start: DOMHighResTimeStamp;
  prev: DOMHighResTimeStamp;
  lastNoteTime: DOMHighResTimeStamp = performance.now();
  nps: number = 1;
  boundUpdate: () => void;
  speed: number = 1;
  context: Vex.IRenderContext;
  tickContext: Vex.Flow.TickContext;
  stave: Vex.Flow.Stave;
  progress: number = 0;

  constructor(private midi: MidiService) {
    this.boundUpdate = this.update.bind(this);
  }

  ngOnInit(): void {
    const VF = Vex.Flow;
    const div = document.getElementById('vex-target')
    const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    renderer.resize(1200, 500);
    this.context = renderer.getContext()
    this.context.scale(3,3);
    // Create a stave of width 1000 at position 10, 40 on the canvas.
    this.stave = new VF.Stave(10, 10, 1000).addClef('treble');
    // Connect it to the rendering context and draw!
    this.stave.setContext(this.context).draw();
    this.tickContext = new VF.TickContext();

    window.requestAnimationFrame(this.boundUpdate);
    this.midi.noteEmitter.subscribe((note: number) => {
      // if there is active note... check to see if they played the right note
      // if ('a' === note) {
      // setStyle({fillStyle: 'green', strokeStyle: 'green'});
      // } else {
      // setStyle({fillStyle: 'red', strokeStyle: 'red'});
      // }
    });
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

  drawNote(tc: Vex.Flow.TickContext, s: Vex.Flow.Stave, c: Vex.IRenderContext): void {
    const group = c.openGroup(); // create an SVG group element
    const note = this.getRandomNote();
    const dn = new DisplayNote(note);
    this.notes.push(dn);

    tc.addTickable(note);
    note.setContext(c).setStave(s)

    note.draw();

    // add initial transform
    const t = document.getElementsByTagName("svg")[0].createSVGTransform();
    dn.el().transform.baseVal.appendItem(t);

    dn.setX(this.stave.getWidth());

    c.closeGroup();
    const box = (group as any).getBoundingClientRect();
  }

  update(timestamp) {
    if (this.start === undefined) {
      this.start = timestamp;
      this.prev = timestamp;
    }
    const elapsed = timestamp - this.prev;
    if (1000/this.nps < timestamp - this.lastNoteTime) {
      this.drawNote(this.tickContext, this.stave, this.context);
      this.lastNoteTime = timestamp;
    }

    this.notes.forEach((n) => {
      n.setX(n.x - elapsed * this.speed * SPEED_FACTOR);
      if (n.x <= 0 && !n.removed) {
        n.removed = true;
        n.remove();
        this.progress++;
      }
      n.updatePosition();
    });



    this.prev = timestamp;
    window.requestAnimationFrame(this.boundUpdate);
  }
}
