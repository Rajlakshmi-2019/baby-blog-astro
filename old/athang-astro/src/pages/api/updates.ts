import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'data', 'updates.json');

function readData() {
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { milestones: [], medical: {}, astrology: {}, schooling: {} };
  }
}

function writeData(data: any) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

export const GET: APIRoute = async () => {
  const data = readData();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const type = form.get('type')?.toString();
  const data = readData();

  if (type === 'milestone') {
    const title = form.get('title')?.toString() ?? '';
    const date = form.get('date')?.toString() ?? '';
    const description = form.get('description')?.toString() ?? '';
    data.milestones = data.milestones || [];
    data.milestones.unshift({ title, date, description });
  }

  if (type === 'medical') {
    data.medical = {
      birthWeight: form.get('birthWeight')?.toString() ?? '',
      bloodGroup: form.get('bloodGroup')?.toString() ?? '',
      lastCheckup: form.get('lastCheckup')?.toString() ?? '',
      notes: form.get('notes')?.toString() ?? ''
    };
  }

  if (type === 'astrology') {
    data.astrology = {
      birthDetails: form.get('birthDetails')?.toString() ?? '',
      rashi: form.get('rashi')?.toString() ?? '',
      nakshatra: form.get('nakshatra')?.toString() ?? '',
      notes: form.get('notes')?.toString() ?? ''
    };
  }

  if (type === 'schooling') {
    const activitiesRaw = form.get('activities')?.toString() ?? '';
    const activities = activitiesRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    data.schooling = {
      schoolName: form.get('schoolName')?.toString() ?? '',
      className: form.get('className')?.toString() ?? '',
      activities
    };
  }

  writeData(data);

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/admin'
    }
  });
};
