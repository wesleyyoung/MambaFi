import { Component, OnInit } from '@angular/core';

export interface ToolCard {
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public cards: ToolCard[] = [{
    title: 'WLAN Profile Manager',
    subtitle: 'View passwords, import, export, edit, and delete wireless network profiles'
  // }, {
  //   title: 'Wired Profile Manager',
  //   subtitle: 'Manage wired network connection profiles'
  // }, {
  //   title: 'DNS Cache Entries',
  //   subtitle: 'Manage cached hostnames from websites visted on your computer'
  // }, {
  //   title: 'Network Driver Information',
  //   subtitle: 'View network hardware information'
  }];

  constructor() { }

  ngOnInit() {
  }

}
