import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export const finishHeight = 6.2;
export const ladderDepth = 0.87;
const ladderHalfWidth = 0.56;

function paint(color: string, roughness = 0.8, metalness = 0): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

type Part = THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;

function part(
  parent: THREE.Group, geometry: THREE.BufferGeometry, material: THREE.MeshStandardMaterial,
  x: number, y: number, z: number, width: number, height: number, depth: number
): Part {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.scale.set(width, height, depth);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function batchScenery(source: THREE.Group): THREE.Group {
  const scenery = new THREE.Group();
  const batches = new Map<string, Part[]>();
  source.updateMatrixWorld(true);
  source.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const key = `${object.geometry.id}/${object.material.id}`;
    const batch = batches.get(key) ?? [];
    batch.push(object as Part);
    batches.set(key, batch);
  });
  for (const [first, ...rest] of batches.values()) {
    const batch = new THREE.InstancedMesh(first.geometry, first.material, rest.length + 1);
    batch.castShadow = true;
    batch.receiveShadow = true;
    [first, ...rest].forEach((mesh, index) => batch.setMatrixAt(index, mesh.matrixWorld));
    scenery.add(batch);
  }
  return scenery;
}

export function buildCourse(halfWidth: number, lanes: readonly number[], palette: readonly string[]) {
  const scenery = new THREE.Group();
  const block = new THREE.BoxGeometry(1, 1, 1);
  const bevel = new RoundedBoxGeometry(1, 1, 1, 2, 0.11);
  const rock = new THREE.DodecahedronGeometry(0.65);
  const rod = new THREE.CylinderGeometry(0.5, 0.5, 1, 10);
  const bough = new THREE.CylinderGeometry(0.04, 0.61, 1, 8);
  const sand = ["#9a6447", "#bc825a", "#cc9367", "#b77955", "#d1a078"].map((color) => paint(color));
  const moss = ["#73823a", "#8c9345", "#a6a359"].map((color) => paint(color));
  const pine = ["#385b42", "#486844", "#65814d"].map((color) => paint(color));
  const wood = paint("#bc692d", 0.58);
  const rung = paint("#dd9549", 0.55);
  const grain = paint("#e6a157", 0.6);
  const iron = paint("#59443a", 0.52, 0.25);
  const brass = paint("#f3c078", 0.33, 0.36);
  const checkers = [paint("#fff2d1"), paint("#d86e34")];

  // Offset layers and protruding stone faces leave the ladder silhouette clear.
  part(scenery, bevel, sand[0], 0, 2.95, -1.1, halfWidth * 2, 6.55, 2.35);
  const columns = Math.ceil(halfWidth * 1.15);
  const strataWidth = halfWidth * 2 / columns;
  for (let row = 0; row < 5; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = (column + 0.5 - columns / 2) * strataWidth + Math.sin(column * 8.32 + row * 2.7) * 0.28;
      const y = 0.62 + row * 1.23 + Math.sin(column * 2.4 + row) * 0.18;
      const stone = part(scenery, rock, sand[(row + column * 3) % sand.length], x, y, -0.27,
        strataWidth * 1.15, 1.32 + Math.cos(column * 3.53) * 0.32, 0.95);
      stone.rotation.z = 0.12 * Math.sin(row * 2 + column * 3);
      if ((column + row * 2) % 3 === 0) {
        part(scenery, rock, moss[(column + row) % moss.length], x - 0.18, y + 0.59, 0.08,
          strataWidth * 0.74, 0.15, 0.51);
      }
    }
  }

  // The start ledge is wide enough to read as a continuous platform.
  part(scenery, bevel, sand[1], 0, -0.64, 0.25, 2 * halfWidth + 1.85, 1.2, 3.18);
  for (let index = 0; index < columns + 2; index += 1) {
    const x = (index - (columns + 1) / 2) * strataWidth;
    const stone = part(scenery, rock, sand[(index + 1) % sand.length], x, -0.57, 1.42,
      strataWidth * 1.1, 1.13, 0.99);
    stone.rotation.z = Math.sin(index * 6) * 0.14;
    part(scenery, rock, moss[index % moss.length], x, -0.065, 1.39, strataWidth * 1.02, 0.18, 0.92);
  }

  const finishWidth = Math.max(4.5, halfWidth * 2 - 0.85);
  part(scenery, bevel, sand[4], 0, finishHeight - 0.035, -0.27, finishWidth + 0.65, 0.34, 1.94);
  const squares = Math.ceil(finishWidth / 0.43);
  const squareWidth = finishWidth / squares;
  for (let index = 0; index < squares; index += 1) {
    const x = (index + 0.5 - squares / 2) * squareWidth;
    part(scenery, block, checkers[index % 2], x, finishHeight + 0.025, 0.712, squareWidth, 0.25, 0.018);
    part(scenery, block, checkers[(index + 1) % 2], x, finishHeight + 0.16, 0.585, squareWidth, 0.018, 0.25);
  }

  for (const sign of [-1, 1]) {
    // Pines and loose rocks frame the course without intercepting the lanes.
    for (let index = 0; index < 4; index += 1) {
      const x = sign * (halfWidth - 0.35 + index * 0.59);
      const y = index < 2 ? 5.48 - index * 0.65 : 0.22;
      const z = index < 2 ? -1.72 : 0.2;
      const height = [2.9, 2.15, 1.8, 2.7][index];
      part(scenery, rod, iron, x, y + height * 0.35, z, 0.16, height * 0.72, 0.16);
      for (let tier = 0; tier < 4; tier += 1) {
        const width = height * (0.49 - tier * 0.078);
        const tree = part(scenery, bough, pine[Math.min(tier, pine.length - 1)],
          x, y + height * (0.32 + tier * 0.18), z, width, height * 0.43, width);
        tree.rotation.y = tier * 0.46 + index;
      }
      part(scenery, rock, sand[(index + 2) % sand.length], x, y - 0.21, z + 0.35, 1.45, 0.68, 1.2);
    }
  }

  lanes.forEach((x, index) => {
    const lanePaint = paint(palette[index], 0.48);
    for (const sign of [-1, 1]) {
      const railX = x + ladderHalfWidth * sign;
      part(scenery, rod, wood, railX, finishHeight / 2 + 0.14, ladderDepth, 0.185, finishHeight + 0.38, 0.18);
      part(scenery, rod, grain, railX - 0.027, finishHeight / 2 + 0.14, ladderDepth + 0.076,
        0.035, finishHeight + 0.2, 0.026);
      part(scenery, rod, brass, railX, finishHeight + 0.32, ladderDepth, 0.23, 0.19, 0.23);
      part(scenery, rod, lanePaint, railX, 0.14, ladderDepth, 0.204, 0.18, 0.201);
      for (const y of [0.82, 2.43, 4.02, 5.59]) {
        part(scenery, bevel, iron, railX + sign * 0.08, y, 0.52, 0.31, 0.21, 0.61);
        const bolt = part(scenery, rod, brass, railX + sign * 0.15, y, 0.831, 0.064, 0.04, 0.064);
        bolt.rotation.x = Math.PI / 2;
      }
    }
    for (let index = 0; index < 12; index += 1) {
      const step = part(scenery, rod, rung, x, 0.32 + index * 0.51, ladderDepth, 0.12, 1.12, 0.13);
      step.rotation.z = Math.PI / 2;
    }
  });

  const course = batchScenery(scenery);
  // These are reused across batches. Keep the shared primitives in one owner.
  return {
    course,
    dispose() {
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      course.traverse((object) => {
        if (object instanceof THREE.InstancedMesh) {
          geometries.add(object.geometry);
          materials.add(object.material);
          object.dispose();
        }
      });
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      course.removeFromParent();
    }
  };
}

