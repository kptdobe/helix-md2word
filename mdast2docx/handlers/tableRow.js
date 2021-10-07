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
const { TableRow } = require('docx');
const all = require('../all');

async function tableRow(ctx, node, parent, siblings) {
  // adjust columnWidth
  if (!ctx.table.columnWidth) {
    ctx.table.columnWidth = ctx.table.width / node.children.length;
  }

  const children = await all(ctx, node);
  return new TableRow({
    children,
    tableHeader: siblings.length === 0,
  });
}
module.exports = tableRow;
