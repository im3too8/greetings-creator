
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const { t, dir } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={dir}>
      <Header />
      
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl w-full px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            {t("welcome")}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in">
            {t("welcomeDescription")}
          </p>
          
          <Link to="/admin">
            <Button className="apple-btn text-lg py-6 px-12 animate-fade-in">
              {t("adminAccess")}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Index;
