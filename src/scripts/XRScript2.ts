import { Scene } from "@babylonjs/core";
import { EngineStore } from "@babylonjs/core/Engines/engineStore";
import { Observer } from "@babylonjs/core/Misc/observable";
import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience";
import { WebXRState } from "@babylonjs/core/XR/webXRTypes";

export default class XRScript2 {
  private static readonly XR_WORLD_SCALE = 100;

  public constructor(public attachedObject: unknown) {}

  private _manualEnterXrButton: HTMLButtonElement | null = null;
  private _xrExperience: Awaited<ReturnType<typeof WebXRDefaultExperience.CreateAsync>> | null = null;
  private _xrStateObserver: Observer<WebXRState> | null = null;

  public onStop(): void {
    if (this._manualEnterXrButton) {
      this._manualEnterXrButton.onclick = null;
    }
    document.getElementById("xr-diagnostics-overlay")?.remove();
    document.getElementById("xr-manual-enter-button")?.remove();
    this._manualEnterXrButton = null;

    void this._disposeXRExperience();
  }

  public async onStart(): Promise<void> {
    this._ensureManualEnterXRButton();

    const diagnostics = await this._collectXRDiagnostics();
    this._showDiagnosticsOverlay(diagnostics);

    const scene = this._resolveScene();
    if (!scene) {
      this._setManualButtonState("XR Failed", true);
      diagnostics.push("XR init: failed");
      diagnostics.push("XR init reason: could not resolve Babylon Scene from script context");
      this._showDiagnosticsOverlay(diagnostics);
      return;
    }

    console.log("XR diagnostics", diagnostics);
    const xr = navigator.xr;
    if (!xr) {
      this._setManualButtonState("XR Unavailable", true);
      diagnostics.push("XR init: skipped (navigator.xr unavailable)");
      this._showDiagnosticsOverlay(diagnostics);
      return;
    }

    const vrSupported = await xr.isSessionSupported("immersive-vr");
    if (!vrSupported) {
      this._setManualButtonState("VR Unsupported", true);
      diagnostics.push("XR init: skipped (immersive-vr unsupported)");
      this._showDiagnosticsOverlay(diagnostics);
      return;
    }

    try {
      const xrExperience = await WebXRDefaultExperience.CreateAsync(scene);
      xrExperience.baseExperience.sessionManager.worldScalingFactor = XRScript2.XR_WORLD_SCALE;
      this._xrExperience = xrExperience;

      this._ensureManualEnterXRButton(xrExperience);
      diagnostics.push(`XR world scale: ${XRScript2.XR_WORLD_SCALE} scene units per meter`);
      diagnostics.push("XR init: success");
      this._showDiagnosticsOverlay(diagnostics);
    } catch (error) {
      this._setManualButtonState("XR Failed", true);
      diagnostics.push("XR init: failed");
      diagnostics.push(`XR init reason: ${String(error)}`);
      this._showDiagnosticsOverlay(diagnostics);
    }
  }

  private async _collectXRDiagnostics(): Promise<string[]> {
    const lines: string[] = [];
    lines.push(`Time: ${new Date().toLocaleTimeString()}`);
    lines.push(`URL: ${window.location.href}`);
    lines.push(`Protocol: ${window.location.protocol}`);
    lines.push(`Hostname: ${window.location.hostname}`);
    lines.push(`Secure context: ${window.isSecureContext ? "yes" : "no"}`);
    lines.push(`User agent: ${navigator.userAgent}`);

    const xr = navigator.xr;
    if (!xr) {
      lines.push("navigator.xr: not available");
      lines.push("Enter XR button hidden: WebXR API unavailable in this browser/runtime");
      return lines;
    }

    lines.push("navigator.xr: available");

    try {
      const vrSupported = await xr.isSessionSupported("immersive-vr");
      const arSupported = await xr.isSessionSupported("immersive-ar");

      lines.push(`immersive-vr supported: ${vrSupported ? "yes" : "no"}`);
      lines.push(`immersive-ar supported: ${arSupported ? "yes" : "no"}`);

      if (!vrSupported && !arSupported) {
        lines.push("Enter XR button hidden: no immersive XR session type is supported");
      } else {
        lines.push("An Enter XR button should be available when Babylon XR UI initializes");
      }
    } catch (error) {
      lines.push("Could not query XR session support");
      lines.push(`Reason: ${String(error)}`);
    }

    return lines;
  }

