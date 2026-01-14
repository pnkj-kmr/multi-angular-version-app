import { Routes } from "@angular/router";
import { LoginPage } from "./pages/login/login.page";
import { SignupPage } from "./pages/signup/signup.page";

export const routes: Routes = [
  { path: "", redirectTo: "/auth/login", pathMatch: "full" },
  { path: "auth/login", component: LoginPage },
  { path: "auth/signup", component: SignupPage },
  { path: "**", redirectTo: "/auth/login" },
];
