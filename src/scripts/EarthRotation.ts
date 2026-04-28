import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Space } from "@babylonjs/core/Maths/math.axis";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { IScript, visibleAsNumber } from "babylonjs-editor-tools";

export default class EarthRotation implements IScript {
	@visibleAsNumber("Rotation Speed", {
		min: 0,
		max: 1,
	})
	private _rotationSpeed: number = 0.002;

	public constructor(public mesh: Mesh) {}

	public onStart(): void {}

	public onUpdate(): void {
		this.mesh.rotate(Vector3.UpReadOnly, this._rotationSpeed * this.mesh.getScene().getAnimationRatio(), Space.LOCAL);
	}
}