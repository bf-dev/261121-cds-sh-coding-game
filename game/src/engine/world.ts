// The walkable campus: map loading, movement, camera, depth-sorted drawing, triggers.

import { TILE, VIEW_H, VIEW_W, type Action, type Dir, type GameMap, type NpcDef, type Trigger } from "./types";
import { getCharacter } from "../art/characters";
import { labelPanel, mk, rect, text } from "../art/px";
import { buildMap } from "../maps/index";

export interface Target {
  id: string;
  en: string;
  zh: string;
  action: Action;
  npc?: NpcDef;
}

export interface WorldHooks {
  /** marker over an NPC: "!" not yet beaten, "ok" beaten, "" none */
  mark: (npc: NpcDef) => "!" | "ok" | "";
  /** an auto trigger (door) fired */
  onAuto: (t: Target) => void;
  /** the thing the player could interact with changed */
  onTarget: (t: Target | null) => void;
}

const SPEED = 330;
const HALF_W = 17;

export class World {
  map!: GameMap;
  px = 0;
  py = 0;
  dir: Dir = "down";
  moving = false;
  paused = false;
  target: Target | null = null;
  move = { x: 0, y: 0 };
  /** battle framing: keep this world point at this screen height, centred */
  focus: { x: number; y: number; screenY: number } | null = null;
  private camX = 0;
  private camY = 0;
  private armed = false;
  private walkT = 0;
  private labelCache = new Map<string, HTMLCanvasElement>();
  private markers: Record<string, HTMLCanvasElement> = {};
  private ctx: CanvasRenderingContext2D;

  constructor(private canvas: HTMLCanvasElement, private hooks: WorldHooks) {
    this.ctx = canvas.getContext("2d")!;
    this.ctx.imageSmoothingEnabled = false;
    this.markers["!"] = marker("!", "#ffbf00", "#3b2a00");
    this.markers.ok = marker("✓", "#4fbf6b", "#0d3318");
  }

  enter(mapId: string, spawn: string, tp?: { tx: number; ty: number }): void {
    this.map = buildMap(mapId);
    const s = this.map.spawns[spawn] ?? Object.values(this.map.spawns)[0] ?? { tx: 2, ty: 2, dir: "down" as Dir };
    const tx = tp?.tx ?? s.tx;
    const ty = tp?.ty ?? s.ty;
    this.px = tx * TILE + TILE / 2;
    this.py = ty * TILE + TILE - 10;
    this.dir = s.dir;
    this.armed = false;
    this.target = null;
    this.hooks.onTarget(null);
    this.snapCamera();
  }

  private solidAt(x: number, y: number): boolean {
    const m = this.map;
    const tx = Math.floor(x / TILE);
    const ty = Math.floor(y / TILE);
    if (tx < 0 || ty < 0 || tx >= m.cols || ty >= m.rows) return true;
    if (m.solid[ty * m.cols + tx]) return true;
    for (const n of m.npcs) if (n.tx === tx && n.ty === ty) return true;
    return false;
  }

  private free(x: number, y: number): boolean {
    return !(this.solidAt(x - HALF_W, y - 14) || this.solidAt(x + HALF_W, y - 14) || this.solidAt(x - HALF_W, y + 2) || this.solidAt(x + HALF_W, y + 2));
  }

  update(dt: number): void {
    if (!this.map) return;
    if (this.paused) {
      this.moving = false;
      this.followCamera(dt);
      return;
    }
    let { x: dx, y: dy } = this.move;
    this.moving = dx !== 0 || dy !== 0;
    if (this.moving) {
      const len = Math.hypot(dx, dy);
      dx = (dx / len) * SPEED * dt;
      dy = (dy / len) * SPEED * dt;
      if (Math.abs(this.move.x) >= Math.abs(this.move.y)) this.dir = this.move.x > 0 ? "right" : "left";
      else this.dir = this.move.y > 0 ? "down" : "up";
      if (this.free(this.px + dx, this.py)) this.px += dx;
      if (this.free(this.px, this.py + dy)) this.py += dy;
      this.walkT += dt;
    } else this.walkT = 0;
    this.checkTriggers();
    this.followCamera(dt);
  }

