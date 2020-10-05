import { Component, OnInit, HostListener } from '@angular/core';

import Vex from "vexflow";
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
  renderer: Vex.Flow.Renderer;
  clefs: string[] = [
    'alto', 'bass', 'treble'
  ]

  // state
  notes: DisplayNote[] = [];
  start: DOMHighResTimeStamp;
  prev: DOMHighResTimeStamp;
  lastNoteTime: DOMHighResTimeStamp = performance.now();
  progress: number = 0;
  fail: number = 0;
  success: number = 0;
  currentNoteIndex: number = 0;

  // settings
  clef: string =  'treble';
  speed: number = 1;
  nps: number = 1;
  sharps: boolean = false;
  flats: boolean = false;
  minOctave: number = 4;
  maxOctave: number = 4;

  constructor(private midi: MidiService) {
    this.boundUpdate = this.update.bind(this);
  }

  ngOnInit(): void {
    const VF = Vex.Flow;
    const div = document.getElementById('vex-target')
    this.renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    this.renderer.resize(1400, 500);

    this.reset()
    
    this.midi.noteEmitter.subscribe((note: number) => {
      const currentNote = this.notes[this.currentNoteIndex];
      if (currentNote && note === currentNote.noteValue) {
        currentNote.succeed();
        this.success++;
        this.currentNoteIndex++;
      } else if (currentNote) {
        currentNote.fail();
        this.fail++;
      }
    });

   window.requestAnimationFrame(this.boundUpdate);
  }

  reset(): void {
    this.setupContext();
    this.currentNoteIndex = 0;
    this.fail = 0;
    this.success = 0;
    this.notes = [];
    this.start = undefined;
    this.prev = undefined;
    this.lastNoteTime = performance.now();
    this.progress = 0;
  }

  setupContext(): void {
    this.context = this.renderer.getContext();
    this.context.clear();
    this.context.scale(3, 3);
    const width = 1212;
    this.stave = new Vex.Flow.Stave(10, 10, width/3).addClef(this.clef);
    this.stave.setContext(this.context).draw();
    this.tickContext = new Vex.Flow.TickContext();
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const currentNote = this.notes[this.currentNoteIndex];
    if (event.key === "d") {
      currentNote.fail();
      this.fail++;
    } else {
      currentNote.succeed();
      this.success++;
      this.currentNoteIndex++;
    }
  }

  getRandomNote(): Vex.Flow.StaveNote {
    // const durations = ['8', '4', '2', '1'];
    const letter = String.fromCharCode('a'.charCodeAt(0) + Math.floor(Math.random() * 7))
    const diff =  this.maxOctave - this.minOctave + 1;
    const octave = `${this.minOctave + Math.floor(Math.random() * diff)}`
    const accidentals = [''];
    if (this.flats) { accidentals.push('b'); }
    if (this.sharps) { accidentals.push('#'); }
    const acc = accidentals[Math.floor(Math.random()*accidentals.length)];
    const note = new Vex.Flow.StaveNote({
      clef: this.clef,
      keys: [`${letter}${acc}/${octave}`],
      duration: '4',
      auto_stem: true,
    })
   
    if (acc) note.addAccidental(0, new Vex.Flow.Accidental(acc));

    return note;
  }

  drawNote(c: Vex.IRenderContext): void {
    const group = c.openGroup(); // create an SVG group element
    const note = this.getRandomNote();
    const voice = new Vex.Flow.Voice({num_beats: 1,  beat_value: 4});
    voice.addTickables([note]);
    const formatter = new Vex.Flow.Formatter().joinVoices([voice]).format([voice], 2000);
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
      this.drawNote(this.context);
      this.lastNoteTime = timestamp;
      this.progress++;
    }

    this.notes.forEach((n) => {
      n.setX(n.x - elapsed * this.speed * SPEED_FACTOR);
      if (n.x <= 0 && !n.removed) {
        n.removed = true;
        if (!n.succeeded) {
          this.currentNoteIndex++;
        }
        if (!n.failed && !n.succeeded) {
          n.fail();
          this.fail++;
        }
        setTimeout(() => n.remove(), 100);
      }
      n.updatePosition();
    });

    this.prev = timestamp;
    window.requestAnimationFrame(this.boundUpdate);
  }
}
