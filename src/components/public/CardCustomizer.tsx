
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getTemplateById,
  renderCardToCanvas,
  downloadCanvasAsImage
} from "@/utils/cardGenerator";
import BulkExport from "./BulkExport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CardTemplate } from "@/utils/cardGenerator";

const CardCustomizer = () => {
  const { id } = useParams<{ id: string }>();
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [template, setTemplate] = useState<CardTemplate | null>(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Load template and render preview immediately
  useEffect(() => {
    if (id) {
      const foundTemplate = getTemplateById(id);
      if (foundTemplate) {
        setTemplate(foundTemplate);
        
        // Render the initial preview with placeholder text
        if (canvasRef.current) {
          renderCardToCanvas(canvasRef.current, foundTemplate);
        }
      } else {
        toast({
          title: t("error"),
          description: t("templateNotFound"),
          variant: "destructive",
        });
      }
    }
  }, [id, t, toast]);
  
  // Re-render the preview when the name changes
  useEffect(() => {
    if (template && canvasRef.current) {
      renderCardToCanvas(canvasRef.current, template, name);
    }
  }, [name, template]);
  
  const handleDownload = async () => {
    if (!template || !canvasRef.current) {
      toast({
        title: t("error"),
        description: t("somethingWentWrong"),
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // If name is empty, use a default filename, otherwise use the name
      const fileName = name.trim() ? 
        `greeting_card_${name.trim()}.png` : 
        `greeting_card.png`;
        
      await renderCardToCanvas(canvasRef.current, template, name);
      downloadCanvasAsImage(canvasRef.current, fileName);
    } catch (error) {
      console.error("Error generating card:", error);
      toast({
        title: t("error"),
        description: t("somethingWentWrong"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]" dir={dir}>
        <div className="text-center">
          <h2 className="text-xl font-medium">{t("loading")}</h2>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8" dir={dir}>
      <h1 className="text-3xl font-semibold text-center mb-8">
        {t("customizeCard")}
      </h1>
      
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="single">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="single" className="flex-1">
              {t("singleCard")}
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex-1">
              {t("bulkExport")}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="single">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">{t("yourName")}</Label>
                      <Input 
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t("enterYourName")}
                        className="apple-input mt-1"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleDownload}
                      disabled={isLoading}
                      className="w-full apple-btn"
                    >
                      {isLoading ? t("loading") : t("downloadCard")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="relative aspect-[1080/720] w-full border rounded-lg overflow-hidden">
                    <canvas 
                      ref={canvasRef}
                      className="w-full h-full object-contain"
                    ></canvas>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="bulk">
            {template && <BulkExport template={template} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CardCustomizer;
