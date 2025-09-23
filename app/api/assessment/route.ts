import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the form data
    const formData = await request.formData();
    const name = formData.get('name') as string;
    
    // Simulate some server-side processing
    console.log(`Assessing: ${name}`);
    
    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error assessing:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}