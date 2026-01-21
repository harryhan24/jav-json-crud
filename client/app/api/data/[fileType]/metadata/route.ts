import { NextRequest, NextResponse } from 'next/server';
import { updateMetadata } from '@/lib/db';
import { FileType } from '@/lib/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ fileType: string }> }
) {
  try {
    const { fileType } = await params;
    const { themeName, description } = await request.json();

    if (!['actors', 'tags', 'theme', 'meta'].includes(fileType)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (typeof themeName !== 'string' || typeof description !== 'string') {
      return NextResponse.json({ error: 'themeName and description are required' }, { status: 400 });
    }

    const data = updateMetadata(fileType as FileType, themeName, description);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update metadata' }, { status: 500 });
  }
}
