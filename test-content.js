require('dotenv').config();
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_SECRET });

async function getPageContent(notion, pageId) {
  try {
    const response = await notion.blocks.children.list({ block_id: pageId });
    let content = '';
    for (const block of response.results) {
      if (block.type === 'paragraph' && block.paragraph.rich_text.length > 0) {
        content += block.paragraph.rich_text.map(t => t.plain_text).join('') + '\n';
      } else if (block.type.startsWith('heading_')) {
        content += '\n<b>' + block[block.type].rich_text.map(t => t.plain_text).join('') + '</b>\n';
      } else if (block.type === 'bulleted_list_item') {
        content += '• ' + block.bulleted_list_item.rich_text.map(t => t.plain_text).join('') + '\n';
      } else if (block.type === 'numbered_list_item') {
        content += '1. ' + block.numbered_list_item.rich_text.map(t => t.plain_text).join('') + '\n';
      } else if (block.type === 'child_page') {
        content += '📄 ' + block.child_page.title + '\n';
      } else if (block.type === 'child_database') {
        content += '🗄️ ' + block.child_database.title + '\n';
      }
    }
    return content.trim() || '(Empty note)';
  } catch (e) {
    console.error('Error fetching page content:', e);
    return '(Error fetching content)';
  }
}

async function test() {
  const c = await getPageContent(notion, '339f70d1edfb81319862e2cecd7c765f');
  console.log(c);
}
test();