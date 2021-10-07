/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
const visit = require('unist-util-visit');
// const inspect = require('unist-util-inspect');
const unified = require('unified');
const parse = require('rehype-parse');
const toMdast = require('hast-util-to-mdast');
const tableHandler = require('./hast-table-handler.js');

/**
 * Creates simple format handler
 * @param type
 */
function formatHandler(type) {
  return (h, node) => h(node, type, node.children);
}

/**
 * Handler for `<markdown>` elements.
 * @param {[]} mdasts array of mdast sub trees
 */
function mdHandler(mdasts) {
  return (h, node) => {
    const { idx } = node.properties;
    return mdasts[idx];
  };
}

/**
 * Sanitizes html:
 * - collapses consecutive html content (simply concat all nodes until the last html sibling)
 * - parses and converts them to mdast again
 *
 * @param {object} tree
 * @returns {object} The modified (original) tree.
 */
function sanitizeHtml(tree) {
  const mdInserts = [];

  visit(tree, (node, index, parent) => {
    const { children: siblings = [] } = parent || {};

    // collapse html blocks
    if (node.type === 'html') {
      // find last html block
      let lastHtml = siblings.length - 1;
      while (lastHtml >= index) {
        if (siblings[lastHtml].type === 'html') {
          break;
        }
        lastHtml -= 1;
      }

      let html = node.value;
      if (lastHtml > index) {
        // remove all html nodes
        const removed = siblings.splice(index + 1, lastHtml - index);

        // and append to html as special markdown element marker which is then handled in the
        // mdHandler for the `<markdown>` elements.
        removed.forEach((n) => {
          if (n.type === 'html' || n.type === 'text') {
            html += n.value;
          } else {
            html += `<markdown idx="${mdInserts.length}"></markdown>`;
          }
          mdInserts.push(n);
        });
      }

      // try parse html
      const hast = unified()
        .use(parse, { fragment: true })
        .parse(html);

      // convert to mdast with extra handlers
      const mdast = toMdast(hast, {
        handlers: {
          u: formatHandler('underline'),
          sub: formatHandler('subScript'),
          sup: formatHandler('superScript'),
          table: tableHandler,
          markdown: mdHandler(mdInserts),
        },
      });

      // console.log('************************************');
      // // console.log('>>>>', html);
      // process.stdout.write(inspect(hast));
      // process.stdout.write('\n');
      // console.log('************************************');

      // inject children of parsed tree
      siblings.splice(index, 1, ...mdast.children);

      // continue after
      return index + mdast.children.length;
    }

    return visit.CONTINUE;
  });
  return tree;
}

module.exports = sanitizeHtml;
