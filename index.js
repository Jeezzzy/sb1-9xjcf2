import axios from 'axios';
import cheerio from 'cheerio';
import prompts from 'prompts';
import { URL } from 'url';

async function getLinksFromPage(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const links = new Set();

    $('a').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        try {
          const absoluteUrl = new URL(href, url).toString();
          links.add(absoluteUrl);
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });

    return Array.from(links);
  } catch (error) {
    console.error(`Error fetching links from ${url}:`, error.message);
    return [];
  }
}

async function getTextFromPage(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Remove unnecessary elements
    $('script, style, nav, header, footer').remove();
    
    // Get main text content
    return $('body').text().trim().replace(/\s+/g, ' ');
  } catch (error) {
    console.error(`Error fetching text from ${url}:`, error.message);
    return '';
  }
}

async function main() {
  const { url } = await prompts({
    type: 'text',
    name: 'url',
    message: 'Enter the URL to analyze:'
  });

  console.log('Fetching links...');
  const links = await getLinksFromPage(url);
  console.log(`Found ${links.length} links`);

  for (const link of links) {
    console.log(`\nAnalyzing ${link}...`);
    const text = await getTextFromPage(link);
    if (text) {
      console.log('Content:', text.substring(0, 150) + '...');
    }
  }
}

main().catch(console.error);