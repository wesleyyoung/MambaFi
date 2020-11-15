import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'MambaFi';

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) { }

  refresh() {
    this.api.refreshProfiles();
  }

  ngOnInit() {
    setInterval(() => {
      this.cdr.detectChanges();
    }, 800);
  }
}
