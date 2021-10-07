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
const { Document, Packer } = require('docx');
// const inspect = require('unist-util-inspect');
const all = require('./all');
const handlers = require('./handlers');
const numbering = require('./default-numbering.js');
const sanitizeHtml = require('./mdast-sanitize-html.js');
// const { openArrayBuffer } = require('../zipfile.js');
const { findXMLComponent } = require('./utils');
const downloadImages = require('./mdast-download-images');
const styleXML = require('./template/word/styles.xml').default;

async function toDocx(mdast, log = console) {
  const ctx = {
    handlers,
    style: {},
    paragraphStyle: '',
    images: {},
    listLevel: -1,
    lists: [],
    log,
  };

  // eslint-disable-next-line no-param-reassign
  mdast = sanitizeHtml(mdast);

  // process.stdout.write('==================================================\n');
  // process.stdout.write(inspect(mdast));
  // process.stdout.write('\n');
  // process.stdout.write('==================================================\n');

  await downloadImages(ctx, mdast);

  const children = await all(ctx, mdast);

  // read styles from template.docx. this seems to be the most reliable
  // const templateDoc = await readFile(path.resolve(__dirname, 'template.docx'));
  // const zip = await openArrayBuffer(templateDoc);
  // const styleXML = await zip.read('word/styles.xml', 'utf-8');
  // const styleXML = await readFile(path.resolve(__dirname, 'template', 'word', 'styles.xml'), 'utf-8');

  const doc = new Document({
    numbering,
    externalStyles: styleXML,
    sections: [{
      children,
    }],
  });

  // temporary hack for problems with online word
  const cn = doc.numbering.concreteNumberingMap.get('default-bullet-numbering');
  cn.root[0].root.numId = 1;
  cn.numId = 1;

  // temporary hack for problems with lists in online word
  for (const nb of doc.numbering.abstractNumberingMap.values()) {
    nb.root.forEach((attr) => {
      if (attr.rootKey !== 'w:lvl') {
        return;
      }
      const jc = findXMLComponent(attr, 'w:lvlJc');
      if (jc) {
        const idx = attr.root.indexOf(jc);
        attr.root.splice(idx, 1);
        attr.root.push(jc);
      }
    });
  }

  return Packer.toBlob(doc);
}

module.exports = toDocx;
