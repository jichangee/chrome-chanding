'use strict';
chrome.storage.local.get(['blackList', 'setting'], function (res) {
  console.log(res);
  const blackList = res.blackList ? res.blackList : [];
  const setting = res.setting ? res.setting : {};
  const dateTime = setting.dateTime;
  if (dateTime) {
    const host = window.location.host;
    if (
      checkDateTime(dateTime) &&
      blackList.some(item => host.indexOf(item) > -1)
    ) {
      blockPage();
    }
  }

})
function checkDateTime(dateTime) {
  const now = new Date();
  const nowWeek = now.getDay();
  const nowTime = Number(`${now.getHours()}.${fixNumber(now.getMinutes())}`);
  const settingStartTime = Number(dateTime.startTime.replace(':', '.'));
  const settingEndTime = Number(dateTime.endTime.replace(':', '.'));
  const settingWeeks = dateTime.weeks;
  return (
    settingWeeks.indexOf(nowWeek) > -1 && 
    nowTime >= settingStartTime && 
    nowTime < settingEndTime
  );
}

function blockPage() {
  const template = `
    <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100vh; background: #fff;">
      <div style="margin-top: -100px;">
        <h1 style="font-size: 60px;">富强、民主、文明、和谐</h1>
        <h1 style="font-size: 60px;">自由、平等、公正、法治</h1>
        <h1 style="font-size: 60px;">爱国、敬业、诚信、友善</h1>
      </div>
    </div>
  `
  document.body.innerHTML = template;
}
function fixNumber(number) {
  number = Number(number);
  if (number < 10) {
    return `0${number}`
  }
  return `${number}`;
}