  private inRect(t: Trigger, margin: number): boolean {
    const x = this.px / TILE;
    const y = (this.py - 6) / TILE;
    return x >= t.tx - margin && x <= t.tx + t.w + margin && y >= t.ty - margin && y <= t.ty + t.h + margin;
  }

  private checkTriggers(): void {
    const m = this.map;
    let inAuto = false;
    for (const t of m.triggers) {
      if (!t.auto) continue;
      if (this.inRect(t, 0.15)) {
        inAuto = true;
        if (this.armed) {
          this.armed = false;
          this.hooks.onAuto({ id: t.id, en: t.en, zh: t.zh, action: t.action });
          return;
        }
      }
    }
    if (!inAuto) this.armed = true;

    let best: Target | null = null;
    let bestD = 1e9;
    for (const n of m.npcs) {
      if (!n.action) continue;
      const nx = n.tx * TILE + TILE / 2;
      const ny = n.ty * TILE + TILE - 10;
      const d = Math.hypot(nx - this.px, ny - this.py);
      if (d < TILE * 1.7 && d < bestD) {
        bestD = d;
        best = { id: n.id, en: `Talk to ${n.name}`, zh: `和${n.nameZh}对话`, action: n.action, npc: n };
      }
    }
    if (!best) {
      for (const t of m.triggers) {
        if (t.auto || !this.inRect(t, 0.75)) continue;
        const d = Math.hypot((t.tx + t.w / 2) * TILE - this.px, (t.ty + t.h / 2) * TILE - this.py);
        if (d < bestD) {
          bestD = d;
          best = { id: t.id, en: t.en, zh: t.zh, action: t.action };
        }
      }
    }
    if ((best?.id ?? "") !== (this.target?.id ?? "")) {
      this.target = best;
      this.hooks.onTarget(best);
    }
  }

  private camGoal(): [number, number] {
    const w = this.map.cols * TILE;
    const hgt = this.map.rows * TILE;
    if (this.focus) {
      const fx = w <= VIEW_W ? -(VIEW_W - w) / 2 : Math.max(0, Math.min(w - VIEW_W, this.focus.x - VIEW_W / 2));
      return [fx, this.focus.y - this.focus.screenY];
    }
    const gx = w <= VIEW_W ? -(VIEW_W - w) / 2 : Math.max(0, Math.min(w - VIEW_W, this.px - VIEW_W / 2));
    const gy = hgt <= VIEW_H ? -(VIEW_H - hgt) / 2 : Math.max(0, Math.min(hgt - VIEW_H, this.py - 64 - VIEW_H / 2));
    return [gx, gy];
  }

  snapCamera(): void {
    [this.camX, this.camY] = this.camGoal();
  }

  private followCamera(dt: number): void {
    const [gx, gy] = this.camGoal();
    const k = Math.min(1, dt * 8);
    this.camX += (gx - this.camX) * k;
    this.camY += (gy - this.camY) * k;
  }

