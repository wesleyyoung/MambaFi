import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-add-profile',
  templateUrl: './add-profile.component.html',
  styleUrls: ['./add-profile.component.scss']
})
export class AddProfileComponent implements OnInit {

  public newProfile: File | null;

  constructor(
    public dialogRef: MatDialogRef<AddProfileComponent>
  ) { }

  uploadFile() {
    this.newProfile;
  }

  ngOnInit() {
  }

}
