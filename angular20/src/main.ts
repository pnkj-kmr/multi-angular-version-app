import "zone.js";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { AppComponent } from "./app/app.component";
import { routes } from "./app/app.routes";
import { APP_BASE_HREF } from "@angular/common";
import { environment } from "./environments/environment";

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    provideAnimations(),
    { provide: APP_BASE_HREF, useValue: environment.buildBaseUrl },
  ],
}).catch((err) => console.error(err));
