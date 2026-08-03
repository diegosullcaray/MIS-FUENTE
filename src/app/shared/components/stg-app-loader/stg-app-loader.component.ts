import { Component, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
    selector: 'stg-app-loader',
    templateUrl: './stg-app-loader.component.html',
    styleUrls: ['./stg-app-loader.component.scss']
})
export class StgAppLoaderComponent implements OnInit {
    title;
    message;
    constructor(public dialogRef: MatDialogRef<StgAppLoaderComponent>) { }

    ngOnInit() {
    }

}