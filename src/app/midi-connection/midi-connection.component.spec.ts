import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MidiConnectionComponent } from './midi-connection.component';

describe('MidiConnectionComponent', () => {
  let component: MidiConnectionComponent;
  let fixture: ComponentFixture<MidiConnectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MidiConnectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MidiConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
