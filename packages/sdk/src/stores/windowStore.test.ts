import { describe, test, expect, beforeEach } from "bun:test";

import {
  create,
  get,
  getActive,
  getAll,
  setActive,
  setCursor,
  setScroll,
  setBuffer,
  remove,
  moveFocus,
  moveBuffer,
  addBufferToWindow,
  removeBufferFromWindow,
  setWindowStore,
} from "./windowStore";

describe("windowStore", () => {
  beforeEach(() => {
    setWindowStore({
      windows: [],
      activeWindowId: 0,
      nextWindowId: 1,
    });
  });

  describe("create", () => {
    test("creates window with correct id and defaults", () => {
      const win = create(1);

      expect(win.id).toBe(1);
      expect(win.bufId).toBe(1);
      expect(win.bufferIds).toEqual([1]);
      expect(win.cursor).toEqual({ line: 0, column: 0 });
      expect(win.scrollTop).toBe(0);
      expect(win.scrollLeft).toBe(0);
      expect(win.width).toBe(80);
      expect(win.height).toBe(24);
    });

    test("increments window id for each created window", () => {
      const win1 = create(1);
      const win2 = create(2);
      const win3 = create(3);

      expect(win1.id).toBe(1);
      expect(win2.id).toBe(2);
      expect(win3.id).toBe(3);
    });
  });

  describe("get", () => {
    test("returns correct window by id", () => {
      const win = create(1);
      const retrieved = get(win.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(win.id);
      expect(retrieved?.bufId).toBe(1);
    });

    test("returns undefined for invalid id", () => {
      const retrieved = get(999);

      expect(retrieved).toBeUndefined();
    });
  });

  describe("getActive", () => {
    test("returns active window", () => {
      const win = create(1);
      setActive(win.id);

      const active = getActive();

      expect(active).toBeDefined();
      expect(active?.id).toBe(win.id);
    });

    test("returns undefined when no windows exist", () => {
      const active = getActive();

      expect(active).toBeUndefined();
    });

    test("returns undefined when activeWindowId points to non-existent window", () => {
      setActive(999);

      const active = getActive();

      expect(active).toBeUndefined();
    });
  });

  describe("getAll", () => {
    test("returns all windows", () => {
      const win1 = create(1);
      const win2 = create(2);

      const all = getAll();

      expect(all).toHaveLength(2);
      expect(all.map((w) => w.id)).toContain(win1.id);
      expect(all.map((w) => w.id)).toContain(win2.id);
    });

    test("returns empty array when no windows exist", () => {
      const all = getAll();

      expect(all).toEqual([]);
    });
  });

  describe("setActive", () => {
    test("sets active window", () => {
      create(1);
      const win2 = create(2);

      setActive(win2.id);

      expect(getActive()?.id).toBe(win2.id);
    });
  });

  describe("setCursor", () => {
    test("updates cursor position", () => {
      const win = create(1);

      setCursor(win.id, 5, 10);

      const updated = get(win.id);
      expect(updated?.cursor).toEqual({ line: 5, column: 10 });
    });

    test("returns undefined for invalid window id", () => {
      const result = setCursor(999, 5, 10);

      expect(result).toBeUndefined();
    });
  });

  describe("setScroll", () => {
    test("updates scroll position", () => {
      const win = create(1);

      setScroll(win.id, 100, 20);

      const updated = get(win.id);
      expect(updated?.scrollTop).toBe(100);
      expect(updated?.scrollLeft).toBe(20);
    });

    test("updates only scrollTop when scrollLeft is not provided", () => {
      const win = create(1);

      setScroll(win.id, 50);

      const updated = get(win.id);
      expect(updated?.scrollTop).toBe(50);
      expect(updated?.scrollLeft).toBe(0);
    });

    test("returns undefined for invalid window id", () => {
      const result = setScroll(999, 100);

      expect(result).toBeUndefined();
    });
  });

  describe("setBuffer", () => {
    test("changes window buffer", () => {
      const win = create(1);

      setBuffer(win.id, 5);

      const updated = get(win.id);
      expect(updated?.bufId).toBe(5);
    });

    test("adds buffer to bufferIds if not present", () => {
      const win = create(1);

      setBuffer(win.id, 5);

      const updated = get(win.id);
      expect(updated?.bufferIds).toContain(5);
      expect(updated?.bufferIds).toContain(1);
    });

    test("does not duplicate buffer in bufferIds if already present", () => {
      const win = create(1);
      setBuffer(win.id, 5);

      setBuffer(win.id, 5);

      const updated = get(win.id);
      expect(updated?.bufferIds.filter((id) => id === 5)).toHaveLength(1);
    });

    test("returns undefined for invalid window id", () => {
      const result = setBuffer(999, 5);

      expect(result).toBeUndefined();
    });
  });

  describe("remove", () => {
    test("removes window correctly", () => {
      const win = create(1);

      const result = remove(win.id);

      expect(result).toBe(true);
      expect(get(win.id)).toBeUndefined();
      expect(getAll()).toHaveLength(0);
    });

    test("returns false for invalid window id", () => {
      const result = remove(999);

      expect(result).toBe(false);
    });

    test("updates activeWindowId if removed was active", () => {
      const win1 = create(1);
      const win2 = create(2);
      setActive(win1.id);

      remove(win1.id);

      expect(getActive()?.id).toBe(win2.id);
    });

    test("sets activeWindowId to 0 when removing last window", () => {
      const win = create(1);
      setActive(win.id);

      remove(win.id);

      expect(getActive()).toBeUndefined();
    });
  });

  describe("moveFocus", () => {
    test("navigates forward with l direction", () => {
      const win1 = create(1);
      const win2 = create(2);
      setActive(win1.id);

      moveFocus("l");

      expect(getActive()?.id).toBe(win2.id);
    });

    test("navigates forward with j direction", () => {
      const win1 = create(1);
      const win2 = create(2);
      setActive(win1.id);

      moveFocus("j");

      expect(getActive()?.id).toBe(win2.id);
    });

    test("navigates backward with h direction", () => {
      const win1 = create(1);
      const win2 = create(2);
      setActive(win2.id);

      moveFocus("h");

      expect(getActive()?.id).toBe(win1.id);
    });

    test("navigates backward with k direction", () => {
      const win1 = create(1);
      const win2 = create(2);
      setActive(win2.id);

      moveFocus("k");

      expect(getActive()?.id).toBe(win1.id);
    });

    test("wraps around from last to first with forward direction", () => {
      const win1 = create(1);
      const win2 = create(2);
      setActive(win2.id);

      moveFocus("l");

      expect(getActive()?.id).toBe(win1.id);
    });

    test("wraps around from first to last with backward direction", () => {
      const win1 = create(1);
      const win2 = create(2);
      setActive(win1.id);

      moveFocus("h");

      expect(getActive()?.id).toBe(win2.id);
    });

    test("does nothing with single window", () => {
      const win = create(1);
      setActive(win.id);

      moveFocus("l");

      expect(getActive()?.id).toBe(win.id);
    });

    test("does nothing when no windows exist", () => {
      moveFocus("l");

      expect(getActive()).toBeUndefined();
    });
  });

  describe("moveBuffer", () => {
    test("swaps buffers between windows with l direction", () => {
      const win1 = create(1);
      const win2 = create(2);
      setActive(win1.id);

      moveBuffer("l");

      expect(get(win1.id)?.bufId).toBe(2);
      expect(get(win2.id)?.bufId).toBe(1);
    });

    test("swaps buffers and moves focus", () => {
      const win1 = create(1);
      const win2 = create(2);
      setActive(win1.id);

      moveBuffer("l");

      expect(getActive()?.id).toBe(win2.id);
    });

    test("adds swapped buffers to bufferIds if not present", () => {
      const win1 = create(1);
      const win2 = create(2);
      setActive(win1.id);

      moveBuffer("l");

      expect(get(win1.id)?.bufferIds).toContain(2);
      expect(get(win2.id)?.bufferIds).toContain(1);
    });

    test("does nothing with single window", () => {
      const win = create(1);
      setActive(win.id);

      moveBuffer("l");

      expect(get(win.id)?.bufId).toBe(1);
    });

    test("does nothing when no windows exist", () => {
      moveBuffer("l");

      expect(getAll()).toHaveLength(0);
    });
  });

  describe("addBufferToWindow", () => {
    test("adds buffer to window", () => {
      const win = create(1);

      addBufferToWindow(win.id, 5);

      const updated = get(win.id);
      expect(updated?.bufferIds).toContain(5);
    });

    test("does not duplicate buffer if already present", () => {
      const win = create(1);

      addBufferToWindow(win.id, 1);

      const updated = get(win.id);
      expect(updated?.bufferIds.filter((id) => id === 1)).toHaveLength(1);
    });

    test("does nothing for invalid window id", () => {
      addBufferToWindow(999, 5);

      expect(getAll()).toHaveLength(0);
    });
  });

  describe("removeBufferFromWindow", () => {
    test("removes buffer from window", () => {
      const win = create(1);
      setBuffer(win.id, 2);

      removeBufferFromWindow(win.id, 2);

      const updated = get(win.id);
      expect(updated?.bufferIds).not.toContain(2);
    });

    test("switches bufId if removing active buffer", () => {
      const win = create(1);
      setBuffer(win.id, 2);

      removeBufferFromWindow(win.id, 2);

      const updated = get(win.id);
      expect(updated?.bufId).toBe(1);
    });

    test("does not remove last buffer from window", () => {
      const win = create(1);

      removeBufferFromWindow(win.id, 1);

      const updated = get(win.id);
      expect(updated?.bufferIds).toContain(1);
    });

    test("does nothing for invalid window id", () => {
      removeBufferFromWindow(999, 1);

      expect(getAll()).toHaveLength(0);
    });
  });
});
