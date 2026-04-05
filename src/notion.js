const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const HISTORY_FILE = path.join(__dirname, '..', 'history.json');

/**
 * Loads recent note IDs from the history file.
 * @returns {string[]} An array of note IDs.
 */
function loadHistory() {
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error parsing history.json:', e);
      return [];
    }
  }
  return [];
}

/**
 * Saves recent note IDs to the history file.
 * @param {string[]} history - The array of note IDs to save.
 */
function saveHistory(history) {
  try {
    // Keep only the last 4 notes (2 days * 2 notes) to prevent repeating from the last 2 days
    const recentHistory = history.slice(-4);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(recentHistory, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving history.json:', e);
  }
}

/**
 * Helper to fetch and format the text content of a Notion block/page.
 */
async function getPageContent(notion, pageId) {
  try {
    const response = await notion.blocks.children.list({ block_id: pageId });
    let content = '';
    for (const block of response.results) {
      if (block.type === 'paragraph' && block.paragraph.rich_text.length > 0) {
        content += block.paragraph.rich_text.map(t => t.plain_text).join('') + '\n';
      } else if (block.type.startsWith('heading_')) {
        content += block[block.type].rich_text.map(t => t.plain_text).join('') + '\n';
      } else if (block.type === 'bulleted_list_item') {
        content += '• ' + block.bulleted_list_item.rich_text.map(t => t.plain_text).join('') + '\n';
      } else if (block.type === 'numbered_list_item') {
        content += '1. ' + block.numbered_list_item.rich_text.map(t => t.plain_text).join('') + '\n';
      } else if (block.type === 'to_do') {
        const checked = block.to_do.checked ? '✅' : '☐';
        content += `${checked} ` + block.to_do.rich_text.map(t => t.plain_text).join('') + '\n';
      }
    }
    return content.trim() || '(Empty note)';
  } catch (e) {
    console.error('Error fetching page content:', e);
    return '(Error fetching content)';
  }
}

/**
 * Recursively finds actual "note" pages inside databases or nested child pages.
 */
async function gatherNotes(notion, parentBlockId) {
    let notes = [];
    try {
        const response = await notion.blocks.children.list({ block_id: parentBlockId });
        for (const block of response.results) {
            if (block.type === 'child_page') {
                const childNotes = await gatherNotes(notion, block.id);
                notes = notes.concat(childNotes);
            } else if (block.type === 'child_database') {
                const dbResponse = await notion.databases.query({ database_id: block.id });
                for (const page of dbResponse.results) {
                    notes.push(page);
                }
            }
        }
    } catch (e) {
        console.error('Error fetching block', parentBlockId, e.message);
    }
    return notes;
}

/**
 * Fetches 2 random notes from Notion that haven't been shown in the last 2 days.
 * @returns {Promise<string>} A formatted Notion report.
 */
async function getNotionNotesRevision() {
  const secret = process.env.NOTION_API_SECRET;
  const pageId = process.env.NOTION_DATABASE_ID; // The user provided a Page ID

  if (!secret || secret === 'your_notion_api_secret_here' || !pageId || pageId === 'your_notion_database_id_here') {
    return '<b>📓 Notion Notes Revision</b>\n\nNotion API Secret or ID is missing in .env.';
  }

  const notion = new Client({ auth: secret });

  try {
    // Collect all actual notes from sub-databases and sub-pages
    const allNotes = await gatherNotes(notion, pageId);
    
    if (allNotes.length === 0) {
      return '<b>📓 Notion Notes Revision</b>\n\nNo sub-pages (notes) found in your Notion page databases.';
    }

    const history = loadHistory();

    // Filter out notes that are in the history
    const availableNotes = allNotes.filter(page => !history.includes(page.id));

    // If availableNotes is less than 2, we might have exhausted the unique notes. 
    // Fallback: pick from all results if needed.
    const pool = availableNotes.length >= 2 ? availableNotes : allNotes;

    // Pick 2 random notes
    const selected = [];
    while (selected.length < 2 && pool.length > 0) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      selected.push(pool[randomIndex]);
      pool.splice(randomIndex, 1); // remove to avoid duplicate picking
    }

    // Format output and update history
    let report = '<b>📓 Daily Notion Notes Revision</b>\n\n';
    
    for (let i = 0; i < selected.length; i++) {
      const page = selected[i];
      
      // Find the title property among the page properties
      let title = 'Untitled Note';
      if (page.properties) {
          const titleProp = Object.values(page.properties).find(p => p.type === 'title');
          if (titleProp && titleProp.title && titleProp.title.length > 0) {
              title = titleProp.title.map(t => t.plain_text).join('');
          }
      }
      
      // Fetch the actual text content of the note
      const content = await getPageContent(notion, page.id);
      
      report += `📌 <b>Subject:</b> ${title}\n`;
      report += `📖 <b>Content:</b>\n${content}\n`;
      if (i < selected.length - 1) {
        report += `\n—\n\n`;
      }

      history.push(page.id);
    }

    saveHistory(history);

    return report.trim();
  } catch (error) {
    console.error('Error fetching from Notion:', error.message);
    return '<b>📓 Notion Notes Revision</b>\n\nError connecting to Notion. Please check your token and Page/Database ID.';
  }
}

module.exports = {
  getNotionNotesRevision
};