  private _showDiagnosticsOverlay(lines: string[]): void {
    const existing = document.getElementById("xr-diagnostics-overlay");
    existing?.remove();

    const overlay = document.createElement("div");
    overlay.id = "xr-diagnostics-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "12px";
    overlay.style.left = "12px";
    overlay.style.zIndex = "9999";
    overlay.style.maxWidth = "420px";
    overlay.style.padding = "10px 12px";
    overlay.style.borderRadius = "8px";
    overlay.style.background = "rgba(0, 0, 0, 0.8)";
    overlay.style.color = "#f4f4f4";
    overlay.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    overlay.style.fontSize = "12px";
    overlay.style.lineHeight = "1.45";
    overlay.style.whiteSpace = "pre-line";
    overlay.style.pointerEvents = "none";
    overlay.textContent = ["XR diagnostics", ...lines].join("\n");

    document.body.appendChild(overlay);
  }

  private _ensureManualEnterXRButton(xr?: Awaited<ReturnType<typeof WebXRDefaultExperience.CreateAsync>>): void {
    if (!this._manualEnterXrButton) {
      const button = document.createElement("button");
      button.id = "xr-manual-enter-button";
      button.textContent = "Enter VR";
      button.style.position = "fixed";
      button.style.right = "16px";
      button.style.bottom = "16px";
      button.style.zIndex = "10000";
      button.style.padding = "10px 14px";
      button.style.border = "1px solid rgba(255, 255, 255, 0.35)";
      button.style.borderRadius = "10px";
      button.style.background = "rgba(15, 23, 42, 0.85)";
      button.style.color = "#ffffff";
      button.style.fontFamily = "ui-sans-serif, system-ui, sans-serif";
      button.style.fontSize = "14px";
      button.style.cursor = "pointer";
      button.style.pointerEvents = "auto";
      button.disabled = true;
      button.style.opacity = "0.7";
      document.body.appendChild(button);
      this._manualEnterXrButton = button;
    }

    if (!xr || !this._manualEnterXrButton) {
      return;
    }

    this._setManualButtonState("Enter VR", false);
    this._manualEnterXrButton.onclick = async () => {
      try {
        await xr.baseExperience.enterXRAsync("immersive-vr", "local-floor");
      } catch (error) {
        const existing = document.getElementById("xr-diagnostics-overlay");
        const current = existing?.textContent ?? "XR diagnostics";
        this._showDiagnosticsOverlay([...current.split("\n"), `Enter VR failed: ${String(error)}`]);
      }
    };

    if (this._xrStateObserver) {
      xr.baseExperience.onStateChangedObservable.remove(this._xrStateObserver);
    }

    this._xrStateObserver = xr.baseExperience.onStateChangedObservable.add((state) => {
      if (state === WebXRState.IN_XR) {
        this._setManualButtonState("In VR", true);
      } else {
        this._setManualButtonState("Enter VR", false);
      }
    });
  }

  private async _disposeXRExperience(): Promise<void> {
    const xrExperience = this._xrExperience;
    if (!xrExperience) {
      return;
    }

    if (this._xrStateObserver) {
      xrExperience.baseExperience.onStateChangedObservable.remove(this._xrStateObserver);
      this._xrStateObserver = null;
    }

    try {
      if (xrExperience.baseExperience.state === WebXRState.IN_XR) {
        await xrExperience.baseExperience.exitXRAsync();
      }
    } catch {
      // Best-effort exit. Disposing the experience still removes the XR UI.
    }

    xrExperience.dispose();
    this._xrExperience = null;
  }

  private _setManualButtonState(label: string, disabled: boolean): void {
    if (!this._manualEnterXrButton) {
      return;
    }

    this._manualEnterXrButton.textContent = label;
    this._manualEnterXrButton.disabled = disabled;
    this._manualEnterXrButton.style.opacity = disabled ? "0.7" : "1";
  }

  private _resolveScene(): Scene | null {
    const candidate = this.attachedObject as { getScene?: () => unknown } | null;

    if (this._isScene(candidate)) {
      return candidate;
    }

    if (candidate && typeof candidate.getScene === "function") {
      const fromGetScene = candidate.getScene();
      if (this._isScene(fromGetScene)) {
        return fromGetScene;
      }
    }

    const lastScene = EngineStore.LastCreatedScene;
    if (this._isScene(lastScene)) {
      return lastScene;
    }

    return null;
  }

  private _isScene(value: unknown): value is Scene {
    const sceneLike = value as {
      getUniqueId?: unknown;
      getEngine?: unknown;
      getMeshById?: unknown;
    } | null;

    return !!sceneLike &&
      typeof sceneLike.getUniqueId === "function" &&
      typeof sceneLike.getEngine === "function" &&
      typeof sceneLike.getMeshById === "function";
  }
}
