import assert from "node:assert/strict";
import test from "node:test";

import { adminMenuGoster } from "./adminMenu.ts";

test("normal kullanıcı için admin menüsünü gizler", () => {
  assert.equal(adminMenuGoster(false), false);
});

test("admin kullanıcı için admin menüsünü gösterir", () => {
  assert.equal(adminMenuGoster(true), true);
});

test("profil yüklenmemişken (undefined) admin menüsünü gizler", () => {
  assert.equal(adminMenuGoster(undefined), false);
});
