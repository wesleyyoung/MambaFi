import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirkeysComponent } from './airkeys.component';

describe('AirkeysComponent', () => {
  let component: AirkeysComponent;
  let fixture: ComponentFixture<AirkeysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirkeysComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirkeysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
