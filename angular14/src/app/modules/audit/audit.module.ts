import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { AuditComponent } from "../../pages/audit/audit.component";
import { AuditRoutingModule } from "./audit-routing.module";

@NgModule({
  declarations: [AuditComponent],
  imports: [CommonModule, FormsModule, RouterModule, AuditRoutingModule],
})
export class AuditModule {}
