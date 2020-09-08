import { Component, OnInit } from '@angular/core';
import Vex from "vexflow";
import { interval } from 'rxjs';
import { MidiService } from '../midi.service';
import { DisplayNote } from '../../display-note'

@Component({
  selector: 'note-panel',
  templateUrl: './note-panel.component.html',
  styleUrls: ['./note-panel.component.sass']
})
export class NotePanelComponent implements OnInit {
  notes: DisplayNote[] = [];
  start: DOMHighResTimeStamp;
  prev: DOMHighResTimeStamp;
  boundUpdate: () => void;

  constructor(private midi: MidiService) {
    this.boundUpdate = this.update.bind(this);
  }

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

    window.requestAnimationFrame(this.boundUpdate);
    this.midi.noteEmitter.subscribe((note: number) => {
      // if there is active note... check to see if they played the right note
      // if ('a' === note) {
      // setStyle({fillStyle: 'green', strokeStyle: 'green'});
      // } else {
      // setStyle({fillStyle: 'red', strokeStyle: 'red'});
      // }
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

    dn.setX(400);

    c.closeGroup();
    const box = (group as any).getBoundingClientRect();
  }

  update(timestamp) {
    const speed = 1;
    const SPEED_FACTOR = .1;
    if (this.start === undefined) {
      this.start = timestamp;
      this.prev = timestamp;
    }

    const elapsed = timestamp - this.prev;
    this.notes.forEach((n) => {
      n.setX(n.x - elapsed * speed * SPEED_FACTOR);
      if (n.x <= 0) {
        n.remove();
      }
      n.updatePosition();
    });
    this.prev = timestamp;
    window.requestAnimationFrame(this.boundUpdate);
  }
}