export function createClimberKit() {
  const sphere = new THREE.SphereGeometry(0.5, 20, 14);
  const round = new RoundedBoxGeometry(1, 1, 1, 3, 0.22);
  const boot = paint("#353644", 0.75);
  const sole = paint("#eee2c7");
  const trim = paint("#fff0d1", 0.65);
  const strap = paint("#434050", 0.65);

  return {
    create(color: string) {
      const body = new THREE.Group();
      const suit = paint(color, 0.6);
      const helmet = paint(color, 0.31);
      const bag = paint(new THREE.Color(color).lerp(new THREE.Color("#42344b"), 0.47).getStyle(), 0.79);
      part(body, round, suit, 0, 0.51, 0, 0.53, 0.55, 0.39);
      part(body, round, suit, 0, 0.25, 0, 0.5, 0.26, 0.37);
      part(body, round, bag, 0, 0.49, 0.215, 0.43, 0.45, 0.2);
      part(body, round, strap, 0, 0.29, 0.06, 0.54, 0.073, 0.43);
      part(body, round, trim, 0, 0.49, 0.319, 0.16, 0.045, 0.018);
      part(body, sphere, helmet, 0, 0.98, 0.003, 0.67, 0.61, 0.61);
      part(body, sphere, suit, 0, 0.84, 0.027, 0.645, 0.27, 0.6);
      for (const sign of [-1, 1]) {
        part(body, round, strap, sign * 0.112, 1.055, 0.294, 0.048, 0.123, 0.028)
          .rotation.z = sign * 0.12;
      }

      const arms: THREE.Group[] = [];
      const legs: THREE.Group[] = [];
      for (const sign of [-1, 1]) {
        const arm = new THREE.Group();
        arm.position.set(sign * 0.24, 0.63, -0.025);
        part(arm, round, suit, sign * 0.105, 0.061, -0.045, 0.29, 0.2, 0.22)
          .rotation.z = sign * 0.52;
        part(arm, round, suit, sign * 0.23, 0.18, -0.14, 0.19, 0.3, 0.19)
          .rotation.x = -0.48;
        part(arm, sphere, trim, sign * 0.265, 0.34, -0.244, 0.19, 0.195, 0.18);
        body.add(arm);
        arms.push(arm);

        const leg = new THREE.Group();
        leg.position.set(sign * 0.139, 0.15, 0);
        part(leg, round, suit, 0, -0.12, -0.05, 0.22, 0.35, 0.23);
        part(leg, round, sole, 0, -0.27, -0.103, 0.221, 0.065, 0.24);
        part(leg, round, boot, 0, -0.34, -0.126, 0.23, 0.14, 0.29);
        body.add(leg);
        legs.push(leg);
      }

      return {
        body,
        pose(stride: number) {
          const swing = Math.sin(stride);
          arms[0].rotation.z = -0.33 + 0.58 * swing;
          arms[1].rotation.z = 0.33 + 0.58 * swing;
          legs[0].rotation.x = 0.31 + 0.55 * swing;
          legs[1].rotation.x = 0.31 - 0.55 * swing;
          legs[0].position.y = 0.15 + 0.13 * swing;
          legs[1].position.y = 0.15 - 0.13 * swing;
          body.rotation.z = 0.07 * swing;
        },
        dispose() {
          body.removeFromParent();
          suit.dispose();
          helmet.dispose();
          bag.dispose();
        }
      };
    },
    dispose() {
      for (const resource of [sphere, round, boot, sole, trim, strap]) resource.dispose();
    }
  };
}
