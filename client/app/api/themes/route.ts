import { NextRequest, NextResponse } from 'next/server';
import { getThemes, addTheme } from '@/lib/db';
import { FileType } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileType = (searchParams.get('fileType') as FileType) || 'theme';
    const themes = getThemes(fileType);
    return NextResponse.json(themes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileType = (searchParams.get('fileType') as FileType) || 'theme';
    const { theme } = await request.json();

    if (!theme || typeof theme !== 'string' || theme.trim() === '') {
      return NextResponse.json({ error: 'Theme name is required' }, { status: 400 });
    }

    const newTheme = addTheme(theme.trim(), fileType);
    return NextResponse.json(newTheme, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Theme already exists') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create theme' }, { status: 500 });
  }
}
