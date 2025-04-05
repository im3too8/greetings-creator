
import { useState, useRef, useEffect, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TextEditor from "./TextEditor";
import {
  CardTemplate,
  TextArea,
  generateCardId,
  saveTemplate,
  getTemplateById,
  generateShareableLink
} from "@/utils/cardGenerator";

const CardDesigner = () => {
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for the card template
  const [template, setTemplate] = useState<CardTemplate>({
    id: id || generateCardId(),
    name: "",
    imageUrl: "",
    imageWidth: 1080, // Default width
    imageHeight: 0,
    textAreas: []
  });
  
  // State for the preview
  const [selectedTextAreaId, setSelectedTextAreaId] = useState<string | null>(null);
  const [shareableLink, setShareableLink] = useState<string>("");
  
  // Load existing template if editing
  useEffect(() => {
    if (isEditing && id) {
      const existingTemplate = getTemplateById(id);
      if (existingTemplate) {
        setTemplate(existingTemplate);
        setShareableLink(generateShareableLink(id));
      } else {
        navigate("/admin");
        toast({
          title: t("error"),
          description: t("templateNotFound"),
          variant: "destructive",
        });
      }
    }
  }, [isEditing, id, navigate, t, toast]);
  
  // Handle image upload
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if the file is an image
    if (!file.type.startsWith("image/")) {
      toast({
        title: t("error"),
        description: t("fileNotSupported"),
        variant: "destructive",
      });
      return;
    }
    
    // Create an image element to get dimensions
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.height / img.width;
      const imageHeight = Math.round(1080 * aspectRatio); // Maintain aspect ratio
      
      setTemplate(prev => ({
        ...prev,
        imageUrl: URL.createObjectURL(file),
        imageWidth: 1080, // Fixed width
        imageHeight: imageHeight
      }));
      
      URL.revokeObjectURL(img.src); // Clean up
    };
    img.src = URL.createObjectURL(file);
  };
  
  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.height / img.width;
      const imageHeight = Math.round(1080 * aspectRatio);
      
      setTemplate(prev => ({
        ...prev,
        imageUrl: URL.createObjectURL(file),
        imageWidth: 1080,
        imageHeight
      }));
      
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  };
  
  // Prevent default behavior for drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  // Add a new text area
  const handleAddTextArea = () => {
    const newTextArea: TextArea = {
      id: `text_${Date.now()}`,
      content: "[name]",
      x: template.imageWidth / 2 - 150,
      y: template.imageHeight / 2,
      width: 300,
      height: 50,
      fontFamily: "Arial",
      fontSize: 24,
      color: "#000000",
      alignment: "center",
      direction: "ltr",
    };
    
    setTemplate(prev => ({
      ...prev,
      textAreas: [...prev.textAreas, newTextArea]
    }));
    
    setSelectedTextAreaId(newTextArea.id);
  };
  
  // Update a text area
  const handleUpdateTextArea = (updatedTextArea: TextArea) => {
    setTemplate(prev => ({
      ...prev,
      textAreas: prev.textAreas.map(ta => 
        ta.id === updatedTextArea.id ? updatedTextArea : ta
      )
    }));
  };
  
  // Delete a text area
  const handleDeleteTextArea = (id: string) => {
    setTemplate(prev => ({
      ...prev,
      textAreas: prev.textAreas.filter(ta => ta.id !== id)
    }));
    
    if (selectedTextAreaId === id) {
      setSelectedTextAreaId(null);
    }
  };
  
  // Save the template
  const handleSave = () => {
    if (!template.imageUrl) {
      toast({
        title: t("error"),
        description: t("pleaseUploadImage"),
        variant: "destructive",
      });
      return;
    }
    
    if (!template.name.trim()) {
      toast({
        title: t("error"),
        description: t("pleaseEnterName"),
        variant: "destructive",
      });
      return;
    }
    
    saveTemplate(template);
    
    const link = generateShareableLink(template.id);
    setShareableLink(link);
    
    toast({
      title: t("success"),
      description: isEditing ? t("templateUpdated") : t("templateCreated"),
    });
    
    if (!isEditing) {
      navigate(`/admin/edit/${template.id}`);
    }
  };
  
  // Copy shareable link to clipboard
  const copyShareableLink = () => {
    navigator.clipboard.writeText(shareableLink);
    toast({
      title: t("linkCopied"),
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8" dir={dir}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">
          {isEditing ? t("editTemplate") : t("createTemplate")}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/admin")}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} className="apple-btn">
            {t("save")}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Template Info and Image Upload */}
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="templateName">{t("templateName")}</Label>
                <Input 
                  id="templateName"
                  value={template.name}
                  onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t("enterTemplateName")}
                  className="apple-input mt-1"
                />
              </div>
              
              {/* Image Upload */}
              <div className="mt-4">
                <Label>{t("uploadImage")}</Label>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div 
                  className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {template.imageUrl ? (
                    <img 
                      src={template.imageUrl} 
                      alt="Template Preview" 
                      className="mx-auto max-h-48 object-contain"
                    />
                  ) : (
                    <div className="text-gray-500">
                      <p>{t("dragDropImage")}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Shareable Link */}
              {shareableLink && (
                <div className="mt-4">
                  <Label>{t("shareableLink")}</Label>
                  <div className="flex mt-1">
                    <Input 
                      value={shareableLink}
                      readOnly
                      className="apple-input rounded-r-none"
                    />
                    <Button 
                      onClick={copyShareableLink}
                      className="rounded-l-none"
                    >
                      {t("copy")}
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Preview Link */}
              {template.id && (
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(`/card/${template.id}`, "_blank")}
                  >
                    {t("preview")}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Card Designer */}
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <Tabs defaultValue="design">
              <TabsList className="mb-4">
                <TabsTrigger value="design">{t("design")}</TabsTrigger>
                <TabsTrigger value="text">{t("textSettings")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="design" className="space-y-4">
                {template.imageUrl ? (
                  <div 
                    className="relative border rounded-lg overflow-hidden"
                    style={{ 
                      width: "100%", 
                      height: "auto", 
                      maxWidth: "100%",
                      aspectRatio: template.imageWidth / template.imageHeight
                    }}
                  >
                    <img
                      src={template.imageUrl}
                      alt="Template"
                      className="w-full h-full object-contain"
                    />
                    
                    {/* Text Areas Overlay */}
                    {template.textAreas.map(textArea => (
                      <div
                        key={textArea.id}
                        className={`absolute border-2 cursor-move ${
                          selectedTextAreaId === textArea.id
                            ? "border-blue-500"
                            : "border-transparent hover:border-gray-300"
                        }`}
                        style={{
                          left: `${(textArea.x / template.imageWidth) * 100}%`,
                          top: `${(textArea.y / template.imageHeight) * 100}%`,
                          width: `${(textArea.width / template.imageWidth) * 100}%`,
                          height: `${(textArea.height / template.imageHeight) * 100}%`,
                        }}
                        onClick={() => setSelectedTextAreaId(textArea.id)}
                      >
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            fontFamily: textArea.fontFamily,
                            fontSize: `${textArea.fontSize * (template.imageWidth / 1080)}px`,
                            color: textArea.color,
                            textAlign: textArea.alignment,
                            direction: textArea.direction,
                          }}
                        >
                          {textArea.content}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500">{t("pleaseUploadImage")}</p>
                  </div>
                )}
                
                <Button onClick={handleAddTextArea} className="w-full">
                  {t("addTextArea")}
                </Button>
              </TabsContent>
              
              <TabsContent value="text">
                {selectedTextAreaId ? (
                  <TextEditor
                    textArea={template.textAreas.find(ta => ta.id === selectedTextAreaId)!}
                    onUpdate={handleUpdateTextArea}
                    onDelete={() => handleDeleteTextArea(selectedTextAreaId)}
                  />
                ) : (
                  <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500">{t("selectTextAreaToEdit")}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CardDesigner;
