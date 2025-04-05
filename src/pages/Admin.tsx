
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminPanel from "@/components/admin/AdminPanel";

const Admin = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { dir } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50" dir={dir}>
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={dir}>
      <Header />
      {isAuthenticated ? <AdminPanel /> : <AdminLogin />}
    </div>
  );
};

export default Admin;
