
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTemplates } from "@/utils/cardGenerator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import type { CardTemplate } from "@/utils/cardGenerator";

const AdminPanel = () => {
  const { t, dir } = useLanguage();
  const [templates, setTemplates] = useState<CardTemplate[]>([]);

  useEffect(() => {
    // Load templates
    const loadedTemplates = getTemplates();
    setTemplates(loadedTemplates);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8" dir={dir}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">{t("adminPanel")}</h1>
        <Link to="/admin/create">
          <Button className="apple-btn">
            <Plus className="mr-2 h-4 w-4" />
            {t("createTemplate")}
          </Button>
        </Link>
      </div>

      <h2 className="text-xl font-medium mb-4">{t("templates")}</h2>
      
      {templates.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-500">{t("noTemplatesYet")}</p>
          <Link to="/admin/create">
            <Button variant="link" className="mt-2">
              {t("createTemplate")}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="overflow-hidden card-container hover:shadow-lg">
              <CardContent className="p-0">
                <img 
                  src={template.imageUrl} 
                  alt={template.name}
                  className="w-full h-48 object-cover"
                />
              </CardContent>
              <CardFooter className="flex justify-between bg-white p-4">
                <span className="font-medium">{template.name}</span>
                <div className="space-x-2">
                  <Link to={`/admin/edit/${template.id}`}>
                    <Button variant="outline" size="sm">
                      {t("edit")}
                    </Button>
                  </Link>
                  <Link to={`/card/${template.id}`} target="_blank">
                    <Button variant="ghost" size="sm">
                      {t("preview")}
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
