import { NextRequest, NextResponse } from 'next/server';
import { deleteItemFromTheme } from '@/lib/db';
import { FileType } from '@/lib/types';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ themeName: string; item: string }> }
) {
  try {
    const { themeName, item } = await params;
    const searchParams = request.nextUrl.searchParams;
    const fileType = (searchParams.get('fileType') as FileType) || 'theme';

    const updatedTheme = deleteItemFromTheme(themeName, item, fileType);
    return NextResponse.json(updatedTheme);
  } catch (error) {
    if (error instanceof Error && error.message === 'Theme not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
