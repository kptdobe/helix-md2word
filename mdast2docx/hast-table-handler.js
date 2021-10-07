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

const convert = require('hast-util-is-element/convert.js');
const visit = require('unist-util-visit');
const all = require('hast-util-to-mdast/lib/all.js');

const thead = convert('thead');
const tr = convert('tr');
const cell = convert(['th', 'td']);

/*
   copied and adapted from
   https://github.com/syntax-tree/hast-util-to-mdast/blob/7.1.3/lib/handlers/table.js
 */

// Infer whether the HTML table has a head and how it aligns.
function inspect(node) {
  let headless = true;
  const align = [];
  let rowIndex = 0;
  let cellIndex = 0;

  function visitor(child) {
    // If there is a `thead`, assume there is a header row.
    if (thead(child)) {
      headless = false;
    } else if (tr(child)) {
      rowIndex += 1;
      cellIndex = 0;
    } else if (cell(child)) {
      if (align[cellIndex] === undefined) {
        align[cellIndex] = child.properties.align || null;
      }

      // If there is a th in the first row, assume there is a header row.
      if (headless && rowIndex < 2 && child.tagName === 'th') {
        headless = false;
      }

      cellIndex += 1;
      return visit.SKIP;
    }
    return visit.CONTINUE;
  }

  visit(node, 'element', visitor);

  return { align, headless };
}

// Ensure the cells in a row are properly structured.
function toCells(children, info) {
  const nodes = [];
  let queue;

  children.forEach((node) => {
    if (node.type === 'tableCell') {
      if (queue) {
        // eslint-disable-next-line no-param-reassign
        node.children = queue.concat(node.children);
        queue = undefined;
      }

      nodes.push(node);
    } else {
      if (!queue) {
        queue = [];
      }
      queue.push(node);
    }
  });

  if (queue) {
    let node = nodes[nodes.length - 1];

    if (!node) {
      node = { type: 'tableCell', children: [] };
      nodes.push(node);
    }

    node.children = node.children.concat(queue);
  }

  // add empty cells if there are more in the table
  for (let index = nodes.length; index < info.align.length; index += 1) {
    nodes.push({ type: 'tableCell', children: [] });
  }

  return nodes;
}

// Ensure the rows are properly structured.
function toRows(children, info) {
  const nodes = [];
  let queue;

  // Add an empty header row.
  // we don't need extra header rows
  // if (info.headless) {
  //   nodes.push({ type: 'tableRow', children: [] });
  // }

  children.forEach((node) => {
    if (node.type === 'tableRow') {
      if (queue) {
        // eslint-disable-next-line no-param-reassign
        node.children = queue.concat(node.children);
        queue = undefined;
      }

      nodes.push(node);
    } else {
      if (!queue) queue = [];
      queue.push(node);
    }
  });

  if (queue) {
    const node = nodes[nodes.length - 1];
    node.children = node.children.concat(queue);
  }
  nodes.forEach((node) => {
    // eslint-disable-next-line no-param-reassign
    node.children = toCells(node.children, info);
  });

  return nodes;
}

function table(h, node) {
  const info = inspect(node);
  return h(node, 'table', { align: info.align }, toRows(all(h, node), info));
}

module.exports = table;
