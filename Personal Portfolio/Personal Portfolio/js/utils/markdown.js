/* Simple Markdown to HTML Parser */

export function parseMarkdown(markdown) {
  if (!markdown) return '';
  
  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.*?)$/gm, '<h3 style="margin-top: var(--spacing-lg); margin-bottom: var(--spacing-md); font-size: var(--font-size-lg); font-weight: 700; color: var(--color-text-primary);">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 style="margin-top: var(--spacing-lg); margin-bottom: var(--spacing-md); font-size: var(--font-size-2xl); font-weight: 700; color: var(--color-text-primary);">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 style="margin-top: var(--spacing-lg); margin-bottom: var(--spacing-md); font-size: var(--font-size-3xl); font-weight: 700; color: var(--color-text-primary);">$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 700;">$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong style="font-weight: 700;">$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>');
  html = html.replace(/_(.+?)_/g, '<em style="font-style: italic;">$1</em>');
  
  // Code blocks
  html = html.replace(/```(.*?)\n([\s\S]*?)```/g, '<pre style="background-color: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: 8px; overflow-x: auto; margin: var(--spacing-md) 0;"><code style="font-family: var(--font-family-mono); color: var(--color-text-primary);">$2</code></pre>');
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code style="font-family: var(--font-family-mono); font-size: 0.9em; background-color: var(--color-bg-secondary); padding: 0.2em 0.4em; border-radius: 4px; color: var(--color-accent);">$1</code>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: var(--color-accent); text-decoration: none; transition: color var(--transition-fast);" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: var(--spacing-md) 0;" loading="lazy" />');
  
  // Blockquotes
  html = html.replace(/^> (.*?)$/gm, '<blockquote style="border-left: 4px solid var(--color-accent); padding-left: var(--spacing-md); margin-left: 0; margin-bottom: var(--spacing-md); font-style: italic; color: var(--color-text-secondary);">$1</blockquote>');
  
  // Unordered lists
  html = html.replace(/^\* (.*?)$/gm, '<li style="margin-bottom: var(--spacing-sm);">$1</li>');
  html = html.replace(/^\- (.*?)$/gm, '<li style="margin-bottom: var(--spacing-sm);">$1</li>');
  html = html.replace(/(<li.*?<\/li>)/s, '<ul style="margin-left: var(--spacing-lg); margin-bottom: var(--spacing-md);">$1</ul>');
  
  // Ordered lists
  html = html.replace(/^\d+\. (.*?)$/gm, '<li style="margin-bottom: var(--spacing-sm);">$1</li>');
  
  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p style="margin-bottom: var(--spacing-md); line-height: var(--line-height-relaxed);">');
  html = '<p style="margin-bottom: var(--spacing-md); line-height: var(--line-height-relaxed);">' + html + '</p>';
  
  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*>\s*<\/p>/g, '');
  html = html.replace(/<p[^>]*>\s*<(h[1-6]|ul|ol|blockquote|pre)/g, '<$1');
  html = html.replace(/<\/(h[1-6]|ul|ol|blockquote|pre)>\s*<\/p>/g, '</$1');
  
  return html;
}

export function parseRichText(richText, assetMap = {}) {
  if (!richText || !richText.content) return '';
  
  return richText.content
    .map(block => parseRichTextBlock(block, assetMap))
    .join('');
}

function parseRichTextBlock(block, assetMap = {}) {
  if (!block) return '';
  
  switch (block.nodeType) {
    case 'paragraph':
      return `<p style="margin-bottom: var(--spacing-md); line-height: var(--line-height-relaxed);">${parseRichTextContent(block.content, assetMap)}</p>`;
    
    case 'heading-1':
      return `<h1 style="margin-top: var(--spacing-lg); margin-bottom: var(--spacing-md); font-size: var(--font-size-3xl); font-weight: 700; color: var(--color-text-primary);">${parseRichTextContent(block.content, assetMap)}</h1>`;
    
    case 'heading-2':
      return `<h2 style="margin-top: var(--spacing-lg); margin-bottom: var(--spacing-md); font-size: var(--font-size-2xl); font-weight: 700; color: var(--color-text-primary);">${parseRichTextContent(block.content, assetMap)}</h2>`;
    
    case 'heading-3':
      return `<h3 style="margin-top: var(--spacing-lg); margin-bottom: var(--spacing-md); font-size: var(--font-size-lg); font-weight: 700; color: var(--color-text-primary);">${parseRichTextContent(block.content, assetMap)}</h3>`;
    
    case 'unordered-list':
      return `<ul style="margin-left: var(--spacing-lg); margin-bottom: var(--spacing-md);">${block.content.map(item => `<li style="margin-bottom: var(--spacing-sm);">${parseRichTextContent(item.content, assetMap)}</li>`).join('')}</ul>`;
    
    case 'ordered-list':
      return `<ol style="margin-left: var(--spacing-lg); margin-bottom: var(--spacing-md);">${block.content.map(item => `<li style="margin-bottom: var(--spacing-sm);">${parseRichTextContent(item.content, assetMap)}</li>`).join('')}</ol>`;
    
    case 'blockquote':
      return `<blockquote style="border-left: 4px solid var(--color-accent); padding-left: var(--spacing-md); margin-left: 0; margin-bottom: var(--spacing-md); font-style: italic; color: var(--color-text-secondary);">${parseRichTextContent(block.content, assetMap)}</blockquote>`;
    
    case 'embedded-asset-block':
      if (block.data && block.data.target && block.data.target.sys && block.data.target.sys.id) {
        const assetId = block.data.target.sys.id;
        const imageUrl = assetMap[assetId];
        if (imageUrl) {
          return `<img src="${imageUrl}" alt="embedded asset" style="max-width: 100%; height: auto; border-radius: 8px; margin: var(--spacing-md) 0;" loading="lazy" />`;
        }
      }
      return '';
    
    case 'hr':
      return '<hr style="border: none; border-top: 1px solid var(--color-border); margin: var(--spacing-lg) 0;" />';
    
    default:
      return '';
  }
}

function parseRichTextContent(content, assetMap = {}) {
  if (!content) return '';
  
  return content
    .map(node => {
      if (node.nodeType === 'text') {
        let text = node.value;
        
        if (node.marks && node.marks.length > 0) {
          node.marks.forEach(mark => {
            if (mark.type === 'bold') {
              text = `<strong style="font-weight: 700;">${text}</strong>`;
            } else if (mark.type === 'italic') {
              text = `<em style="font-style: italic;">${text}</em>`;
            } else if (mark.type === 'code') {
              text = `<code style="font-family: var(--font-family-mono); font-size: 0.9em; background-color: var(--color-bg-secondary); padding: 0.2em 0.4em; border-radius: 4px; color: var(--color-accent);">${text}</code>`;
            }
          });
        }
        
        return text;
      } else if (node.nodeType === 'hyperlink') {
        return `<a href="${node.data.uri}" style="color: var(--color-accent); text-decoration: none; transition: color var(--transition-fast);" target="_blank" rel="noopener noreferrer">${parseRichTextContent(node.content, assetMap)}</a>`;
      }
      
      return '';
    })
    .join('');
}
