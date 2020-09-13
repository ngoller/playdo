import { Component, OnInit, HostListener } from '@angular/core';
import Vex from "vexflow";
import { Observable } from 'rxjs';
import { MidiService } from '../midi.service';
import { DisplayNote } from '../../display-note'

const SPEED_FACTOR: number = .1;

@Component({
  selector: 'note-panel',
  templateUrl: './note-panel.component.html',
  styleUrls: ['./note-panel.component.sass']
})
export class NotePanelComponent implements OnInit {
  boundUpdate: () => void;
  context: Vex.IRenderContext;
  tickContext: Vex.Flow.TickContext;
  stave: Vex.Flow.Stave;
  
  // state
  notes: DisplayNote[] = [];
  start: DOMHighResTimeStamp;
  prev: DOMHighResTimeStamp;
  lastNoteTime: DOMHighResTimeStamp = performance.now();
  progress: number = 0;
  fail: number = 0;
  success: number = 0;

  // settings
  clef: string =  'treble';
  speed: number = 1;
  nps: number = 1;

  constructor(private midi: MidiService) {
    this.boundUpdate = this.update.bind(this);
  }

  ngOnInit(): void {
    this.setupClef();

    this.midi.noteEmitter.subscribe((note: number) => {
      const currentNote = this.notes[this.fail + this.success];
      if (currentNote && note === currentNote.noteValue) {
        currentNote.succeed();
        this.success++;
      } else if (currentNote) {
        currentNote.fail();
        this.fail++;
      }
    });

   window.requestAnimationFrame(this.boundUpdate);

  }

  setupClef(): void {
    const VF = Vex.Flow;
    const div = document.getElementById('vex-target')
    const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    renderer.resize(1400, 500);
    this.context = renderer.getContext()
    this.context.scale(3, 3);
    const width = 1212;
    this.stave = new VF.Stave(10, 10, width/3).addClef(this.clef);
    this.stave.setContext(this.context).draw();
    this.tickContext = new VF.TickContext();
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const currentNote = this.notes[this.fail + this.success];
    if (event.key === "d") {
      currentNote.fail();
      this.fail++;
    } else {
      currentNote.succeed();
      this.success++;
    }
  }

  getRandomNote(): Vex.Flow.StaveNote {
    const durations = ['8', '4', '2', '1'];
    let letter = String.fromCharCode('a'.charCodeAt(0) + Math.floor(Math.random() * 7))
    let octave = `${4 + Math.floor(Math.random() * 1)}`
    let acc = 'b';
    const note = new Vex.Flow.StaveNote({
      clef: this.clef,
      keys: [`${letter}${acc}/${octave}`],
      duration: '4',
    })
   
    note.addAccidental(0, new Vex.Flow.Accidental('b'));

    return note;
  }

  drawNote(tc: Vex.Flow.TickContext, s: Vex.Flow.Stave, c: Vex.IRenderContext): void {
    const group = c.openGroup(); // create an SVG group element
    const note = this.getRandomNote();

    const voice = new Vex.Flow.Voice({num_beats: 1,  beat_value: 4});
    voice.addTickables([note]);
    const formatter = new Vex.Flow.Formatter().joinVoices([voice]).format([voice], 1400);
    voice.draw(this.context, this.stave);

    const dn = new DisplayNote(note);
    this.notes.push(dn);

    // add initial transform
    const t = document.getElementsByTagName("svg")[0].createSVGTransform();
    dn.el().transform.baseVal.appendItem(t);

    dn.setX(this.stave.getWidth() - 50);

    c.closeGroup();

    const box = (group as any).getBoundingClientRect();
  }

  update(timestamp) {
    if (this.start === undefined) {
      this.start = timestamp;
      this.prev = timestamp;
    }
    const elapsed = timestamp - this.prev;
    if (1000 / this.nps < timestamp - this.lastNoteTime && this.progress < 100) {
      this.drawNote(this.tickContext, this.stave, this.context);
      this.lastNoteTime = timestamp;
      this.progress++;
    }

    this.notes.forEach((n) => {
      n.setX(n.x - elapsed * this.speed * SPEED_FACTOR);
      if (n.x <= 0 && !n.removed) {
        n.removed = true;
        this.fail++;
        n.remove();
      }
      n.updatePosition();
    });



    this.prev = timestamp;
    window.requestAnimationFrame(this.boundUpdate);
  }
}
