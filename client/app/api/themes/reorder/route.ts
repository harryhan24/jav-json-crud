import { NextRequest, NextResponse } from 'next/server';
import { reorderThemes } from '@/lib/db';
import { FileType } from '@/lib/types';

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileType = (searchParams.get('fileType') as FileType) || 'theme';
    const { themeNames } = await request.json();

    if (!themeNames || !Array.isArray(themeNames)) {
      return NextResponse.json({ error: 'Theme names array is required' }, { status: 400 });
    }

    const reordered = reorderThemes(themeNames, fileType);
    return NextResponse.json(reordered);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to reorder themes' }, { status: 500 });
  }
}
