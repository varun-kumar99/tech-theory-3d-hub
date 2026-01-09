import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BookmarkProvider } from "@/contexts/BookmarkContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ArticleDetail from "./pages/ArticleDetail";
import SearchPage from "./pages/SearchPage";
import ProfilePage from "./pages/ProfilePage";
import BookmarksPage from "./pages/BookmarksPage";
import CategoryPage from "./pages/CategoryPage";
import AdminAuth from "./pages/AdminAuth";
import AdminDashboard from "./pages/AdminDashboard";
import AuthorDashboard from "./pages/AuthorDashboard";
import CreateArticle from "./pages/CreateArticle";
import ManageCredentials from "./pages/ManageCredentials";
import PublicAuthorProfile from "./pages/PublicAuthorProfile";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import ScrollToTop from "./components/ScrollToTop";

const App = () => (
  <AuthProvider>
    <BookmarkProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/author/:authorName" element={<PublicAuthorProfile />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/admin" element={<AdminAuth />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/author-dashboard" element={<AuthorDashboard />} />
            <Route path="/admin/create-article" element={<CreateArticle />} />
            <Route path="/admin/credentials" element={<ManageCredentials />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </BookmarkProvider>
  </AuthProvider>
);

export default App;
