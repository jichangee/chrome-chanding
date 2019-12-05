// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

$(() => {
  blackListHandler.init(() => {
    appendList(blackListHandler.list());
  });

  $('#add').click(function () {
    onAddClick();
  })

  $('#url').on('keypress', (e) => {
    if (e.keyCode === 13) {
      onAddClick();
    }
  })

  
})

function onAddClick() {
  const url = $('#url').val();
  appendItem(url, blackListHandler.size());
  blackListHandler.append(url);
  $('#url').val('');
}

function closeItem(url, index) {
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