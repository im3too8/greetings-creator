
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TextArea } from "@/utils/cardGenerator";

interface TextEditorProps {
  textArea: TextArea;
  onUpdate: (textArea: TextArea) => void;
  onDelete: () => void;
}

const TextEditor = ({ textArea, onUpdate, onDelete }: TextEditorProps) => {
  const { t, dir } = useLanguage();
  const [localTextArea, setLocalTextArea] = useState<TextArea>(textArea);

  // Update local state when the selected text area changes
  useEffect(() => {
    setLocalTextArea(textArea);
  }, [textArea]);

  // Handle changes to text area properties
  const handleChange = (
    field: keyof TextArea,
    value: string | number
  ) => {
    setLocalTextArea(prev => {
      const updated = { ...prev, [field]: value };
      onUpdate(updated);
      return updated;
    });
  };

  // Common font families
  const fontFamilies = [
    "Arial",
    "Helvetica",
    "SF Pro Display",
    "Noto Sans Arabic",
    "Times New Roman",
    "Georgia",
    "Verdana",
    "Tahoma"
  ];

  return (
    <div className="space-y-4" dir={dir}>
      <div>
        <Label htmlFor="content">{t("textContent")}</Label>
        <Textarea
          id="content"
          value={localTextArea.content}
          onChange={(e) => handleChange("content", e.target.value)}
          placeholder={t("enterTextHere")}
          className="apple-input mt-1"
          rows={3}
        />
        <p className="text-sm text-gray-500 mt-1">
          {t("useNamePlaceholder")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fontFamily">{t("fontFamily")}</Label>
          <Select
            value={localTextArea.fontFamily}
            onValueChange={(value) => handleChange("fontFamily", value)}
          >
            <SelectTrigger className="apple-input mt-1">
              <SelectValue placeholder={t("selectFont")} />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map((font) => (
                <SelectItem key={font} value={font}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="fontSize">{t("fontSize")}</Label>
          <Input
            id="fontSize"
            type="number"
            value={localTextArea.fontSize}
            onChange={(e) => handleChange("fontSize", parseInt(e.target.value) || 12)}
            className="apple-input mt-1"
            min="8"
            max="72"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="textColor">{t("fontColor")}</Label>
          <div className="flex mt-1">
            <Input
              id="textColor"
              type="color"
              value={localTextArea.color}
              onChange={(e) => handleChange("color", e.target.value)}
              className="w-12 h-10 p-1 border rounded"
            />
            <Input
              type="text"
              value={localTextArea.color}
              onChange={(e) => handleChange("color", e.target.value)}
              className="flex-1 apple-input ml-2"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="textAlignment">{t("textAlignment")}</Label>
          <Select
            value={localTextArea.alignment}
            onValueChange={(value: "left" | "center" | "right") => handleChange("alignment", value)}
          >
            <SelectTrigger className="apple-input mt-1">
              <SelectValue placeholder={t("selectAlignment")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">{t("left")}</SelectItem>
              <SelectItem value="center">{t("center")}</SelectItem>
              <SelectItem value="right">{t("right")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="textDirection">{t("textDirection")}</Label>
        <Select
          value={localTextArea.direction}
          onValueChange={(value: "ltr" | "rtl") => handleChange("direction", value)}
        >
          <SelectTrigger className="apple-input mt-1">
            <SelectValue placeholder={t("selectDirection")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ltr">{t("leftToRight")}</SelectItem>
            <SelectItem value="rtl">{t("rightToLeft")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="textX">{t("xPosition")}</Label>
          <Input
            id="textX"
            type="number"
            value={localTextArea.x}
            onChange={(e) => handleChange("x", parseInt(e.target.value) || 0)}
            className="apple-input mt-1"
          />
        </div>
        <div>
          <Label htmlFor="textY">{t("yPosition")}</Label>
          <Input
            id="textY"
            type="number"
            value={localTextArea.y}
            onChange={(e) => handleChange("y", parseInt(e.target.value) || 0)}
            className="apple-input mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="textWidth">{t("width")}</Label>
          <Input
            id="textWidth"
            type="number"
            value={localTextArea.width}
            onChange={(e) => handleChange("width", parseInt(e.target.value) || 100)}
            className="apple-input mt-1"
            min="10"
          />
        </div>
        <div>
          <Label htmlFor="textHeight">{t("height")}</Label>
          <Input
            id="textHeight"
            type="number"
            value={localTextArea.height}
            onChange={(e) => handleChange("height", parseInt(e.target.value) || 20)}
            className="apple-input mt-1"
            min="10"
          />
        </div>
      </div>

      <Button 
        variant="destructive" 
        onClick={onDelete} 
        className="w-full mt-4"
      >
        {t("deleteTextArea")}
      </Button>
    </div>
  );
};

export default TextEditor;
