import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParticipantePage } from './participante.page';

describe('ParticipantePage', () => {
  let component: ParticipantePage;
  let fixture: ComponentFixture<ParticipantePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
