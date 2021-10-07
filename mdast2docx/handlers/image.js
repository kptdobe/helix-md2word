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
const { ImageRun, Drawing } = require('docx');
const { findXMLComponent } = require('../utils');

// max image width (6.5") and height (2")
const LIMITS = {
  width: 914400 * 6.5,
  height: 914400 * 2.0,
};

// max image width (2") and height (1") in tables
const LIMITS_TABLE = {
  width: 914400 * 2.0,
  height: 914400,
};

async function image(ctx, node) {
  const { data } = node;
  if (!data) {
    return undefined;
  }
  let x = data.dimensions.width * 9525;
  let y = data.dimensions.height * 9525;
  const limits = ctx.tableAlign ? LIMITS_TABLE : LIMITS;
  if (x > limits.width) {
    y = Math.round((limits.width * y) / x);
    x = limits.width;
  }
  if (y > limits.height) {
    x = Math.round((limits.height * x) / y);
    y = limits.height;
  }

  const imageData = {
    stream: data.buffer,
    fileName: data.key,
    transformation: {
      pixels: {
        x: Math.round(data.dimensions.width),
        y: Math.round(data.dimensions.height),
      },
      emus: {
        x,
        y,
      },
    },
  };

  const drawing = new Drawing(imageData, { floating: false });
  // hack to get document properties to set alt text
  if (node.title || node.alt) {
    const docProps = findXMLComponent(drawing, 'wp:inline/wp:docPr/_attr');
    if (docProps && docProps.root) {
      if (node.title) {
        docProps.root.title = node.title;
      }
      if (node.alt) {
        docProps.root.descr = node.alt;
      }
    }
  }

  // create picture
  const pic = new ImageRun({
    data: data.buffer,
    transformation: data.dimensions,
  });
  // replace drawing
  const oldDrawing = findXMLComponent(pic, 'w:drawing');
  const idx = pic.root.indexOf(oldDrawing);
  if (idx >= 0) {
    pic.root.splice(idx, 1);
  }
  pic.root.push(drawing);
  pic.key = data.key;
  pic.imageData = imageData;
  return pic;
}
module.exports = image;
