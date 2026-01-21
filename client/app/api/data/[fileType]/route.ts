import {NextRequest, NextResponse} from 'next/server';
import {getData} from '@/lib/db';
import {FileType} from '@/lib/types';

export async function GET(request: NextRequest, {params}: { params: Promise<{ fileType: string }> }) {
    try {
        const {fileType} = await params;

        if (!['actors', 'tags', 'theme', 'meta', 'custom'].includes(fileType)) {
            return NextResponse.json({error: 'Invalid file type'}, {status: 400});
        }

        const data = getData(fileType as FileType);
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] Error fetching data:', error);
        return NextResponse.json({error: 'Failed to fetch data'}, {status: 500});
    }
}
