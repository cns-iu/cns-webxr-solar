import "zone.js";
import "@angular/compiler";
import "./style.css";

import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app.component";

const globalWindow = window as Window & {
  __appBootstrapPromise?: Promise<unknown>;
};

globalWindow.__appBootstrapPromise = bootstrapApplication(AppComponent).catch((error) => {
  console.error("Angular bootstrap failed", error);
  throw error;
});
