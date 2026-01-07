import "zone.js";
import { createCustomElement } from "@angular/elements";
import { createApplication } from "@angular/platform-browser";
import { provideHttpClient } from "@angular/common/http";
import { provideRouter } from "@angular/router";
import { LoginWebComponent } from "./login.component";

// Bootstrap the Angular application and create the custom element
createApplication({
  providers: [
    provideHttpClient(),
    // Provide Router (even though LoginPage in web component uses a mock Router)
    // This is needed for Angular to initialize properly
    provideRouter([]),
  ],
})
  .then((appRef) => {
    console.log("✅ Angular application created");
    console.log("Application injector:", appRef.injector);

    try {
      // Create the custom element from the Angular component
      // Note: Angular Elements uses Shadow DOM by default
      // Styles should be automatically included in the component
      const loginElement = createCustomElement(LoginWebComponent, {
        injector: appRef.injector,
      });

      console.log("✅ Custom element created:", loginElement);

      // Define the custom element
      customElements.define("login-web-component", loginElement);

      console.log("✅ Login web component registered successfully!");

      // Debug: Log when component is defined
      if (customElements.get("login-web-component")) {
        console.log("✅ Custom element is defined and ready to use");
      }

      // Test: Try to create an instance programmatically
      setTimeout(() => {
        try {
          const testElement = document.createElement("login-web-component");
          console.log("✅ Test element created:", testElement);
          console.log(
            "Test element constructor:",
            testElement.constructor.name
          );
        } catch (testErr) {
          console.error("❌ Error creating test element:", testErr);
        }
      }, 100);
    } catch (createErr) {
      console.error("❌ Error creating custom element:", createErr);
      console.error("Error details:", createErr);
      throw createErr;
    }
  })
  .catch((err) => {
    console.error("❌ Error creating login web component:", err);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    console.error("Full error:", err);
  });
