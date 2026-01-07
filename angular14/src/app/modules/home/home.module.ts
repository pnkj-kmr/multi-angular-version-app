import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { HomeComponent } from "../../pages/home/home.component";
import { UserListComponent } from "../../components/user-list/user-list.component";
import { UserFormComponent } from "../../components/user-form/user-form.component";
import { HomeRoutingModule } from "./home-routing.module";

@NgModule({
  declarations: [HomeComponent, UserListComponent, UserFormComponent],
  imports: [CommonModule, FormsModule, RouterModule, HomeRoutingModule],
})
export class HomeModule {}
