import { suite } from "uvu";
import * as assert from "uvu/assert";
import type { AbilityWithUnknown } from "~/modules/in-game-lists/types";
import { buildToAbilityPoints } from "./utils";

const BuildToAbilityPoints = suite("buildToAbilityPoints()");

const EMPTY_ROW: [
	AbilityWithUnknown,
	AbilityWithUnknown,
	AbilityWithUnknown,
	AbilityWithUnknown,
] = ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"];

BuildToAbilityPoints("Calculates ability points", () => {
	const aps = buildToAbilityPoints([
		["SS", "SS", "RSU", "RSU"],
		EMPTY_ROW,
		EMPTY_ROW,
	]);

	assert.equal(aps.get("SS"), 13);
	assert.equal(aps.get("RSU"), 6);
	assert.equal(aps.get("UNKNOWN"), 38);
});

BuildToAbilityPoints("Handles ability doubler", () => {
	const aps = buildToAbilityPoints([
		EMPTY_ROW,
		["AD", "SS", "UNKNOWN", "UNKNOWN"],
		EMPTY_ROW,
	]);

	assert.equal(aps.get("SS"), 6);
});

BuildToAbilityPoints("Does not calculate AP for main only abilities", () => {
	const aps = buildToAbilityPoints([
		["LDE", "SS", "RSU", "RSU"],
		EMPTY_ROW,
		EMPTY_ROW,
	]);

	assert.not.ok(aps.has("LDE"));
});

BuildToAbilityPoints.run();
