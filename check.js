const fetch = require('node-fetch'); // If not available, use native fetch in node 18+
fetch('https://erp.luludecor.vn')
  .then(r => r.text())
  .then(html => {
    const jsMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
    if (jsMatch) {
      fetch('https://erp.luludecor.vn' + jsMatch[1])
        .then(r => r.text())
        .then(js => {
          console.log(js.includes('Đã xảy ra lỗi giao diện') ? 'NEW VERSION IS LIVE' : 'OLD VERSION IS LIVE');
        });
    } else {
      console.log('NO JS BUNDLE FOUND', html.substring(0, 200));
    }
  });
