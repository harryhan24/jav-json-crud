import { NextRequest, NextResponse } from 'next/server';
import { renameTheme } from '@/lib/db';
import { FileType } from '@/lib/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ themeName: string }> }
) {
  try {
    const { themeName } = await params;
    const searchParams = request.nextUrl.searchParams;
    const fileType = (searchParams.get('fileType') as FileType) || 'theme';
    const { newName } = await request.json();

    if (!newName || typeof newName !== 'string') {
      return NextResponse.json({ error: 'New theme name is required' }, { status: 400 });
    }

    const updatedTheme = renameTheme(themeName, newName, fileType);
    return NextResponse.json(updatedTheme);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Theme not found') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      } else if (error.message === 'Theme name already exists') {
        return NextResponse.json({ error: error.message }, { status: 409 });
      } else {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    return NextResponse.json({ error: 'Failed to rename theme' }, { status: 500 });
  }
}
