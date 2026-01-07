import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { LoginComponent } from "../../components/login/login.component";
import { SignupComponent } from "../../components/signup/signup.component";
import { AuthRoutingModule } from "./auth-routing.module";

@NgModule({
  declarations: [LoginComponent, SignupComponent],
  imports: [CommonModule, FormsModule, RouterModule, AuthRoutingModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Allow custom elements (web components)
})
export class AuthModule {}
