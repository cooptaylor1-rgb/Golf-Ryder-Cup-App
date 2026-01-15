import { NextRequest, NextResponse } from 'next/server';

/**
 * SCORECARD OCR API
 *
 * Accepts an image (base64 encoded) of a golf scorecard and uses
 * AI vision to extract hole data (par, handicap, yardage).
 *
 * Uses OpenAI's GPT-4 Vision API to analyze the scorecard.
 *
 * Note: PDF files are not directly supported by OpenAI Vision.
 * For PDFs, users should convert to image or use image capture.
 */

interface HoleData {
  par: number;
  handicap: number;
  yardage: number | null;
}

interface ScorecardData {
  courseName?: string;
  teeName?: string;
  rating?: number;
  slope?: number;
  holes: HoleData[];
}

interface RequestBody {
  image: string; // Base64 encoded image data
  mimeType: string; // image/jpeg, image/png, etc.
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();

    if (!body.image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Check if PDF - OpenAI Vision doesn't support PDFs directly
    if (body.mimeType === 'application/pdf') {
      return NextResponse.json(
        {
          error: 'PDF files are not supported directly. Please take a photo of your scorecard or convert the PDF to an image first.',
          suggestion: 'Try using your phone camera to capture the scorecard, or screenshot the PDF.'
        },
        { status: 400 }
      );
    }

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Return mock data for demo/development
      console.log('No OpenAI API key configured, returning sample data');
      return NextResponse.json({
        success: true,
        data: getMockScorecardData(),
        message: 'Demo mode: Configure OPENAI_API_KEY for real OCR',
      });
    }

    // Prepare the image URL for OpenAI
    const imageUrl = `data:${body.mimeType};base64,${body.image}`;

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a golf scorecard analyzer. Extract course information from scorecard images.

Always respond with valid JSON in exactly this format:
{
  "courseName": "string or null",
  "teeName": "string or null (e.g., 'Blue', 'Championship', 'White')",
  "rating": "number or null",
  "slope": "number or null",
  "holes": [
    { "par": number, "handicap": number, "yardage": number or null },
    ... (18 holes total)
  ]
}

Rules:
- Par values must be 3, 4, or 5
- Handicap values must be 1-18, each appearing exactly once
- Yardage can be null if not visible
- If you can't read a value, use reasonable defaults (par 4, sequential handicaps)
- Always return exactly 18 holes
- Extract the tee name/color if visible (e.g., "Blue Tees", "Championship", "Men's")
- Extract course rating and slope if visible`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this golf scorecard image and extract all hole data (par, handicap, yardage for each hole), course name, tee name, rating, and slope. Return the data as JSON.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to analyze scorecard', details: error },
        { status: 500 }
      );
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    // Parse the JSON from the response
    let parsedData: ScorecardData;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonStr = jsonMatch[1].trim();
      parsedData = JSON.parse(jsonStr);
    } catch {
      console.error('Failed to parse AI response:', content);
      return NextResponse.json(
        { error: 'Failed to parse scorecard data', rawResponse: content },
        { status: 500 }
      );
    }

    // Validate and clean the data
    const cleanedData = validateAndCleanData(parsedData);

    return NextResponse.json({
      success: true,
      data: cleanedData,
    });
  } catch (error) {
    console.error('Scorecard OCR error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

function validateAndCleanData(data: ScorecardData): ScorecardData {
  // Ensure we have 18 holes
  const holes: HoleData[] = [];
  const usedHandicaps = new Set<number>();

  for (let i = 0; i < 18; i++) {
    const hole = data.holes?.[i];

    // Validate par (3-5)
    let par = hole?.par ?? 4;
    if (par < 3) par = 3;
    if (par > 5) par = 5;

    // Validate handicap (1-18, unique)
    let handicap = hole?.handicap ?? (i + 1);
    if (handicap < 1 || handicap > 18 || usedHandicaps.has(handicap)) {
      // Find next available handicap
      for (let h = 1; h <= 18; h++) {
        if (!usedHandicaps.has(h)) {
          handicap = h;
          break;
        }
      }
    }
    usedHandicaps.add(handicap);

    // Validate yardage
    let yardage = hole?.yardage ?? null;
    if (yardage !== null && (yardage < 50 || yardage > 700)) {
      yardage = null;
    }

    holes.push({ par, handicap, yardage });
  }

  return {
    courseName: data.courseName || undefined,
    teeName: data.teeName || undefined,
    rating: data.rating && data.rating > 60 && data.rating < 80 ? data.rating : undefined,
    slope: data.slope && data.slope > 55 && data.slope < 155 ? data.slope : undefined,
    holes,
  };
}

function getMockScorecardData(): ScorecardData {
  return {
    courseName: 'Sample Golf Course',
    teeName: 'Blue',
    rating: 72.4,
    slope: 128,
    holes: [
      { par: 4, handicap: 7, yardage: 385 },
      { par: 4, handicap: 15, yardage: 362 },
      { par: 3, handicap: 11, yardage: 175 },
      { par: 5, handicap: 1, yardage: 548 },
      { par: 4, handicap: 9, yardage: 412 },
      { par: 4, handicap: 3, yardage: 445 },
      { par: 3, handicap: 17, yardage: 162 },
      { par: 4, handicap: 13, yardage: 378 },
      { par: 5, handicap: 5, yardage: 525 },
      { par: 4, handicap: 8, yardage: 402 },
      { par: 4, handicap: 16, yardage: 355 },
      { par: 3, handicap: 12, yardage: 185 },
      { par: 5, handicap: 2, yardage: 555 },
      { par: 4, handicap: 10, yardage: 395 },
      { par: 4, handicap: 4, yardage: 432 },
      { par: 3, handicap: 18, yardage: 148 },
      { par: 4, handicap: 14, yardage: 368 },
      { par: 5, handicap: 6, yardage: 518 },
    ],
  };
}
