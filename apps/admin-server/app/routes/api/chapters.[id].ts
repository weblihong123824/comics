// json function removed in React Router v7
import { getDatabase } from '../../db/dev';
import { ComicService } from '../../services/comic.service';

export async function loader({ params, context }: any) {
  const db = getDatabase(context);
  const comicService = new ComicService(db);
  
  try {
    const chapter = await comicService.getChapterById(params.id);
    if (!chapter) {
      return Response.json({ success: false, error: 'Chapter not found' }, { status: 404 });
    }
    
    const pages = await comicService.getPagesByChapterId(params.id);
    return { 
      success: true, 
      data: { chapter, pages } 
    };
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch chapter' },
      { status: 500 }
    );
  }
}

export async function action({ request, params, context }: any) {
  const db = getDatabase(context);
  const comicService = new ComicService(db);
  
  if (request.method === 'POST') {
    try {
      const { comicId, chapterNumber, title, pageCount, pages: pageData } = await request.json();
      
      const comic = await comicService.getComicById(comicId);
      if (!comic) {
        return Response.json({ success: false, error: 'Comic not found' }, { status: 404 });
      }
      
      const newChapter = await comicService.createChapter(
        { comicId, chapterNumber, title, pageCount }, 
        comic.freeChapters
      );
      
      // Create pages for the chapter
      if (pageData && Array.isArray(pageData)) {
        for (const page of pageData) {
          await comicService.createPage({ 
            chapterId: newChapter.id, 
            ...page 
          });
        }
      }
      
      // Update comic's lastChapterUpdate and hasUpdates status
      await comicService.updateComic(comicId, {
        lastChapterUpdate: new Date(),
        hasUpdates: true,
      });
      
      return Response.json({ 
        success: true, 
        data: newChapter,
        message: '章节创建成功' 
      }, { status: 201 });
    } catch (error) {
      console.error('Error creating chapter:', error);
      return Response.json(
        { success: false, error: 'Failed to create chapter' },
        { status: 500 }
      );
    }
  }
  
  return Response.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
