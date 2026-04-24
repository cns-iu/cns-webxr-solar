var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../../../Documents/GitHub/cns-webxr-solar/src/scripts/XRScript2.ts
var XRScript2_exports = {};
__export(XRScript2_exports, {
  default: () => XRScript
});
module.exports = __toCommonJS(XRScript2_exports);
var XRScript = class {
  static {
    __name(this, "XRScript");
  }
  scene;
  async onStart() {
    const diagnostics = await this._collectXRDiagnostics();
    this._showDiagnosticsOverlay(diagnostics);
    console.log("XR diagnostics", diagnostics);
    await this.scene.createDefaultXRExperienceAsync();
  }
  async _collectXRDiagnostics() {
    const lines = [];
    lines.push(`Secure context: ${window.isSecureContext ? "yes" : "no"}`);
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
  _showDiagnosticsOverlay(lines) {
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
};
