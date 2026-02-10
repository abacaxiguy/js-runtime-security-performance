function run() {
  const results = [];

  function unsafeMerge(target, source) {
    for (const key in source) {
      if (typeof source[key] === "object" && source[key] !== null) {
        target[key] = target[key] || {};
        unsafeMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  let obj1 = {};
  unsafeMerge(obj1, JSON.parse('{"__proto__": {"polluted": true}}'));
  const t1 = {};
  results.push({ test: "__proto__", vulnerable: t1.polluted === true });
  if (Object.prototype.polluted !== undefined) delete Object.prototype.polluted;

  let obj2 = {};
  try {
    unsafeMerge(obj2, JSON.parse('{"constructor": {"prototype": {"polluted2": true}}}'));
    results.push({ test: "constructor.prototype", vulnerable: ({}).polluted2 === true });
  } catch (_) {
    results.push({ test: "constructor.prototype", vulnerable: false });
  }
  if (Object.prototype.polluted2 !== undefined) delete Object.prototype.polluted2;

  let obj3 = {};
  Object.assign(obj3, { __proto__: { assignPolluted: true } });
  const t3 = {};
  results.push({ test: "Object.assign __proto__", vulnerable: t3.assignPolluted === true });
  if (Object.prototype.assignPolluted !== undefined) delete Object.prototype.assignPolluted;

  const payload4 = JSON.parse('{"__proto__": {"spreadPolluted": true}}');
  const obj4 = { ...payload4 };
  const t4 = {};
  results.push({ test: "spread __proto__", vulnerable: t4.spreadPolluted === true });
  if (Object.prototype.spreadPolluted !== undefined) delete Object.prototype.spreadPolluted;

  /* Object.freeze test must stay last: it mutates Object.prototype globally */
  try {
    Object.freeze(Object.prototype);
    Object.prototype.freezeTest = true;
    results.push({ test: "Object.freeze mitigation", vulnerable: !!Object.prototype.freezeTest });
  } catch (_) {
    results.push({ test: "Object.freeze mitigation", vulnerable: false });
  }

  const runtime = typeof Bun !== "undefined" ? "Bun" : typeof Deno !== "undefined" ? "Deno" : "Node.js";
  console.log(JSON.stringify({ runtime, results }, null, 2));
}
run();
