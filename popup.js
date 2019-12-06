// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

$(() => {
  blackListHandler.init(() => {
    appendList(blackListHandler.list());
    getSettingByStorage();
  });

  $('#add').click(onAddClick)
  $('#save').click(() => {
    saveDateTimeToSetting().then(() => {
      $('#save').html('保存成功').addClass('off');
      setTimeout(() => {
        $('#save').html('保存').removeClass('off');
      }, 1000);
    })
  })

  $('#url').on('keypress', (e) => {
    if (e.keyCode === 13) {
      onAddClick();
    }
  })

  $('#force').click(onForce);
  createWeekCheckboxList();

  checkForce();
  
})
let force = false;
// force
/**
 * 检测是否需要强制开启禅定
 */
function checkForce() {
  chrome.storage.local.get(['setting', 'force'], (res) => {
    const dateTime = res.setting ? res.setting.dateTime : {};
    force = !!res.force
    if (checkDateTime(dateTime) && force) {
      $('#force').html('已开启').addClass('off');
      $('#forceTip').html(`将在${dateTime.endTime}解除限制`);
      $('#save').addClass('off');
    } else {
      // 不在生效时间内
      chrome.storage.local.set({
        force: false
      })
    }
  })
}
function onForce() {
  if (confirm('开启后无法修改生效时间和删减屏蔽列表，直到时间不在生效时间内后才解锁')) {
    chrome.storage.local.set({
      force: true
    }, () => {
      checkForce();
    })
  }
}
// list
function onAddClick() {
  const url = $('#url').val();
  if (url === '') return;
  if (url.length <= 3 && !confirm(`确定要屏蔽【${url}】吗？`)) {
    return;
  }
  if (blackListHandler.list().indexOf(url) > -1) {
    alert('添加失败，已存在该网址');
    return;
  }
  appendItem(url, blackListHandler.size());
  blackListHandler.append(url);
  $('#url').val('');
}

function closeItem(url, index) {
  if (force) {
    alert('目前无法删除');
    return;
  };

  blackListHandler.splice(url);
  $('#list li').eq(index).remove();
}
function appendList(list) {
  list.forEach((url, index) => {
    appendItem(url, index);
  })
}
function appendItem(url, index) {
  const el = $(`<li>${url} <span class="close"></span></li>`);
  $('#list').append(el);
  el.click(() => {
    closeItem(url, index)
  })
}
// setting
function createWeekCheckboxList() {
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const els = weeks.map((item, index) => createWeekCheckboxItem(item, index));
  const $parents = $('.date-container');
  $parents.append(els.join(''));
}
function createWeekCheckboxItem(title, index) {
  return `
  <label class="checkbox">
    <input type="checkbox" name="week" value="${index}">
    <span>${title}</span>
  </label>`
}
function getSettingByElem() {
  const weeks = [];
  $('.date-container input:checked').each((index, item) => weeks.push(Number($(item).val())));
  const startTime = $('#startTime').val();
  const endTime = $('#endTime').val();
  return {
    weeks,
    startTime,
    endTime
  }
}
function saveDateTimeToSetting() {
  const dateTime = getSettingByElem();
  return new Promise((resolve) => {
    chrome.storage.local.get('setting', (res) => {

      const setting = res.setting ? res.setting : {};
      chrome.storage.local.set({
        setting: {
          ...setting,
          dateTime
        }
      });

      resolve();
    })

  })
  
}
function getSettingByStorage() {
  chrome.storage.local.get('setting', (res) => {
    const setting = res.setting ? res.setting : {};
    const dateTime = setting.dateTime ? setting.dateTime : {};
    const { weeks, startTime, endTime } = dateTime;
    console.log('dateTime', dateTime);
    if (weeks) {
      weeks.forEach(week => {
        $('.date-container input').eq(week).attr('checked', true);
      })
    }
    if (startTime) {
      $('#startTime').val(startTime);
    }
    if (endTime) {
      $('#endTime').val(endTime);
    }
  })
}
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

// blackListHandler
const blackListHandler = {
  KEY: 'CHANDING_BLACKLIST',
  blackList: [],
  init(cb) {
    this._readList().then((blackList) => {
      this.blackList = blackList;
      cb && cb();
    })
  },
  size() {
    return this.blackList.length
  },
  list() {
    return this.blackList;
  },
  append(url) {
    if (url === '') return;
    this.blackList.push(url);
    this._saveList(this.blackList);
  },
  splice(url) {
    const index = this.blackList.findIndex(item => item === url);
    if (index === -1) {
      return;
    }
    this.blackList.splice(index, 1);
    this._saveList(this.blackList);
  },
  clear() {
    this.blackList = [];
    chrome.storage.local.remove(this.KEY);
  },
  _saveList(list) {
    if (Array.isArray(list)) {
      chrome.storage.local.set({
        blackList: list
      })
    }
  },
  _readList() {
    return new Promise((resolve) => {
      chrome.storage.local.get('blackList', function (res) {
        const blackList = res.blackList ? res.blackList : [];
        resolve(blackList);
      })
    })
  }
}

// common
function fixNumber(number) {
  number = Number(number);
  if (number < 10) {
    return `0${number}`
  }
  return `${number}`;
}