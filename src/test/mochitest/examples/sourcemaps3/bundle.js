!(function(n) {
  function e(t) {
    if (r[t]) return r[t].exports;
    var o = (r[t] = { i: t, l: !1, exports: {} });
    return n[t].call(o.exports, o, o.exports, e), (o.l = !0), o.exports;
  }
  var r = {};
  (e.m = n),
    (e.c = r),
    (e.d = function(n, r, t) {
      e.o(n, r) ||
        Object.defineProperty(n, r, {
          configurable: !1,
          enumerable: !0,
          get: t
        });
    }),
    (e.n = function(n) {
      var r =
        n && n.__esModule
          ? function() {
              return n.default;
            }
          : function() {
              return n;
            };
      return e.d(r, "a", r), r;
    }),
    (e.o = function(n, e) {
      return Object.prototype.hasOwnProperty.call(n, e);
    }),
    (e.p = ""),
    e((e.s = 0));
})([
  function(n, e, r) {
    "use strict";
    var t = r(1);
    window.test = function() {
      var n = ["b (30)", "a", "b (5)", "z"],
        e = (0, t.fancySort)(n);
      console.log(e);
    };
  },
  function(n, e, r) {
    "use strict";
    function t(n, e) {
      var r = /.(\d+)\W*$/.exec(n),
        t = /.(\d+)\W*$/.exec(e);
      if (null == r || null == t || r[1] == t[1])
        return n < e ? -1 : n > e ? 1 : 0;
      var o = +r[1],
        u = +t[1];
      return o < u ? -1 : o > u ? 1 : 0;
    }
    function o(n, e, r) {
      if (0 == n.length) return { found: !1, index: 0 };
      for (var t = 0, o = n.length - 1; t < o; ) {
        var u = Math.floor((t + o) / 2);
        r(n[u], e) < 0 ? (t = u + 1) : (o = u);
      }
      var c = r(n[t], e);
      return 0 === c
        ? { found: !0, index: t }
        : { found: !1, index: c < 0 ? t + 1 : t };
    }
    function u(n) {
      return n.reduce(function(n, e) {
        var r = o(n, e, t),
          u = r.index;
        return n.splice(u, 0, e), n;
      }, []);
    }
    Object.defineProperty(e, "__esModule", { value: !0 }), (e.fancySort = u);
  }
]);
//# sourceMappingURL=bundle.js.map
