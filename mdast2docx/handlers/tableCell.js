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
const {
  Table, TableCell, Paragraph, AlignmentType,
} = require('docx');
const all = require('../all');

const ALIGN = {
  left: null,
  right: AlignmentType.RIGHT,
  center: AlignmentType.CENTER,
};

async function tableCell(ctx, node, parent, siblings) {
  const children = await all(ctx, node);
  const alignment = ALIGN[ctx.table.align[siblings.length]];

  const content = [];
  let leaves = [];
  // wrap non block elements with paragraph
  for (let i = 0; i < children.length; i += 1) {
    const child = children[i];
    if ((child instanceof Paragraph) || (child instanceof Table)) {
      if (leaves.length) {
        content.push(new Paragraph({ alignment, children: leaves }));
      }
      content.push(child);
      leaves = [];
    } else {
      leaves.push(child);
    }
  }
  if (leaves.length) {
    content.push(new Paragraph({ alignment, children: leaves }));
  }

  return new TableCell({
    children: content,
  });
}
module.exports = tableCell;
