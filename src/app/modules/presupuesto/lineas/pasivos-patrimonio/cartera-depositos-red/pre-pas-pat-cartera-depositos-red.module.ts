import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "app/shared/shared.module";
import { MaterialModule } from 'app/material/material.module';
import { PrePasPatCarteraDepositosRedRoutingModule } from "./pre-pas-pat-cartera-depositos-red-routing.module";
import { PrePasPatCarteraDepositosRedComponent } from "./pre-pas-pat-cartera-depositos-red.component";

@NgModule({
    imports:[
        PrePasPatCarteraDepositosRedRoutingModule,
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        MaterialModule,
        SharedModule,
    ],
    declarations:[PrePasPatCarteraDepositosRedComponent]
})
export class PrePasPatCarteraDepositosRedModule{}