
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, logout } = useAuth();

  // Toggle language
  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* App Name */}
        <Link to="/" className="text-2xl font-medium">
          {t("appName")}
        </Link>

        {/* Navigation and Controls */}
        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <Button 
            onClick={toggleLanguage}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Languages className="h-4 w-4" />
            {language === "en" ? (
              <span>العربية 🇸🇦</span>
            ) : (
              <span>English 🇺🇸</span>
            )}
          </Button>

          {/* Admin Controls */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  {t("adminPanel")}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                {t("logout")}
              </Button>
            </div>
          ) : (
            <Link to="/admin">
              <Button variant="outline" size="sm">
                {t("adminAccess")}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
