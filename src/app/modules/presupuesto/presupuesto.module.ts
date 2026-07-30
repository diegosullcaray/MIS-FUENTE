import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from "@angular/forms";
import { ModAppService } from "app/core/data/remote/instances/mod-app-service";
import { SharedModule } from "app/shared/shared.module";
import { MaterialModule } from 'app/material/material.module';
import { ModBudgetService } from "./compartido/servicios/mod-budget.service";
import { PresupuestoRoutingModule } from "./presupuesto-routing.module";
import { PresupuestoComponent } from "./presupuesto.component";

@NgModule({
    imports:[
        PresupuestoRoutingModule,
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        MaterialModule,
        SharedModule,
    ],
    declarations:[PresupuestoComponent],
    providers:[ModAppService,ModBudgetService]
})
export class PresupuestoModule{}