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
/* eslint-disable no-param-reassign */
const crypto = require('crypto');
const processQueue = require('@adobe/helix-shared-process-queue');
const visit = require('unist-util-visit');
const getDimensions = require('image-size');

function hsize(bytes, decimals = 2) {
  if (bytes === 0) {
    return '0   ';
  }
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['  ', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  // eslint-disable-next-line no-restricted-properties
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

async function downloadImages(ctx, tree) {
  // gather all image nodes
  const images = [];
  visit(tree, (node) => {
    if (node.type === 'image' && node.url) {
      images.push(node);
    }
    return visit.CONTINUE;
  });
  let count = 0;

  // download images
  await processQueue(images, async (node) => {
    const ref = crypto.createHash('sha1')
      .update(node.url)
      .digest('hex');
    const key = `${ref}.png`;
    node.data = ctx.images[key];
    if (node.data) {
      return;
    }

    let buffer;
    if (node.url.startsWith('data:image/png;base64,')) {
      buffer = Buffer.from(node.url.split(',').pop(), 'base64');
    } else {
      const idx = String(count).padStart(2, ' ');
      count += 1;

      // CUSTOM
      // image optimization
      if (node.url.indexOf('/media_') !== -1) {
        ctx.log.info(`[${idx}] Using optimized image for ${node.url}`);
        // optimise image already stored
        const u = new URL(node.url);
        u.hash = '';
        u.searchParams.append('auto', 'webp');
        u.searchParams.append('format', 'pjpg');
        u.searchParams.append('width', '2000');
        node.url = u.toString();
      }
      // END OF CUSTOM

      ctx.log.info(`[${idx}] GET ${node.url}`);
      const ret = await fetch(node.url);
      if (!ret.ok) {
        const text = await ret.text();
        ctx.log.error(`[${idx}] ${ret.status} ${text}`);
        return;
      }
      // buffer = await ret.buffer();
      buffer = Buffer.from((await ret.arrayBuffer()));
      ctx.log.info(`[${idx}] ${ret.status} ${hsize(buffer.length).padStart(10)} ${ret.headers.get('content-type')}`);
    }

    node.data = {
      key,
      buffer,
      dimensions: getDimensions(buffer),
    };
    ctx.images[key] = node.data;
  }, 8);
}

module.exports = downloadImages;
