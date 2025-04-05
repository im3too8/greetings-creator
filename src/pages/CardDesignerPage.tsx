
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import CardDesigner from "@/components/admin/CardDesigner";

const CardDesignerPage = () => {
  const { isAuthenticated } = useAuth();
  const { dir } = useLanguage();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={dir}>
      <Header />
      <CardDesigner />
    </div>
  );
};

export default CardDesignerPage;
