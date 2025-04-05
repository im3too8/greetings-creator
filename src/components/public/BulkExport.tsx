
import { useState, useRef, ChangeEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { processBulkExport } from "@/utils/cardGenerator";
import JSZip from "jszip";
import type { CardTemplate } from "@/utils/cardGenerator";

interface BulkExportProps {
  template: CardTemplate;
}

const BulkExport = ({ template }: BulkExportProps) => {
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  
  // Handle file upload
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if the file is a CSV
    if (!file.name.endsWith(".csv")) {
      toast({
        title: t("error"),
        description: t("invalidFile"),
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    setProgress(0);
    
    try {
      // Read the CSV file
      const text = await file.text();
      
      // Parse the lines (assuming one name per line)
      const names = text
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);
      
      if (names.length === 0) {
        toast({
          title: t("error"),
          description: t("noNamesFound"),
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      // Create a new zip file
      const zip = new JSZip();
      const totalNames = names.length;
      
      // Process images in batches
      for (let i = 0; i < names.length; i++) {
        if (!names[i].trim()) continue;
        
        const blobs = await processBulkExport(template, [names[i]]);
        if (blobs.length > 0) {
          const safeName = names[i].replace(/[^a-z0-9]/gi, '_').toLowerCase();
          zip.file(`greeting_card_${safeName}.png`, blobs[0]);
        }
        
        // Update progress
        const currentProgress = Math.round(((i + 1) / totalNames) * 100);
        setProgress(currentProgress);
      }
      
      // Generate the zip file
      const content = await zip.generateAsync({ type: "blob" });
      setZipBlob(content);
      
      toast({
        title: t("exportComplete"),
        description: `${names.length} ${t("cardsGenerated")}`,
      });
    } catch (error) {
      console.error("Error processing bulk export:", error);
      toast({
        title: t("error"),
        description: t("somethingWentWrong"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    // Simulate file input change
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
      
      // Trigger the change event
      const event = new Event("change", { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
    }
  };
  
  // Prevent default behavior for drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  // Download the zip file
  const handleDownloadZip = () => {
    if (!zipBlob) return;
    
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `greeting_cards_${new Date().toISOString()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div dir={dir}>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-medium">{t("bulkExport")}</h2>
            
            <p className="text-gray-600">
              {t("bulkExportDescription")}
            </p>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />
            
            {!isProcessing && !zipBlob && (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="text-gray-500">
                  <p>{t("dragDropExcel")}</p>
                </div>
              </div>
            )}
            
            {isProcessing && (
              <div className="space-y-2">
                <p>{t("processingFiles")} {progress}%</p>
                <Progress value={progress} />
              </div>
            )}
            
            {zipBlob && !isProcessing && (
              <Button 
                onClick={handleDownloadZip}
                className="w-full apple-btn"
              >
                {t("downloadZip")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkExport;
