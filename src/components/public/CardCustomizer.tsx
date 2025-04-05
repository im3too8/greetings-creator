
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [template, setTemplate] = useState<CardTemplate | null>(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  
  // Debug function to help trace issues
  const logDebug = (message: string, data?: any) => {
    if (data) {
      console.log(`[CardCustomizer] ${message}:`, data);
    } else {
      console.log(`[CardCustomizer] ${message}`);
    }
  };
  
  useEffect(() => {
    if (id) {
      logDebug(`Loading template with ID: ${id}`);
      setLoadingTemplate(true);
      
      const foundTemplate = getTemplateById(id);
      if (foundTemplate) {
        logDebug("Template found", foundTemplate);
        setTemplate(foundTemplate);
        
        if (canvasRef.current) {
          logDebug("Canvas ref exists, rendering template...");
          renderCardToCanvas(canvasRef.current, foundTemplate)
            .then(() => {
              logDebug("Template rendered successfully");
              setLoadingTemplate(false);
            })
            .catch(err => {
              logDebug("Error rendering template", err);
              toast({
                title: t("error"),
                description: t("somethingWentWrong"),
                variant: "destructive",
              });
              setLoadingTemplate(false);
            });
        } else {
          logDebug("Canvas ref is null - can't render template");
          setLoadingTemplate(false);
        }
      } else {
        logDebug(`Template not found with ID: ${id}`);
        toast({
          title: t("error"),
          description: t("templateNotFound"),
          variant: "destructive",
        });
        setLoadingTemplate(false);
      }
    } else {
      logDebug("No template ID provided in URL");
    }
  }, [id, t, toast]);
  
  useEffect(() => {
    if (template && canvasRef.current) {
      logDebug(`Re-rendering canvas with name: "${name}"`);
      renderCardToCanvas(canvasRef.current, template, name)
        .catch(err => {
          logDebug("Error rendering template with name", err);
        });
    }
  }, [name, template]);
  
  const handleDownload = async () => {
    if (!template || !canvasRef.current) {
      logDebug("Cannot download: template or canvas is null");
      toast({
        title: t("error"),
        description: t("somethingWentWrong"),
        variant: "destructive",
      });
      return;
    }
    
    logDebug("Starting download process");
    setIsLoading(true);
    
    try {
      const fileName = name.trim() ? 
        `greeting_card_${name.trim()}.png` : 
        `greeting_card.png`;
      
      logDebug("Rendering final canvas for download");
      await renderCardToCanvas(canvasRef.current, template, name);
      logDebug("Downloading canvas as image", fileName);
      downloadCanvasAsImage(canvasRef.current, fileName);
      
      toast({
        title: t("success"),
        description: t("downloadCard"),
      });
    } catch (error) {
      logDebug("Error generating card", error);
      toast({
        title: t("error"),
        description: t("somethingWentWrong"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (loadingTemplate) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]" dir={dir}>
        <div className="text-center">
          <h2 className="text-xl font-medium">{t("loading")}</h2>
          <p className="mt-2 text-sm text-gray-500">
            {id ? `ID: ${id.substring(0, 8)}...` : "No ID provided"}
          </p>
        </div>
      </div>
    );
  }
  
  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]" dir={dir}>
        <div className="text-center space-y-4">
          <h2 className="text-xl font-medium">{t("templateNotFound")}</h2>
          <p className="text-gray-500">
            {id ? `ID: ${id}` : t("noTemplateProvided")}
          </p>
          <Button onClick={() => navigate("/")}>{t("goBack")}</Button>
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
                      width={1080}
                      height={720}
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
