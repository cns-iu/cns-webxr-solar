import { Scene } from "@babylonjs/core";

export default class XRScript2 {
  public scene!: Scene;

  public async start(): Promise<void> {
    alert("SCRIPT IS RUNNING");
  }
}
