import assert from "node:assert/strict";
import test from "node:test";
import { createPageViewEvent } from "../src/analytics/googleAnalytics.ts";

test("creates a page view event for the current route", () => {
  assert.deepEqual(
    createPageViewEvent({
      pathname: "/explore",
      search: "?line=2",
      hash: "#courses",
      title: "환승여행",
    }),
    {
      page_location: "/explore?line=2#courses",
      page_title: "환승여행",
    },
  );
});
