'use strict';
let blackList = [];
chrome.storage.local.get('blackList', function (res) {
  blackList = res.blackList ? res.blackList : [];
  console.log('blackList', blackList);
  const host = window.location.host;
  if (blackList.some(item => host.indexOf(item) > -1)) {
    blockPage();
  }
})

function blockPage() {
  const template = `
    <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100vh; background: #fff;">
      <h1 style="font-size: 60px;">Hello World!</h1>
    </div>
  `
  document.body.innerHTML = template;
}
