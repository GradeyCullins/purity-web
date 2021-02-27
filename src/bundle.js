(function () { function r (e, n, t) { function o (i, f) { if (!n[i]) { if (!e[i]) { const c = typeof require === 'function' && require; if (!f && c) return c(i, !0); if (u) return u(i, !0); const a = new Error("Cannot find module '" + i + "'"); throw a.code = 'MODULE_NOT_FOUND', a } const p = n[i] = { exports: {} }; e[i][0].call(p.exports, function (r) { const n = e[i][1][r]; return o(n || r) }, p, p.exports, r, e, n, t) } return n[i].exports } for (var u = typeof require === 'function' && require, i = 0; i < t.length; i++)o(t[i]); return o } return r })()({
  1: [function (require, module, exports) {
    // Make a request for a user with a given ID
    // axios.get('https://google.com')
    //  .then(function (response) {
    //    // handle success
    //    console.log(response);
    //  })
    //  .catch(function (error) {
    //    // handle error
    //    console.log(error);
    //  })

    console.log(chrome)
  }, {}]
}, {}, [1])
