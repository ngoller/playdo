import Vex from "vexflow";

export class DisplayNote {
  noteValue: number;
  staveNote: Vex.Flow.StaveNote;
  removed: boolean = false;
  x: number = 0;
  y: number = 0;
  color: string = 'black';

  constructor(staveNote: Vex.Flow.StaveNote) {
    this.staveNote = staveNote;
    this.noteValue = DisplayNote.calcNoteValue(this.staveNote.getKeys()[0]);
  }

  setX(x: number) {
    this.x = x;
  }

  updatePosition() {
    if (this.el()) {
      this.el().transform.baseVal.getItem(0).setTranslate(this.x, this.y);
    }
  }

  updateColor() {
    this.el().querySelectorAll('path').forEach((el) => {
      el.setAttribute('fill', this.color);
      el.setAttribute('stroke', this.color);
    })
  }

  el(): any {
    // we use the parent because there could be additional elements that we want to also translate like a bar (when below or above the stave)
    return (this.staveNote as any).attrs.el.parentElement;
  }

  /**
   * Converts from string note form to note number (e.g. 'c/3' to 60).
   * MIDI input is note numbers.
   * Vex Flow uses string note form.
   */
  static calcNoteValue(note: string): number {
    const noteName = note.substring(0, note.length - 2);
    const octave = Number(note[note.length - 1]) + 1;
    // get note value and move it based on octave
    const music = new Vex.Flow.Music();
    const absoluteNote = music.getNoteValue(noteName) + octave * Vex.Flow.Music.NUM_TONES;

    return absoluteNote;
  }

  remove() {
    this.el().remove();
    this.removed = true;
  }

  succeed() {
    this.color = 'green';
    this.updateColor();
    this.removed = true;
    setTimeout(() => this.remove(), 100);
  }

  fail() {
    this.color = 'red';
    this.updateColor();
    this.removed = true;
    setTimeout(() => this.remove(), 100);
  }
}