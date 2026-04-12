import { describe, test, expect, beforeEach } from "bun:test";

import { getOptions, getOption, setOption, resetOptions, opt, type VimOptions } from "./options";

describe("options API", () => {
  beforeEach(() => {
    resetOptions();
  });

  describe("default options", () => {
    test("getOptions returns correct defaults", () => {
      const options = getOptions();

      expect(options.number).toBe(true);
      expect(options.relativenumber).toBe(false);
      expect(options.leader).toBe("<Space>");
      expect(options.localleader).toBe("\\");
      expect(options.nerdFont).toBe(false);
      expect(options.tabstop).toBe(2);
      expect(options.shiftwidth).toBe(2);
      expect(options.expandtab).toBe(false);
      expect(options.timeoutlen).toBe(1000);
      expect(options.scrolloff).toBe(0);
      expect(options.wrap).toBe(false);
      expect(options.cursorline).toBe(true);
      expect(options.cursorcolumn).toBe(false);
      expect(options.hlsearch).toBe(true);
      expect(options.incsearch).toBe(true);
      expect(options.ignorecase).toBe(false);
      expect(options.smartcase).toBe(true);
      expect(options.cursorStyle).toBe("block");
      expect(options.mouseScrollStep).toBe(5);
    });
  });

  describe("getOption", () => {
    test("returns specific option by key", () => {
      expect(getOption("number")).toBe(true);
      expect(getOption("tabstop")).toBe(2);
      expect(getOption("leader")).toBe("<Space>");
    });
  });

  describe("setOption", () => {
    test("updates single option", () => {
      setOption("number", false);

      expect(getOption("number")).toBe(false);
    });

    test("changes are reflected in getOption", () => {
      setOption("tabstop", 4);

      expect(getOption("tabstop")).toBe(4);
    });

    test("setting same value multiple times works", () => {
      setOption("tabstop", 4);
      setOption("tabstop", 4);
      setOption("tabstop", 4);

      expect(getOption("tabstop")).toBe(4);
    });

    test("different options are independent", () => {
      setOption("number", false);
      setOption("tabstop", 8);

      expect(getOption("number")).toBe(false);
      expect(getOption("tabstop")).toBe(8);
      expect(getOption("relativenumber")).toBe(false);
    });
  });

  describe("resetOptions", () => {
    test("resets to defaults", () => {
      setOption("number", false);
      setOption("tabstop", 8);

      resetOptions();

      expect(getOption("number")).toBe(true);
      expect(getOption("tabstop")).toBe(2);
    });

    test("after partial changes, resets correctly", () => {
      setOption("number", false);

      resetOptions();

      expect(getOption("number")).toBe(true);
      expect(getOption("relativenumber")).toBe(false);
      expect(getOption("tabstop")).toBe(2);
    });
  });

  describe("opt proxy", () => {
    test("getter returns current value", () => {
      expect(opt.number).toBe(true);
      expect(opt.tabstop).toBe(2);
    });

    test("setter updates value", () => {
      opt.number = false;

      expect(opt.number).toBe(false);
      expect(getOption("number")).toBe(false);
    });

    test("setter updates and getOption reflects change", () => {
      opt.tabstop = 4;

      expect(getOption("tabstop")).toBe(4);
    });

    test("setOption updates and opt reflects change", () => {
      setOption("shiftwidth", 8);

      expect(opt.shiftwidth).toBe(8);
    });

    test("setting invalid key returns undefined on get", () => {
      const value = (opt as VimOptions & Record<string, unknown>).invalidKey;

      expect(value).toBeUndefined();
    });

    test("setting invalid key returns false (no-op)", () => {
      const result = Reflect.set(opt, "invalidKey", "value");

      expect(result).toBe(false);
    });

    test("setting invalid key does not modify state", () => {
      Reflect.set(opt, "invalidKey", "value");

      expect(getOptions().leader).toBe("<Space>");
    });

    test("proxy getters return current state after reset", () => {
      opt.number = false;
      resetOptions();

      expect(opt.number).toBe(true);
    });
  });

  describe("edge cases", () => {
    test("getOptions returns readonly reference", () => {
      const options = getOptions();

      expect(options.number).toBe(true);
    });

    test("multiple modifications accumulate correctly", () => {
      setOption("number", false);
      setOption("relativenumber", true);
      setOption("tabstop", 4);
      setOption("shiftwidth", 4);

      expect(getOption("number")).toBe(false);
      expect(getOption("relativenumber")).toBe(true);
      expect(getOption("tabstop")).toBe(4);
      expect(getOption("shiftwidth")).toBe(4);
    });

    test("proxy and direct API stay in sync", () => {
      opt.number = false;
      setOption("tabstop", 8);

      expect(getOption("number")).toBe(false);
      expect(opt.tabstop).toBe(8);
      expect(opt.number).toBe(false);
      expect(getOption("tabstop")).toBe(8);
    });

    test("all option types can be modified", () => {
      setOption("number", false);
      setOption("relativenumber", true);
      setOption("leader", ",");
      setOption("nerdFont", true);
      setOption("tabstop", 4);
      setOption("cursorStyle", "line");

      expect(getOption("number")).toBe(false);
      expect(getOption("relativenumber")).toBe(true);
      expect(getOption("leader")).toBe(",");
      expect(getOption("nerdFont")).toBe(true);
      expect(getOption("tabstop")).toBe(4);
      expect(getOption("cursorStyle")).toBe("line");
    });
  });
});
