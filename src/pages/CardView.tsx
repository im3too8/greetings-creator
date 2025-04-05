
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import CardCustomizer from "@/components/public/CardCustomizer";

const CardView = () => {
  const { dir } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={dir}>
      <Header />
      <CardCustomizer />
    </div>
  );
};

export default CardView;
