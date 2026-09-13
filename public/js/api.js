/* ============================================================
   KIDAMEgebeya — API fetch wrapper
   Same-origin fetch() with JSON + httpOnly-cookie credentials.
   ============================================================ */

const API = (() => {
  async function request(method, url, body) {
    const opts = { method, credentials: 'include', headers: {} };
    if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(url, opts);
    let data = null;
    try { data = await res.json(); } catch { /* non-JSON body */ }
    if (!res.ok) {
      const err = new Error((data && data.error) || `Request failed (${res.status})`);
      err.status = res.status;
      err.data = data;
      if (data && data.code) err.code = data.code;
      throw err;
    }
    return data;
  }
  return {
    get: (u) => request('GET', u),
    post: (u, b) => request('POST', u, b),
    put: (u, b) => request('PUT', u, b),
    patch: (u, b) => request('PATCH', u, b),
    del: (u) => request('DELETE', u),
    request,
  };
})();