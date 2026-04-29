import { Component } from "@angular/core";

import { OrreryComponent } from "./orrery.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [OrreryComponent],
  template: `
    <main class="app-shell">
      <header class="toolbar">
        <button type="button" class="ping-button" (click)="toggleSunZ()">
          {{ sunOffsetApplied ? "Move Sun -10Z" : "Move Sun +10Z" }}
        </button>
      </header>

      <section class="scene-host">
        <app-orrery [sceneBaseUrl]="sceneBaseUrl"></app-orrery>
      </section>
    </main>
  `,
})
export class AppComponent {
  public sceneBaseUrl = "/scene/";
  public sunOffsetApplied = false;

  public toggleSunZ(): void {
    this.sunOffsetApplied = !this.sunOffsetApplied;

    window.dispatchEvent(
      new CustomEvent("scene:toggle-sun-z", {
        detail: {
          offsetApplied: this.sunOffsetApplied,
          delta: 10,
        },
      })
    );
  }
}
