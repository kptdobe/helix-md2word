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
const { Paragraph, Table, WidthType } = require('docx');
const all = require('../all');

async function table(ctx, node) {
  const oldTable = ctx.table;
  ctx.table = {
    // remember the table width (the column width will be calculated in the tableRow handler)
    // default width: Letter Width - Margin = 8.5" - 2" = 6.5". the unit is 1/1440 inches.
    width: oldTable ? oldTable.columnWidth : 1440 * 6.5,
    align: node.align || [],
  };
  // process the rows
  const rows = await all(ctx, node);

  // and remember the column width
  const { columnWidth } = ctx.table;
  ctx.table = oldTable;

  // use the same width for all columns
  const numCols = rows.length ? rows[0].CellCount : 0;
  const columnWidths = new Array(numCols).fill(Math.round(columnWidth));

  const tbl = new Table({
    style: 'PageBlock',
    rows,
    columnWidths,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
  });

  // add empty paragraph for better separation in word
  return [tbl, new Paragraph([])];
}
module.exports = table;
