import unified from 'unified';
import remark from 'remark-parse';
import gfm from 'remark-gfm';
import { remarkMatter } from '@adobe/helix-markdown-support';
import toDocx from 'mdast2docx';

const md2word = async (md, logger) => {
  const mdast = unified()
    .use(remark, { position: false })
    .use(gfm)
    .use(remarkMatter)
    .parse(md);

  const buffer = await toDocx(mdast, logger);
  return buffer;
}

export {
  md2word
};