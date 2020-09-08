import { DisplayNote } from "./display-note";

export class Sheet {
  context: Vex.IRenderContext;
  stave: Vex.Flow.Stave;
  width = 600;
  height = 100;
  drawnNotes: DisplayNote[] = [];
  removePoint: 100;
  selector = '';
  speed = 0;

  constructor() {
    // const sheet_elem = $('#'+this.selector);

    const renderer = new Vex.Flow.Renderer(document.querySelector('selector'), Vex.Flow.Renderer.Backends.SVG);

    // Configure the rendering context.
    renderer.resize(this.width, this.height);
    this.context = renderer.getContext();
    // this.context.setFont("Arial", 10).setBackgroundFillStyle("#eed");

    // Create a stave of width this.width at position 0, 0 on the canvas.
    this.stave = new Vex.Flow.Stave(0, 0, this.width);

    // Add a clef and time signature.
    this.stave.addClef("treble").addTimeSignature("4/4");

    // Connect it to the rendering context and draw!
    this.stave.setContext(this.context).draw();

    // sheet_elem.find('svg')[0].setAttribute('width', '100%');
    // sheet_elem.find('svg')[0].setAttribute('viewBox', '0 0 ' + this.width + ' ' + this.height);
  }

  addNote() {
    
  }
}
window.requestAnimationFrame(this.step.bind(this));

