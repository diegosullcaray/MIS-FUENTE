import { Component, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
    selector: 'app-ad',
    templateUrl: './ad-dialog.component.html',
    styleUrls: ['./ad-dialog.component.scss']
})
export class AdDialogComponent implements OnInit {
    constructor(public dialogRef: MatDialogRef<AdDialogComponent>) { }

    ngOnInit() {
    }

    goToLink(url: string) {
        window.open(url, "_blank");
    }
}