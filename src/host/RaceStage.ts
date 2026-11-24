import * as THREE from "three";
import { buildCourse, createClimberKit, finishHeight, ladderDepth } from "./courseModels.js";

export const lanePalette = ["#00a7b4", "#ed781b", "#9f74cd", "#62ba86", "#e5af2e", "#e46182", "#578cec", "#b58a5d"];

export function layoutCourse(width: number, height: number, count: number) {
  const aspect = width / height;
  const spacing = Math.max(1.94, Math.min(3.55, 13.8 / Math.max(1, count)));
  const span = count * spacing;
  const viewWidth = Math.max(10.35 * aspect, span + 1.3);
  return {
    width: viewWidth,
    height: viewWidth / aspect,
    labelsWidth: Math.min(100 * span / viewWidth, 92),
    rockHalfWidth: Math.max(7.55, span / 2 + 0.06),
    lanes: Array.from({ length: count }, (_, index) => (index + 0.5 - count / 2) * spacing)
  };
}

interface Racer {
  id: string;
  progress: number;
}

interface Climber {
  model: ReturnType<ReturnType<typeof createClimberKit>["create"]>;
  shown: number;
  target: number;
}

export class RaceStage {
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 60);
  private readonly kit = createClimberKit();
  private readonly motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  private readonly climbers = new Map<string, Climber>();
  private course?: ReturnType<typeof buildCourse>;
  private frameId = 0;
  private lastFrame = 0;
  private contextLost = false;
  private live = false;

  static mount(root: HTMLElement): RaceStage | undefined {
    // Test explicitly so hosts without WebGL can use the same HUD and race.
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", { alpha: true, antialias: true });
    if (!context) return;
    return new RaceStage(root, new THREE.WebGLRenderer({ canvas, context }));
  }

  private constructor(private readonly root: HTMLElement, private readonly renderer: THREE.WebGLRenderer) {
    const canvas = renderer.domElement;
    canvas.className = "tr-canvas";
    canvas.setAttribute("aria-hidden", "true");
    root.prepend(canvas);
    canvas.addEventListener("webglcontextlost", this.onContextLost);
    canvas.addEventListener("webglcontextrestored", this.onContextRestored);
    this.motion.addEventListener("change", this.requestFrame);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.28;
    renderer.setClearColor(0x000000, 0);

    this.camera.position.set(0, 7.9, 25);
    this.camera.lookAt(0, 3.67, 0);
    this.scene.add(new THREE.HemisphereLight("#fff1db", "#796050", 2.2));
    const sun = new THREE.DirectionalLight("#ffe1ad", 3.5);
    sun.position.set(-8, 12, 10);
    sun.target.position.set(0, 3, 0);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 9, bottom: -9, near: 1, far: 35 });
    sun.shadow.normalBias = 0.035;
    sun.shadow.bias = -0.0002;
    this.scene.add(sun, sun.target);
  }

  resize(width: number, height: number, layout: ReturnType<typeof layoutCourse>): void {
    this.renderer.setSize(width, height, false);
    Object.assign(this.camera, {
      left: -layout.width / 2, right: layout.width / 2,
      top: layout.height / 2, bottom: -layout.height / 2
    });
    this.camera.updateProjectionMatrix();
    this.live = true;
    this.requestFrame();
  }

  update(racers: readonly Racer[], layout: ReturnType<typeof layoutCourse>, rosterChanged: boolean): void {
    if (rosterChanged || !this.course) {
      this.clearCourse();
      const palette = racers.map((_, index) => lanePalette[index % lanePalette.length]);
      this.course = buildCourse(layout.rockHalfWidth, layout.lanes, palette);
      this.scene.add(this.course.course);
      racers.forEach(({ id, progress }, index) => {
        const model = this.kit.create(palette[index]);
        model.body.position.set(layout.lanes[index], 0, ladderDepth + 0.28);
        this.scene.add(model.body);
        this.climbers.set(id, { model, shown: progress, target: progress });
      });
      this.requestFrame();
    }

    for (const racer of racers) {
      const climber = this.climbers.get(racer.id);
      if (!climber || climber.target === racer.progress) continue;
      if (racer.progress < climber.target) climber.shown = racer.progress;
      climber.target = racer.progress;
      this.requestFrame();
    }
  }

  private requestFrame = (): void => {
    if (this.live && !this.frameId && !this.contextLost) this.frameId = requestAnimationFrame(this.draw);
  };

  private draw = (time: number): void => {
    this.frameId = 0;
    const delta = this.lastFrame ? Math.min(70, time - this.lastFrame) : 17;
    let moving = false;
    for (const climber of this.climbers.values()) {
      const distance = climber.target - climber.shown;
      if (this.motion.matches || Math.abs(distance) < 0.001) {
        climber.shown = climber.target;
      } else {
        climber.shown += distance * (1 - Math.exp(-delta / 47));
        moving = true;
      }
      const height = THREE.MathUtils.lerp(0.23, finishHeight - 0.13, climber.shown);
      climber.model.body.position.y = height;
      climber.model.pose((height - 0.23) * Math.PI / 0.51 + 0.8);
    }

    this.renderer.shadowMap.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
    this.root.dataset.renderer = "3d";
    this.lastFrame = moving ? time : 0;
    if (moving) this.requestFrame();
  };

  private onContextLost = (event: Event): void => {
    event.preventDefault();
    this.contextLost = true;
    this.root.dataset.renderer = "fallback";
    cancelAnimationFrame(this.frameId);
    this.frameId = 0;
    this.lastFrame = 0;
  };

  private onContextRestored = (): void => {
    this.contextLost = false;
    this.requestFrame();
  };

  private clearCourse(): void {
    this.course?.dispose();
    for (const { model } of this.climbers.values()) model.dispose();
    this.climbers.clear();
  }

  dispose(): void {
    this.live = false;
    cancelAnimationFrame(this.frameId);
    this.motion.removeEventListener("change", this.requestFrame);
    const canvas = this.renderer.domElement;
    canvas.removeEventListener("webglcontextlost", this.onContextLost);
    canvas.removeEventListener("webglcontextrestored", this.onContextRestored);
    this.clearCourse();
    this.kit.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    canvas.remove();
  }
}
