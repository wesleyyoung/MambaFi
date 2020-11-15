import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-waiting-dialog',
  templateUrl: 'waiting-dialog.component.html',
})
export class WaitingDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<WaitingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  onNoClick(): void {
  }

}
