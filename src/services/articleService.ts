
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  avatar?: string;
  userId?: string;
}

export interface Article {
  id: string | number;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  subCategory?: string;
  status: 'published' | 'draft' | 'pending';
  author: string;
  authorEmail?: string;
  date: string;
  image?: string;
  views: number;
  likes: number;
  readTime?: string;
  tags?: string[];
  localImages?: Record<string, string>;
  isTrending?: boolean;
  priority?: 'high' | 'medium' | 'low';
  comments?: Comment[];
}

const STORAGE_KEY = 'tech_theory_articles';

const INITIAL_ARTICLES: Article[] = [];

const mapSupabaseToArticle = (data: any): Article => ({
  id: data.id,
  title: data.title,
  content: data.content || '',
  excerpt: data.excerpt || '',
  category: data.category || '',
  subCategory: data.subcategory,
  status: (data.status as any) || 'draft',
  author: data.author_display_name || data.author?.full_name || 'Unknown',
  authorEmail: '', 
  date: new Date(data.created_at).toLocaleDateString(),
  image: data.image_url,
  views: data.views || 0,
  likes: data.likes || 0,
  readTime: data.read_time,
  tags: data.tags,
  localImages: data.local_images,
  isTrending: data.is_trending,
  priority: (data.priority as any) || 'medium',
  comments: [] // Comments are fetched separately when needed
});

