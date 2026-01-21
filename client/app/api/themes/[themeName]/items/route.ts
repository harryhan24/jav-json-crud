import { NextRequest, NextResponse } from 'next/server';
import { addItemsToTheme } from '@/lib/db';
import { FileType } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ themeName: string }> }
) {
  try {
    const { themeName } = await params;
    const searchParams = request.nextUrl.searchParams;
    const fileType = (searchParams.get('fileType') as FileType) || 'theme';
    const { items } = await request.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 });
    }

    const updatedTheme = addItemsToTheme(themeName, items.map(i => i.trim()), fileType);
    return NextResponse.json(updatedTheme);
  } catch (error) {
    if (error instanceof Error && error.message === 'Theme not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to add items' }, { status: 500 });
  }
}
