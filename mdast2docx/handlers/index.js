/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

'use strict';

const brk = require('./break');
const characterStyle = require('./characterStyle');
const code = require('./code');
const heading = require('./heading');
const html = require('./html');
const image = require('./image');
const inlineCode = require('./inlineCode');
const link = require('./link');
const list = require('./list');
const listItem = require('./listItem');
const paragraph = require('./paragraph');
const paragraphStyle = require('./paragraphStyle');
const root = require('./root');
const table = require('./table');
const tableRow = require('./tableRow');
const tableCell = require('./tableCell');
const text = require('./text');
const thematicBreak = require('./thematicBreak');

module.exports = {
  blockquote: paragraphStyle('Quote'),
  break: brk,
  code,
  delete: characterStyle('strike'),
  emphasis: characterStyle('italics'),
  strong: characterStyle('bold'),
  underline: characterStyle('underline'),
  subScript: characterStyle('subScript'),
  superScript: characterStyle('superScript'),
  heading,
  html,
  image,
  inlineCode,
  link,
  list,
  listItem,
  paragraph,
  root,
  table,
  tableRow,
  tableCell,
  text,
  thematicBreak,
};
