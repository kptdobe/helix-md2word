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
const { ExternalHyperlink, ImageRun, TextRun } = require('docx');
const all = require('../all');

/**
 * Handles links.
 *
 * @param ctx
 * @param node
 * @returns {Promise<[]>}
 */
async function link(ctx, node) {
  const result = [];
  ctx.style.style = 'Hyperlink';

  for (const child of await all(ctx, node)) {
    // links on images can't be edited in word. so create a link below the image
    if (child instanceof ImageRun) {
      result.push(
        child,
        new TextRun({ text: '', break: 1 }),
        new ExternalHyperlink({
          child: new TextRun({ text: node.url, style: 'Hyperlink' }),
          link: node.url,
        }),
        new TextRun({ text: '', break: 1 }),
      );
    } else {
      result.push(new ExternalHyperlink({
        child,
        link: node.url,
      }));
    }
  }
  delete ctx.style.style;
  return result;
}
module.exports = link;
