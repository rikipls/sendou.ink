import { suite } from "uvu";
import * as assert from "uvu/assert";
import {
  mainWeaponIds,
  specialWeaponIds,
  exampleMainWeaponIdWithSpecialWeaponId,
} from "~/modules/in-game-lists";
import type {
  SubWeaponId,
  SpecialWeaponId,
  MainWeaponId,
} from "~/modules/in-game-lists";
import { calculateDamage } from "./objectDamage";
import { buildStats } from "~/features/build-analyzer";
import type {
  AnalyzedBuild,
  DamageType,
  AbilityPoints,
} from "~/features/build-analyzer";

function calculate({
  mainWeaponId = 10,
  subWeaponId,
  specialWeaponId,
  abilityPoints = new Map(),
  damageType = "NORMAL_MAX",
  preAnalyzed,
}: {
  mainWeaponId?: MainWeaponId;
  subWeaponId?: SubWeaponId;
  specialWeaponId?: SpecialWeaponId;
  abilityPoints?: AbilityPoints;
  damageType?: DamageType;
  preAnalyzed?: AnalyzedBuild;
}) {
  const analyzed =
    preAnalyzed ??
    buildStats({
      weaponSplId: mainWeaponId,
      hasTacticooler: false,
    });

  return calculateDamage({
    abilityPoints,
    analyzed,
    anyWeapon:
      typeof subWeaponId === "number"
        ? { type: "SUB", id: subWeaponId }
        : typeof specialWeaponId === "number"
          ? { type: "SPECIAL", id: specialWeaponId }
          : { type: "MAIN", id: mainWeaponId },
    damageType,
    isMultiShot: true,
  });
}

const CalculateDamage = suite("calculateDamage()");

// the function throws if weapon resolves to more than one set of damage rates
// so this test goes through all of them to make sure they all work
CalculateDamage("Every weapon can calculate damage", () => {
  for (const mainWeaponId of mainWeaponIds) {
    const analyzed = buildStats({
      weaponSplId: mainWeaponId,
      hasTacticooler: false,
    });

    for (const damage of analyzed.stats.damages) {
      calculate({ mainWeaponId, damageType: damage.type });
    }
  }

  const analyzed = buildStats({
    weaponSplId: 0,
    hasTacticooler: false,
  });

  for (const damage of analyzed.stats.subWeaponDefenseDamages) {
    calculate({
      subWeaponId: damage.subWeaponId,
      damageType: damage.type,
      preAnalyzed: analyzed,
    });
  }

  for (const specialWeaponId of specialWeaponIds) {
    const analyzedWithSpecialWeapon = buildStats({
      weaponSplId: exampleMainWeaponIdWithSpecialWeaponId(specialWeaponId),
      hasTacticooler: false,
    });

    for (const damage of analyzedWithSpecialWeapon.stats.specialWeaponDamages) {
      calculate({
        specialWeaponId,
        damageType: damage.type,
        preAnalyzed: analyzedWithSpecialWeapon,
      });
    }
  }
});

CalculateDamage("BRU increases Splash Wall hitpoints", () => {
  const withoutBRU = calculate({});
  const withBRU = calculate({
    abilityPoints: new Map([["BRU", 10]]),
  });

  const hpWithoutBRU = withoutBRU.find((d) => d.receiver === "Wsb_Shield")
    ?.hitPoints;
  const hpWithBRU = withBRU.find((d) => d.receiver === "Wsb_Shield")?.hitPoints;

  assert.ok(typeof hpWithoutBRU === "number");
  assert.ok(typeof hpWithBRU === "number");
  assert.ok(hpWithoutBRU < hpWithBRU);
});

CalculateDamage("SPU increases Big Bubbler hitpoints", () => {
  const withoutSPU = calculate({});
  const withSPU = calculate({
    abilityPoints: new Map([["SPU", 10]]),
  });

  const hpWithoutSPU = withoutSPU.find(
    (d) => d.receiver === "GreatBarrier_Barrier",
  )?.hitPoints;
  const hpWithSPU = withSPU.find((d) => d.receiver === "GreatBarrier_Barrier")
    ?.hitPoints;

  assert.ok(typeof hpWithoutSPU === "number");
  assert.ok(typeof hpWithSPU === "number");
  assert.ok(hpWithoutSPU < hpWithSPU);
});

const shotsToPopRM: Array<
  [
    weaponId: MainWeaponId,
    damageType: DamageType,
    shotsToPop: number,
    shotsToPopOS: number,
  ]
> = [
  // Splattershot
  [40, "NORMAL_MAX", 28, 26],
  // Range Blaster
  [220, "DIRECT", 5, 4],
  // .96 Gal
  [80, "NORMAL_MAX", 17, 15],
  // Luna Blaster
  [200, "DIRECT", 4, 4],
  // Splat Charger
  [2010, "FULL_CHARGE", 4, 3],
  // E-liter 4K
  [2030, "TAP_SHOT", 13, 12],
  // Hydra Splatling
  [4020, "NORMAL_MAX", 32, 29],
  // Sloshing Machine
  [3020, "DIRECT_MAX", 6, 5],
  // Splat Dualies
  [5010, "NORMAL_MAX", 34, 31],
  // Tenta Brella
  [6010, "NORMAL_MAX", 4, 4],
  // // Tri-Stringer
  [7010, "NORMAL_MAX", 3, 3],
  // REEF-LUX
  [7020, "NORMAL_MIN", 8, 7],
  // Splatana Wiper
  [8010, "SPLATANA_HORIZONTAL", 11, 10],
  // Splatana Wiper
  [8010, "SPLATANA_HORIZONTAL_DIRECT", 9, 8],
  // Splatana Stamper
  [8000, "SPLATANA_VERTICAL_DIRECT", 3, 3],
];

CalculateDamage(
  "Calculates matching HTD Rainmaker shield to in-game tests",
  () => {
    for (const [
      mainWeaponId,
      damageType,
      shotsToPop,
      shotsToPopOS,
    ] of shotsToPopRM) {
      const damages = calculate({ mainWeaponId, damageType });

      const damageVsRM = damages.find(
        (d) => d.receiver === "Gachihoko_Barrier",
      )!;

      assert.equal(
        damageVsRM.damages.find((d) => !d.objectShredder)!.hitsToDestroy,
        shotsToPop,
        `Shots to pop wrong for weapon id: ${mainWeaponId}`,
      );
      assert.equal(
        damageVsRM.damages.find((d) => d.objectShredder)!.hitsToDestroy,
        shotsToPopOS,
        `Shots to pop wrong with OS for weapon id: ${mainWeaponId}`,
      );
    }
  },
);

const HYDRA_SPLATLING_ID = 4020;
CalculateDamage(
  "Hits to destroy Minimum < Maximum < Maximum (Fully charged)",
  () => {
    const min = calculate({
      mainWeaponId: HYDRA_SPLATLING_ID,
      damageType: "NORMAL_MIN",
    })[0]?.damages[0]?.hitsToDestroy;
    const max = calculate({
      mainWeaponId: HYDRA_SPLATLING_ID,
      damageType: "NORMAL_MAX",
    })[0]?.damages[0]?.hitsToDestroy;
    const maxFullyCharged = calculate({
      mainWeaponId: HYDRA_SPLATLING_ID,
      damageType: "NORMAL_MAX_FULL_CHARGE",
    })[0]?.damages[0]?.hitsToDestroy;

    assert.ok(typeof min === "number");
    assert.ok(typeof max === "number");
    assert.ok(typeof maxFullyCharged === "number");

    assert.ok(min > max);
    assert.ok(max > maxFullyCharged);
  },
);

CalculateDamage.run();
