
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
  authorId?: string;
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

// Helper for Supabase timeouts
const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms));

const INITIAL_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Getting Started with React and Supabase',
    content: '# Getting Started with React and Supabase\n\nLearn how to build powerful applications using React and Supabase. This guide covers the basics of authentication, database management, and real-time updates.',
    excerpt: 'Learn how to build powerful applications using React and Supabase.',
    category: 'Development',
    status: 'published',
    author: 'Tech Theory',
    date: new Date().toISOString().split('T')[0],
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60',
    views: 120,
    likes: 45,
    readTime: '5 min read',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Modern Web Design Trends in 2024',
    content: '# Modern Web Design Trends in 2024\n\nExplore the latest trends in web design, from minimalist interfaces to immersive 3D experiences. Discover how to create engaging user experiences.',
    excerpt: 'Explore the latest trends in web design, from minimalist interfaces to immersive 3D experiences.',
    category: 'Design',
    status: 'published',
    author: 'Tech Theory',
    date: new Date().toISOString().split('T')[0],
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&auto=format&fit=crop&q=60',
    views: 85,
    likes: 32,
    readTime: '4 min read',
    priority: 'medium'
  }
];

const mapSupabaseToArticle = (data: any): Article => ({
  id: data.id,
  title: data.title,
  content: data.content || '',
  excerpt: data.excerpt || '',
  category: data.category || '',
  subCategory: data.subcategory,
  status: (data.status as any) || 'draft',
  author: data.author_display_name || data.author?.full_name || 'Unknown',
  authorId: data.author_id,
  authorEmail: '', 
  date: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
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

  sortArticles: (articles: Article[]): Article[] => {
    const priorityWeight = { high: 10, medium: 5, low: 1 };
    
    return [...articles].sort((a, b) => {
      // 1. Calculate combined score
      const scoreA = priorityWeight[a.priority || 'medium'] + (a.isTrending ? 20 : 0);
      const scoreB = priorityWeight[b.priority || 'medium'] + (b.isTrending ? 20 : 0);
      
      if (scoreA !== scoreB) return scoreB - scoreA;
      
      // 2. If scores are same, sort by Date (newest first)
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  },

  getAllArticles: async (): Promise<Article[]> => {
    let supabaseArticles: Article[] = [];
    
    if (isSupabaseConfigured()) {
      try {
        const fetchPromise = supabase
          .from('articles')
          .select('*')
          .order('created_at', { ascending: false });
        
        const { data, error } = (await Promise.race([fetchPromise, timeout(15000)])) as any;
        
        if (error) {
          console.error("Error fetching articles:", error);
        } else if (data) {
          supabaseArticles = data.map(mapSupabaseToArticle);
          
          if (data.length === 0) {
            console.log("No articles found in Supabase. Seeding initial data...");
            try {
              await Promise.race([articleService.seedInitialArticles(), timeout(10000)]);
              // Fetch again after seeding
              const { data: newData } = (await Promise.race([
                supabase.from('articles').select('*').order('created_at', { ascending: false }),
                timeout(5000)
              ])) as any;
              if (newData) supabaseArticles = newData.map(mapSupabaseToArticle);
            } catch (seedErr) {
              console.warn("Seeding or re-fetch failed", seedErr);
            }
          }
        }
      } catch (err) {
        console.error("Exception in getAllArticles Supabase fetch:", err);
      }
    }

    // Get local articles. Only fall back to INITIAL_ARTICLES when Supabase
    // is NOT configured (i.e., running locally / DEV). When Supabase is
    // configured we avoid showing built-in sample articles as a fallback.
    let localArticles: Article[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        localArticles = JSON.parse(stored);
      } else {
        localArticles = isSupabaseConfigured() ? [] : INITIAL_ARTICLES;
      }
    } catch (e) {
      console.error("Failed to parse local storage articles", e);
      localArticles = isSupabaseConfigured() ? [] : INITIAL_ARTICLES;
    }

    // If Supabase is not configured or failed, return local articles
    let combined: Article[] = [];
    if (!isSupabaseConfigured() || supabaseArticles.length === 0) {
      combined = localArticles;
    } else {
      // Merge Supabase and Local articles, avoiding duplicates by title
      combined = [...supabaseArticles];
      const existingTitles = new Set(supabaseArticles.map(a => a.title.toLowerCase().trim()));

      for (const local of localArticles) {
        const normalizedTitle = local.title.toLowerCase().trim();
        if (!existingTitles.has(normalizedTitle)) {
          combined.push(local);
        }
      }
    }

    // Sort combined articles by priority, then trending, then date
    return articleService.sortArticles(combined);
  },

  seedInitialArticles: async (): Promise<void> => {
    // Only auto-seed initial articles during development to avoid
    // populating production databases with sample content.
    if (!isSupabaseConfigured()) return;
    if (!import.meta.env.DEV) {
      console.log("Skipping seedInitialArticles outside DEV environment.");
      return;
    }

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
    console.log("getPublishedArticles started, Supabase configured:", isSupabaseConfigured());

    // Fast-path: return session-cached published articles immediately if available.
    // Also trigger a background refresh to get the latest data and notify listeners.
    try {
      const cacheKey = 'cached_published_articles_v1';
      const cachedRaw = sessionStorage.getItem(cacheKey);
      const cacheTTL = 2 * 60 * 1000; // 2 minutes
      if (cachedRaw) {
        const parsed = JSON.parse(cachedRaw);
        if (parsed?.ts && (Date.now() - parsed.ts) < cacheTTL && Array.isArray(parsed.articles)) {
          // Kick off background refresh but don't await it here. Call
          // getAllArticles() (which does not depend on this cached path)
          // and filter published articles, then update cache and notify.
          (async () => {
            try {
              const all = await articleService.getAllArticles().catch(() => null);
              const fresh = (Array.isArray(all) ? all.filter((a: Article) => a.status === 'published') : null) as Article[] | null;
              if (fresh && Array.isArray(fresh)) {
                sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), articles: fresh }));
                try {
                  window.dispatchEvent(new CustomEvent('articles:updated', { detail: fresh }));
                } catch (e) {
                  // ignore dispatch errors
                }
              }
            } catch (e) {
              // ignore
            }
          })();
          return parsed.articles as Article[];
        }
      }
    } catch (e) {
      console.warn('Failed to read session cache for published articles', e);
    }
    if (isSupabaseConfigured()) {
      try {
        // First check if we need to seed
        console.log("Checking article count...");
        
        // Wrap the Supabase call in a timeout
        const countPromise = supabase
          .from('articles')
          .select('*', { count: 'exact', head: true });
          
        const { count, error: countError } = (await Promise.race([countPromise, timeout(15000)])) as any;
          
        if (countError) {
          console.error("Error checking article count:", countError);
          throw countError;
        }

        console.log("Article count:", count);
        if (count === 0) {
          console.log("Database empty. Seeding from local storage/initial data...");
          await Promise.race([articleService.seedInitialArticles(), timeout(15000)]);
          
          // Check again if seeding succeeded
          const { count: newCount } = (await Promise.race([
            supabase.from('articles').select('*', { count: 'exact', head: true }),
            timeout(15000)
          ])) as any;
            
          if (newCount === 0) {
            console.warn("Seeding failed (likely due to RLS). Falling back to local data.");
                // Fallback to local storage or initial data. When Supabase is
                // configured we prefer an empty result over showing built-in
                // sample articles so the UI reflects the DB state.
                const stored = localStorage.getItem(STORAGE_KEY);
                const localArticles: Article[] = stored ? JSON.parse(stored) : (isSupabaseConfigured() ? [] : INITIAL_ARTICLES);
                return localArticles.filter(a => a.status === 'published');
          }
        }

        console.log("Fetching published articles from Supabase...");
        const fetchPromise = supabase
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .order('priority', { ascending: false }) // high, medium, low alphabetical order doesn't work well here
          .order('created_at', { ascending: false });

        const { data, error } = (await Promise.race([fetchPromise, timeout(15000)])) as any;
        
        if (error) {
          console.error("Error fetching published articles:", error);
          return [];
        }
        console.log("Successfully fetched", data?.length, "articles from Supabase");
        const mapped = articleService.sortArticles(data.map(mapSupabaseToArticle));
        try {
          const cacheKey = 'cached_published_articles_v1';
          sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), articles: mapped }));
          try { window.dispatchEvent(new CustomEvent('articles:updated', { detail: mapped })); } catch (e) { }
        } catch (e) {
          // ignore cache failures
        }
        return mapped;
      } catch (err) {
        console.error("Critical error or timeout in getPublishedArticles:", err);
        // Fallback to local data on any error to prevent hanging
        const stored = localStorage.getItem(STORAGE_KEY);
        try {
          const localArticles: Article[] = stored ? JSON.parse(stored) : (isSupabaseConfigured() ? [] : INITIAL_ARTICLES);
          return localArticles.filter(a => a.status === 'published');
        } catch (e) {
          console.error("Failed to parse local articles during fallback:", e);
          return (isSupabaseConfigured() ? [] : INITIAL_ARTICLES).filter(a => a.status === 'published');
        }
      }
    }

    console.log("Supabase not configured, using local storage");
    const articles = await articleService.getAllArticles();
    return articles.filter(a => a.status === 'published');
  },

  getPriorityArticles: async (): Promise<Article[]> => {
    return await articleService.getPublishedArticles();
  },

  getArticleByTitle: async (title: string): Promise<Article | undefined> => {
    if (isSupabaseConfigured()) {
      try {
        const fetchPromise = supabase
          .from('articles')
          .select('*')
          .ilike('title', title.trim())
          .maybeSingle();

        const { data, error } = (await Promise.race([
          fetchPromise,
          timeout(15000)
        ])) as any;
        
        if (!error && data) {
          return mapSupabaseToArticle(data);
        }
      } catch (err) {
        console.error("Error fetching article by title:", err);
      }
    }
    
    // Check local storage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const localArticles: Article[] = JSON.parse(stored);
        const localArticle = localArticles.find(a => a.title.toLowerCase().trim() === title.toLowerCase().trim());
        if (localArticle) return localArticle;
      }
    } catch (e) {
      console.warn("Error checking local storage by title", e);
    }

    // Check initial articles
    return INITIAL_ARTICLES.find(a => a.title.toLowerCase().trim() === title.toLowerCase().trim());
  },

  getArticleById: async (id: string | number): Promise<Article | undefined> => {
    // 1. First check local storage for this exact ID
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const localArticles: Article[] = JSON.parse(stored);
        const localArticle = localArticles.find(a => String(a.id) === String(id));
        if (localArticle) return localArticle;
      }
      
      // Also check bookmarks storage for metadata if not found in articles storage
      const storedBookmarks = localStorage.getItem('tech-theory-bookmarks');
      if (storedBookmarks) {
        const bookmarkedArticles: any[] = JSON.parse(storedBookmarks);
        const bookmarked = bookmarkedArticles.find(a => String(a.id) === String(id));
        if (bookmarked) {
          // Map to Article type
          return {
            ...bookmarked,
            content: bookmarked.content || '',
            excerpt: bookmarked.excerpt || '',
            status: bookmarked.status || 'published',
            views: bookmarked.views || 0,
            likes: bookmarked.likes || 0
          } as Article;
        }
      }
    } catch (e) {
      console.warn("Error checking local storage in getArticleById", e);
    }

    // 2. If not found locally, try Supabase if configured
    if (isSupabaseConfigured()) {
      const isUUID = (val: any) => {
        if (typeof val !== 'string') return false;
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
      };

      try {
        const isValidId = isUUID(id);
        
        if (isValidId) {
          const fetchPromise = supabase
            .from('articles')
            .select('*')
            .eq('id', id)
            .single();

          const { data, error } = (await Promise.race([
            fetchPromise,
            timeout(15000)
          ])) as any;
          
          if (!error && data) {
            const article = mapSupabaseToArticle(data);
            
            // Fetch comments
            try {
              const { data: commentsData } = await (await Promise.race([
                supabase
                  .from('comments')
                  .select('*')
                  .eq('article_id', id)
                  .order('created_at', { ascending: false }),
                timeout(15000)
              ])) as any;
                
              if (commentsData) {
                article.comments = commentsData.map((c: any) => ({
                  id: String(c.id),
                  author: c.author_name || 'Anonymous',
                  content: c.content,
                  date: c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                  avatar: c.author_avatar,
                  userId: c.user_id
                }));
              }
            } catch (commentErr) {
              console.warn("Error fetching comments", commentErr);
            }
            
            return article;
          }
        } else {
          // If not a UUID, it might be an old numeric ID. 
          // Check if we can find a title mapping from INITIAL_ARTICLES
          const initial = INITIAL_ARTICLES.find(a => String(a.id) === String(id));
          if (initial) {
            console.log(`Found numeric ID ${id} in INITIAL_ARTICLES. Attempting title-based lookup for "${initial.title}"`);
            const articleByTitle = await articleService.getArticleByTitle(initial.title);
            if (articleByTitle) return articleByTitle;
          }
        }
      } catch (err) {
        console.error("Exception in getArticleById Supabase fetch:", err);
      }
    }
    
    // 3. Last resort: check INITIAL_ARTICLES
    return INITIAL_ARTICLES.find(a => String(a.id) === String(id));
  },

  getArticlesByIds: async (ids: (string | number)[]): Promise<Article[]> => {
    if (ids.length === 0) return [];
    
    const uniqueIds = Array.from(new Set(ids.map(id => String(id))));
    const results: Article[] = [];
    
    // Split IDs into UUIDs and others
    const isUUID = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    const uuids = uniqueIds.filter(isUUID);
    const otherIds = uniqueIds.filter(id => !isUUID(id));
    
    // 1. Fetch UUIDs from Supabase
    if (isSupabaseConfigured() && uuids.length > 0) {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .in('id', uuids);
          
        if (!error && data) {
          results.push(...data.map(mapSupabaseToArticle));
        }
      } catch (err) {
        console.error("Error fetching articles by multiple IDs from Supabase:", err);
      }
    }
    
    // 2. Fetch others from local storage and initial articles
    for (const id of otherIds) {
      const article = await articleService.getArticleById(id);
      if (article) results.push(article);
    }
    
    // 3. For any UUIDs that weren't found in Supabase (unlikely but possible), try local/initial
    const foundUuids = results.map(r => String(r.id));
    const missingUuids = uuids.filter(id => !foundUuids.includes(id));
    for (const id of missingUuids) {
      const article = await articleService.getArticleById(id);
      if (article) results.push(article);
    }
    
    return results;
  },

  saveArticle: async (article: Article): Promise<void> => {
    // Clear session cache to ensure fresh data on next fetch
    try {
      sessionStorage.removeItem('cached_published_articles_v1');
    } catch (e) {
      console.warn('Failed to clear session cache', e);
    }

    if (isSupabaseConfigured()) {
      const { data: { user } } = await supabase.auth.getUser();
      
      let authorId = user?.id; 
      if (!authorId) {
          const authData = localStorage.getItem('admin-auth');
          const localUser = authData ? JSON.parse(authData).user : null;
          authorId = localUser?.username || localUser?.email || article.author;
      }

      const articleData: any = {
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
        tags: article.tags || [],
        local_images: article.localImages || {},
        is_trending: article.isTrending || false,
        priority: article.priority || 'medium',
        slug: articleService.generateSlug(article.title)
      };

      try {
        // Check if ID is a valid UUID (existing Supabase article)
        const isUUID = (id: any) => {
          if (!id) return false;
          const s = String(id);
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
        };
        
        const isExistingArticle = article.id && isUUID(article.id);
        console.log("Saving article:", { id: article.id, isExistingArticle });

        if (isExistingArticle) {
            // Update existing UUID article
            const { error } = await supabase
              .from('articles')
              .update(articleData)
              .eq('id', article.id);
            if (error) throw error;
        } else {
            // New article or local temporary ID -> Insert
            // Don't pass the local ID, let Supabase generate a UUID
            const { error } = await supabase
              .from('articles')
              .insert(articleData);
            if (error) throw error;
        }
      } catch (error: any) {
        console.error("Supabase Save Error:", error);
        if (error.message === 'Failed to fetch') {
          throw new Error("Connection failed: Could not connect to Supabase. Please check your internet connection and ensure your Supabase URL in .env is correct and reachable.");
        }
        throw error;
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
    // Clear session cache
    try {
      sessionStorage.removeItem('cached_published_articles_v1');
    } catch (e) {
      console.warn('Failed to clear session cache', e);
    }

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

  generateSlug: (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  calculateReadTime: (content: string): string => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const time = Math.ceil(words / wordsPerMinute);
    return `${time} min read`;
  }
};
