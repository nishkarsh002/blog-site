import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request) {
  try {
    const { path } = await request.json();
    
    if (path) {
      // Revalidate specific path
      revalidatePath(path);
      return NextResponse.json({ 
        success: true, 
        message: `Revalidated path: ${path}` 
      });
    } else {
      // Revalidate all main paths
      revalidatePath('/');
      revalidatePath('/blog');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Revalidated all main paths' 
      });
    }
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Revalidate all main paths
    revalidatePath('/');
    revalidatePath('/blog');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Revalidated all main paths' 
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    );
  }
}