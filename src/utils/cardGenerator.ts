
export interface TextArea {
  id: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontFamily: string;
  fontSize: number;
  color: string;
  alignment: "left" | "center" | "right";
  direction: "ltr" | "rtl";
}

export interface CardTemplate {
  id: string;
  name: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  textAreas: TextArea[];
}

// Function to generate a unique card ID
export const generateCardId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Function to generate a shareable link for a card
export const generateShareableLink = (cardId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/card/${cardId}`;
};

// Function to draw text on the canvas with proper alignment and direction
export const drawTextOnCanvas = (
  ctx: CanvasRenderingContext2D, 
  textArea: TextArea, 
  name: string = ""
): void => {
  const { content, x, y, width, height, fontFamily, fontSize, color, alignment, direction } = textArea;
  
  // Replace [name] placeholder with the actual name if provided
  const finalContent = name ? content.replace(/\[name\]/g, name) : content;
  
  // Set the font and prepare text rendering
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = alignment;
  ctx.direction = direction;
  
  // Calculate position based on alignment
  let textX = x;
  if (alignment === "center") textX = x + width / 2;
  if (alignment === "right") textX = x + width;
  
  // Handle text wrapping and positioning
  const words = finalContent.split(' ');
  let line = '';
  let lineY = y + fontSize; // Start y position
  
  // For single line mode, just draw at the vertical center of the box
  if (words.length === 1 && !words[0].includes('\n')) {
    const verticalCenter = y + (height / 2) + (fontSize / 3); // Approximate vertical centering
    ctx.fillText(finalContent, textX, verticalCenter);
    return;
  }
  
  // For multi-line text
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    
    // If adding this word exceeds the width, start a new line
    if (metrics.width > width && i > 0) {
      ctx.fillText(line, textX, lineY);
      line = words[i] + ' ';
      lineY += fontSize + 5; // Line height with spacing
    } else {
      line = testLine;
    }
  }
  
  // Draw the last line
  if (line.trim()) {
    ctx.fillText(line.trim(), textX, lineY);
  }
};

// Function to render a card to a canvas
export const renderCardToCanvas = (
  canvas: HTMLCanvasElement,
  template: CardTemplate, 
  name: string = ""
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }
    
    // Set canvas dimensions to match template image
    canvas.width = template.imageWidth;
    canvas.height = template.imageHeight;
    
    // Load and draw the background image
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Draw each text area
      template.textAreas.forEach(textArea => {
        drawTextOnCanvas(ctx, textArea, name);
      });
      
      resolve();
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    img.src = template.imageUrl;
  });
};

// Function to download the canvas as a PNG
export const downloadCanvasAsImage = (canvas: HTMLCanvasElement, filename: string): void => {
  // Create a temporary link element
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 1.0);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Function to process bulk names and generate images
export const processBulkExport = async (
  template: CardTemplate, 
  names: string[]
): Promise<Blob[]> => {
  const blobs: Blob[] = [];
  const canvas = document.createElement('canvas');
  
  for (const name of names) {
    if (!name.trim()) continue;
    
    await renderCardToCanvas(canvas, template, name.trim());
    
    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else resolve(new Blob([]));
      }, 'image/png', 1.0);
    });
    
    blobs.push(blob);
  }
  
  return blobs;
};

// Simple in-memory storage for templates (in a real app, use a database)
let templates: CardTemplate[] = [];

// Mock functions to save and retrieve templates (in a real app, use a database)
export const saveTemplate = (template: CardTemplate): void => {
  const existingIndex = templates.findIndex(t => t.id === template.id);
  if (existingIndex >= 0) {
    templates[existingIndex] = template;
  } else {
    templates.push(template);
  }
  // Save to localStorage for persistence
  localStorage.setItem('cardTemplates', JSON.stringify(templates));
};

export const getTemplates = (): CardTemplate[] => {
  // Load from localStorage
  const storedTemplates = localStorage.getItem('cardTemplates');
  if (storedTemplates) {
    templates = JSON.parse(storedTemplates);
  }
  return templates;
};

export const getTemplateById = (id: string): CardTemplate | undefined => {
  return getTemplates().find(t => t.id === id);
};
