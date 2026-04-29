/**
 * Standalone Angular component that hosts the Babylon.js Orrery scene.
 *
 * Drop this file (and its sibling scripts/) into your Angular project,
 * then follow the "Angular setup" comment below for peer dependencies.
 *
 * Angular setup (in your Angular project):
 *   npm install @babylonjs/core @babylonjs/materials @babylonjs/havok babylonjs-editor-tools
 *
 * Usage in a template:
 *   <app-orrery sceneBaseUrl="/assets/orrery-scene/" />
 *
 * Copy the contents of public/scene/ to src/assets/orrery-scene/ in your Angular project,
 * then pass the correct base URL via the [sceneBaseUrl] input.
 */

import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
} from "@angular/core";

import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { SceneLoaderFlags } from "@babylonjs/core/Loading/sceneLoaderFlags";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";

import HavokPhysics from "@babylonjs/havok";

import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/core/Loading/Plugins/babylonFileLoader";
import "@babylonjs/core/Cameras/universalCamera";
import "@babylonjs/core/Meshes/groundMesh";
import "@babylonjs/core/Lights/directionalLight";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import "@babylonjs/core/Materials/PBR/pbrMaterial";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/XR/features/WebXRDepthSensing";
import "@babylonjs/core/XR/webXRDefaultExperience";
import "@babylonjs/core/XR/webXREnterExitUI";
import "@babylonjs/core/Rendering/depthRendererSceneComponent";
import "@babylonjs/core/Rendering/prePassRendererSceneComponent";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";
import "@babylonjs/core/Shaders/pbr.vertex";
import "@babylonjs/core/Shaders/pbr.fragment";
import "@babylonjs/core/Shaders/postprocess.vertex";
import "@babylonjs/core/Shaders/rgbdDecode.fragment";
import "@babylonjs/core/Shaders/shadowMap.vertex";
import "@babylonjs/core/Shaders/shadowMap.fragment";
import "@babylonjs/core/Physics";
import "@babylonjs/materials/sky";

import { loadScene } from "babylonjs-editor-tools";
import { scriptsMap } from "./scripts";

@Component({
  selector: "app-orrery",
  standalone: true,
  template: `<canvas #canvas class="orrery-canvas"></canvas>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      .orrery-canvas {
        width: 100%;
        height: 100%;
        outline: none;
        user-select: none;
        touch-action: none;
      }
    `,
  ],
})
export class OrreryComponent implements AfterViewInit, OnDestroy {
  /** Base URL for the Babylon scene assets, e.g. "/assets/orrery-scene/" */
  @Input() sceneBaseUrl = "/assets/orrery-scene/";

  @ViewChild("canvas", { static: true })
  private _canvasRef!: ElementRef<HTMLCanvasElement>;

  private _engine: Engine | null = null;
  private _scene: Scene | null = null;
  private _resizeObserver: ResizeObserver | null = null;

  constructor(private _ngZone: NgZone) {}

  ngAfterViewInit(): void {
    // Run Babylon outside Angular's change detection to avoid excessive CD cycles.
    this._ngZone.runOutsideAngular(() => {
      void this._init();
    });
  }

  ngOnDestroy(): void {
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    this._scene?.dispose();
    this._engine?.dispose();
    this._scene = null;
    this._engine = null;
  }

  private async _init(): Promise<void> {
    const canvas = this._canvasRef.nativeElement;

    this._engine = new Engine(canvas, true, {
      stencil: true,
      antialias: true,
      audioEngine: true,
      adaptToDeviceRatio: true,
      disableWebGL2Support: false,
      useHighPrecisionFloats: true,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: false,
    });

    this._scene = new Scene(this._engine);

    await this._loadScene();

    // Use ResizeObserver instead of window resize so the canvas tracks its
    // host element rather than the full viewport.
    this._resizeObserver = new ResizeObserver(() => {
      this._engine?.resize();
    });
    this._resizeObserver.observe(canvas.parentElement ?? canvas);

    this._engine.runRenderLoop(() => {
      this._scene?.render();
    });
  }

  private async _loadScene(): Promise<void> {
    if (!this._engine || !this._scene) {
      return;
    }

    try {
      const havok = await HavokPhysics();
      this._scene.enablePhysics(
        new Vector3(0, -981, 0),
        new HavokPlugin(true, havok)
      );
    } catch (e) {
      console.warn("Havok physics failed to load, continuing without physics:", e);
    }

    SceneLoaderFlags.ForceFullSceneLoadingForIncremental = true;
    await loadScene(this.sceneBaseUrl, "example.babylon.txt", this._scene, scriptsMap, {
      quality: "high",
    });

    if (this._scene.activeCamera) {
      this._scene.activeCamera.attachControl();
    }
  }
}