  render(timeMs: number): void {
    const ctx = this.ctx;
    const m = this.map;
    ctx.imageSmoothingEnabled = false;
    rect(ctx, 0, 0, VIEW_W, VIEW_H, "#15131c");
    if (!m) return;
    const cx = Math.round(this.camX);
    const cy = Math.round(this.camY);
    ctx.save();
    ctx.translate(-cx, -cy);
    const sx = Math.max(0, cx);
    const sy = Math.max(0, cy);
    const sw = Math.min(m.ground.width - sx, VIEW_W);
    const sh = Math.min(m.ground.height - sy, VIEW_H);
    if (sw > 0 && sh > 0) ctx.drawImage(m.ground, sx, sy, sw, sh, sx, sy, sw, sh);
    m.drawUnder?.(ctx, timeMs);

    type Item = { y: number; draw: () => void };
    const items: Item[] = [];
    for (const p of m.props) {
      if (p.x > cx + VIEW_W || p.x + p.sprite.width < cx || p.y > cy + VIEW_H || p.y + p.sprite.height < cy) continue;
      const sortY = p.sortY ?? p.y + p.sprite.height;
      items.push({
        y: sortY,
        draw: () => {
          const behind = p.fade && this.py < sortY && this.px > p.x - 8 && this.px < p.x + p.sprite.width + 8 && this.py > p.y;
          if (behind) ctx.globalAlpha = 0.38;
          ctx.drawImage(p.sprite, Math.round(p.x), Math.round(p.y));
          if (behind) ctx.globalAlpha = 1;
        },
      });
    }
    for (const n of m.npcs) {
      const sheet = getCharacter(n.char);
      const nx = n.tx * TILE + TILE / 2;
      const ny = n.ty * TILE + TILE - 10;
      // face the player when close
      let dir = n.dir;
      const ddx = this.px - nx;
      const ddy = this.py - ny;
      if (Math.hypot(ddx, ddy) < TILE * 2.5) dir = Math.abs(ddx) > Math.abs(ddy) ? (ddx > 0 ? "right" : "left") : ddy > 0 ? "down" : "up";
      items.push({
        y: ny,
        draw: () => {
          groundShadow(ctx, nx, ny, sheet.w * 0.34);
          const bob = Math.floor(timeMs / 600 + n.tx) % 2;
          ctx.drawImage(sheet.frames[dir][0], Math.round(nx - sheet.w / 2), Math.round(ny - sheet.h + 4 - bob));
          const mk2 = this.hooks.mark(n);
          if (mk2) {
            const mc = this.markers[mk2];
            ctx.drawImage(mc, Math.round(nx - mc.width / 2), Math.round(ny - sheet.h - mc.height + 2 - Math.round(Math.sin(timeMs / 250) * 4)));
          }
        },
      });
    }
    const player = getCharacter("student");
    items.push({
      y: this.py,
      draw: () => {
        groundShadow(ctx, this.px, this.py, 22);
        const f = this.moving ? Math.floor(this.walkT * 8) % 4 : 0;
        ctx.drawImage(player.frames[this.dir][f], Math.round(this.px - player.w / 2), Math.round(this.py - player.h + 4));
      },
    });
    items.sort((a, b) => a.y - b.y);
    for (const it of items) it.draw();
    m.drawOver?.(ctx, timeMs);

    for (const l of m.labels ?? []) {
      const key = `${l.en}|${l.zh}`;
      let c = this.labelCache.get(key);
      if (!c) this.labelCache.set(key, (c = labelPanel(l.en, l.zh, 20)));
      if (l.x < cx - 200 || l.x > cx + VIEW_W + 200) continue;
      ctx.drawImage(c, Math.round(l.x - c.width / 2), Math.round(l.y - c.height));
    }
    ctx.restore();
    if (m.tint) rect(ctx, 0, 0, VIEW_W, VIEW_H, m.tint);
  }
}

function groundShadow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.fillStyle = "rgba(20,24,40,0.28)";
  const ry = Math.max(4, Math.round(r * 0.36));
  for (let j = -ry; j <= ry; j += 2) {
    const half = Math.round(r * Math.sqrt(Math.max(0, 1 - (j * j) / (ry * ry))));
    ctx.fillRect(Math.round(x - half), Math.round(y + j - 2), half * 2, 2);
  }
}

function marker(s: string, bg: string, fg: string): HTMLCanvasElement {
  const [c, g] = mk(44, 52);
  rect(g, 4, 0, 36, 40, "#2a2433");
  rect(g, 0, 4, 44, 32, "#2a2433");
  rect(g, 4, 4, 36, 32, bg);
  rect(g, 16, 40, 12, 6, "#2a2433");
  rect(g, 19, 46, 6, 6, "#2a2433");
  text(g, s, 22, 5, 28, fg, { align: "center" });
  return c;
}
