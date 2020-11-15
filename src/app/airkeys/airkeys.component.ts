import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from '@angular/core';
import { MatSort, MatTableDataSource, MatPaginator } from '@angular/material';
import { ApiService} from '../api.service';
import { SelectionModel } from '@angular/cdk/collections';
import {WifiProfile} from '../interfaces/wifi-profile';

@Component({
  selector: 'app-airkeys',
  templateUrl: './airkeys.component.html',
  styleUrls: ['./airkeys.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AirkeysComponent implements OnInit {

  displayCols: string[] = ['select', 'ssid', 'key', 'authentication', 'encryption', 'connectionMode', 'oneX', 'macRandom'];
  profiles: WifiProfile[] = [];
  profilesInfo = new MatTableDataSource(this.profiles);
  selection = new SelectionModel<WifiProfile>(true, []);

  @ViewChild(MatSort, {
    static: true
  }) sort: MatSort;

  @ViewChild(MatPaginator, {
    static: true
  }) paginator: MatPaginator;

  @ViewChild('profilesList', {
    static: true
  }) profilesList: ElementRef;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) { }

  refresh() {
    this.api.refreshProfiles();
  }

  applyFilter(filterValue: string) {
    this.profilesInfo.filter = filterValue.trim().toLowerCase();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.profilesInfo.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.profilesInfo.data.forEach(row => this.selection.select(row));
  }

  toggleRow(row: WifiProfile) {
    setTimeout(() => { this.cdr.detectChanges(); }, 200);
    return this.selection.toggle(row);
  }

  checkboxLabel(index?: number, row?: WifiProfile): string {
    if (!row && !index) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${index + 1}`;
  }

  openFile() {
    this.api.openFile();
  }

  exportAllProfiles() {
    this.api.exportAllProfiles();
  }

  addAllFromFolder() {
    this.api.addAllFromFolder();
  }

  deleteSelected() {
    this.api.deleteProfiles(this.selection.selected);
  }

  exportSelected() {
    this.api.exportProfiles(this.selection.selected);
  }

  ngOnInit() {
    this.profilesInfo.sort = this.sort;
    this.profilesInfo.paginator = this.paginator;

    this.api.profiles.subscribe(profiles => {
      this.profilesInfo.data = profiles;
      this.selection = new SelectionModel<WifiProfile>(true, []);
      this.selection.clear();
      this.cdr.detectChanges();
      this.profilesList.nativeElement.focus();
    });

    this.refresh();
  }
}