export const articleService = {
  migrateLocalArticles: async (): Promise<{ success: number; failed: number }> => {
    if (!isSupabaseConfigured()) return { success: 0, failed: 0 };

    try {
      console.log("Starting migration...");
      // 1. Get local articles
      let localArticles: Article[] = [];
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            localArticles = parsed;
          }
        }
      } catch (e) {
        console.warn("Failed to parse local storage articles", e);
        return { success: 0, failed: 0 };
      }

      console.log(`Found ${localArticles.length} articles in local storage.`);
      if (localArticles.length === 0) return { success: 0, failed: 0 };

      // 2. Get existing Supabase articles to avoid duplicates
      const { data: existingArticles } = await supabase
        .from('articles')
        .select('title');
      
      const existingTitles = new Set(existingArticles?.map(a => a.title) || []);

      // 3. Filter missing articles
      // Normalize titles for comparison (trim and lowercase) to be safe
      const articlesToMigrate = localArticles.filter(a => {
        const isDuplicate = Array.from(existingTitles).some(existingTitle => 
            existingTitle.toLowerCase().trim() === a.title.toLowerCase().trim()
        );
        return !isDuplicate;
      });

      console.log(`Found ${articlesToMigrate.length} NEW articles to migrate.`);
      if (articlesToMigrate.length === 0) return { success: 0, failed: 0 };

      // 4. Get current user for author_id
      const { data: { user } } = await supabase.auth.getUser();
      const authorId = user?.id || null;

      // 5. Insert articles
      const dbPayload = articlesToMigrate.map(a => ({
        title: a.title,
        content: a.content,
        excerpt: a.excerpt,
        category: a.category,
        subcategory: a.subCategory,
        status: a.status,
        author_id: authorId,
        author_display_name: a.author,
        image_url: a.image,
        views: a.views || 0,
        likes: a.likes || 0,
        read_time: a.readTime,
        tags: a.tags,
        local_images: a.localImages,
        is_trending: a.isTrending,
        priority: a.priority
      }));

      const { error } = await supabase
        .from('articles')
        .insert(dbPayload);

      if (error) {
        console.error("Error migrating articles:", error);
        return { success: 0, failed: articlesToMigrate.length };
      }

      return { success: articlesToMigrate.length, failed: 0 };
    } catch (err) {
      console.error("Unexpected error migrating articles:", err);
      return { success: 0, failed: 0 };
    }
  },

  getAllArticles: async (): Promise<Article[]> => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('articles')
        .select('*, author:profiles(full_name, avatar_url, username)')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching articles:", error);
        return [];
      }

      // If no articles exist, seed the database with initial articles
      if (data.length === 0) {
        console.log("No articles found in Supabase. Seeding initial data...");
        await articleService.seedInitialArticles();
        // Re-fetch after seeding
        return articleService.getAllArticles();
      }

      return data.map(mapSupabaseToArticle);
    }

    // Fallback
    return new Promise((resolve) => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ARTICLES));
        resolve(INITIAL_ARTICLES);
      } else {
        resolve(JSON.parse(stored));
      }
    });
  },

  seedInitialArticles: async (): Promise<void> => {
    if (!isSupabaseConfigured()) return;

    try {
      // Try to get the current user to assign as author
      const { data: { user } } = await supabase.auth.getUser();
      const authorId = user?.id || null;

      // Check for local storage articles first
      let sourceArticles = INITIAL_ARTICLES;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`Found ${parsed.length} local articles to migrate.`);
            sourceArticles = parsed;
          }
        }
      } catch (e) {
        console.warn("Failed to parse local storage articles", e);
      }

      const articlesToInsert = sourceArticles.map(article => ({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        category: article.category,
        subcategory: article.subCategory,
        status: article.status,
        author_id: authorId,
        author_display_name: article.author,
        image_url: article.image,
        views: article.views || 0,
        likes: article.likes || 0,
        read_time: article.readTime,
        tags: article.tags,
        is_trending: article.isTrending,
        priority: article.priority
      }));
      
      // We need to map keys to snake_case for Supabase
      const dbPayload = articlesToInsert.map(a => ({
        title: a.title,
        content: a.content,
        excerpt: a.excerpt,
        category: a.category,
        subcategory: a.subcategory,
        status: a.status,
        author_id: a.author_id,
        author_display_name: a.author_display_name,
        image_url: a.image_url,
        views: a.views,
        likes: a.likes,
        read_time: a.read_time,
        tags: a.tags,
        is_trending: a.is_trending,
        priority: a.priority
      }));

      const { error } = await supabase
        .from('articles')
        .insert(dbPayload);

      if (error) {
        console.error("Error seeding articles:", error);
      } else {
        console.log("Successfully seeded initial articles");
      }
    } catch (err) {
      console.error("Unexpected error seeding articles:", err);
    }
  },


  getPublishedArticles: async (): Promise<Article[]> => {
    if (isSupabaseConfigured()) {
      // First check if we need to seed
      const { count } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });
        
      if (count === 0) {
        console.log("Database empty. Seeding from local storage/initial data...");
        await articleService.seedInitialArticles();
        
        // Check again if seeding succeeded
        const { count: newCount } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true });
          
        if (newCount === 0) {
          console.warn("Seeding failed (likely due to RLS). Falling back to local data.");
          // Fallback to local storage or initial data
          const stored = localStorage.getItem(STORAGE_KEY);
          const localArticles: Article[] = stored ? JSON.parse(stored) : INITIAL_ARTICLES;
          return localArticles.filter(a => a.status === 'published');
        }
      }

      const { data, error } = await supabase
        .from('articles')
        .select('*, author:profiles(full_name, avatar_url, username)')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching published articles:", error);
        return [];
      }
      return data.map(mapSupabaseToArticle);
    }

    const articles = await articleService.getAllArticles();
    return articles.filter(a => a.status === 'published');
  },

  getPriorityArticles: async (): Promise<Article[]> => {
    const articles = await articleService.getPublishedArticles();
    return articles.sort((a, b) => {
      const priorityMap = { high: 3, medium: 2, low: 1 };
      const priorityA = priorityMap[a.priority || 'medium'];
      const priorityB = priorityMap[b.priority || 'medium'];
      
      // Sort by priority (descending)
      if (priorityA !== priorityB) {
        return priorityB - priorityA;
      }
      
      // If priority matches, sort by trending
      if (a.isTrending && !b.isTrending) return -1;
      if (!a.isTrending && b.isTrending) return 1;
      
      return 0;
    });
  },

  getArticleById: async (id: string | number): Promise<Article | undefined> => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('articles')
        .select('*, author:profiles(full_name, avatar_url, username)')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching article by id:", error);
        return undefined;
      }
      
      // Fetch comments for this article
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*, user:profiles(full_name, avatar_url)')
        .eq('article_id', id)
        .order('created_at', { ascending: true });
        
      const article = mapSupabaseToArticle(data);
      if (commentsData) {
        article.comments = commentsData.map((c: any) => ({
          id: String(c.id),
          author: c.user?.full_name || 'Anonymous',
          content: c.content,
          date: new Date(c.created_at).toLocaleDateString(),
          avatar: c.user?.avatar_url,
          userId: c.user_id
        }));
      }
      
      return article;
    }

    const articles = await articleService.getAllArticles();
    // Use loose equality to match number vs string ID
    return articles.find(a => a.id == id);
  },

  saveArticle: async (article: Article): Promise<void> => {
    if (isSupabaseConfigured()) {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not authenticated");

      const articleData = {
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        category: article.category,
        subcategory: article.subCategory,
        status: article.status,
        author_id: user.id,
        image_url: article.image,
        views: article.views,
        likes: article.likes,
        read_time: article.readTime,
        tags: article.tags,
        local_images: article.localImages,
        is_trending: article.isTrending,
        priority: article.priority
      };

      if (article.id && typeof article.id === 'number') {
        // Update existing
         const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', article.id);
         if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('articles')
          .insert(articleData);
        if (error) throw error;
      }
      return;
    }

    const articles = await articleService.getAllArticles();
    const index = articles.findIndex(a => String(a.id) === String(article.id));
    
    if (index >= 0) {
      articles[index] = article;
    } else {
      articles.unshift(article); // Add new articles to the top
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  },

  deleteArticle: async (id: string | number): Promise<void> => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return;
    }

    const articles = await articleService.getAllArticles();
    const filtered = articles.filter(a => String(a.id) !== String(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  deleteComment: async (articleId: string | number, commentId: string): Promise<Article | null> => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      
      if (error) {
        console.error("Error deleting comment:", error);
        return null;
      }
      
      return articleService.getArticleById(articleId).then(res => res || null);
    }

    const articles = await articleService.getAllArticles();
    const index = articles.findIndex(a => String(a.id) === String(articleId));
    
    if (index >= 0) {
      const article = articles[index];
      if (article.comments) {
        article.comments = article.comments.filter(c => c.id !== commentId);
        articles[index] = article;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
        return article;
      }
    }
    return null;
  },

  addComment: async (articleId: string | number, comment: Comment): Promise<Article | null> => {
    if (isSupabaseConfigured()) {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('comments')
        .insert({
          article_id: articleId,
          user_id: user.id,
          content: comment.content
        });
      
      if (error) {
        console.error("Error adding comment:", error);
        return null;
      }
      
      return articleService.getArticleById(articleId).then(res => res || null);
    }

    const articles = await articleService.getAllArticles();
    const index = articles.findIndex(a => String(a.id) === String(articleId));
    
    if (index >= 0) {
      const article = articles[index];
      if (!article.comments) {
        article.comments = [];
      }
      article.comments.push(comment);
      articles[index] = article;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
      return article;
    }
    return null;
  },

  incrementViews: async (id: string | number): Promise<Article | null> => {
    if (isSupabaseConfigured()) {
      // Try using RPC for atomic increment
      const { error: rpcError } = await supabase.rpc('increment_views', { article_id: id });
      
      if (rpcError) {
        console.warn("RPC increment_views failed, falling back to fetch-update:", rpcError);
        
        // Fallback: fetch-update (less safe for concurrency but works without RPC)
        const { data: article, error: fetchError } = await supabase
          .from('articles')
          .select('views')
          .eq('id', id)
          .single();
          
        if (fetchError || !article) {
          console.error("Error fetching article for view increment:", fetchError);
          return null;
        }
        
        const newViews = (article.views || 0) + 1;
        
        const { error: updateError } = await supabase
          .from('articles')
          .update({ views: newViews })
          .eq('id', id);
          
        if (updateError) {
          console.error("Error updating views:", updateError);
          return null;
        }
      }
      
      return articleService.getArticleById(id).then(res => res || null);
    }

    const articles = await articleService.getAllArticles();
    const index = articles.findIndex(a => String(a.id) === String(id));
    
    if (index >= 0) {
      const article = articles[index];
      article.views = (article.views || 0) + 1;
      articles[index] = article;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
      return article;
    }
    return null;
  },

  updateLikes: async (id: string | number, change: number): Promise<Article | null> => {
    if (isSupabaseConfigured()) {
      const article = await articleService.getArticleById(id);
      if (!article) return null;
      
      const newLikes = Math.max(0, (article.likes || 0) + change);
      const { error } = await supabase
        .from('articles')
        .update({ likes: newLikes })
        .eq('id', id);
        
      if (error) return null;
      return { ...article, likes: newLikes };
    }

    const articles = await articleService.getAllArticles();
    const index = articles.findIndex(a => String(a.id) === String(id));
    
    if (index >= 0) {
      const article = articles[index];
      article.likes = Math.max(0, (article.likes || 0) + change);
      articles[index] = article;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
      return article;
    }
    return null;
  },
  
  generateExcerpt: (content: string, maxLength: number = 280): string => {
    // Remove images
    let text = content.replace(/!\[.*?\]\(.*?\)/g, '');
    // Remove links but keep text
    text = text.replace(/\[([^\]]+)\]\(.*?\)/g, '$1');
    // Remove headings
    text = text.replace(/#{1,6}\s/g, '');
    // Remove bold/italic
    text = text.replace(/(\*\*|__|\*|_)/g, '');
    // Remove blockquotes
    text = text.replace(/^>\s/gm, '');
    // Remove code blocks
    text = text.replace(/```[\s\S]*?```/g, '');
    text = text.replace(/`.*?`/g, '');
    // Clean up extra whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  calculateReadTime: (content: string): string => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const time = Math.ceil(words / wordsPerMinute);
    return `${time} min read`;
  }
};
