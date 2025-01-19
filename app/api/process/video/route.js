// app/api/process/video/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import File from '@/models/File';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Initialize FFmpeg
const ffmpeg = new FFmpeg({ log: true });

// Ensure FFmpeg is loaded
let ffmpegLoadPromise = null;
const loadFFmpeg = async () => {
  if (!ffmpegLoadPromise) {
    ffmpegLoadPromise = ffmpeg.load();
  }
  return ffmpegLoadPromise;
};

async function downloadVideo(url) {
  const response = await fetch(url);
  const buffer = await response.buffer();
  const tempPath = path.join(os.tmpdir(), `input-${Date.now()}.mp4`);
  await fs.promises.writeFile(tempPath, buffer);
  return tempPath;
}

async function processVideo(inputPath, fileId) {
  try {
    // Load FFmpeg
    await loadFFmpeg();

    // Read input file
    const inputData = await fs.promises.readFile(inputPath);
    await ffmpeg.writeFile('input.mp4', inputData);

    // Process video with multiple quality variants
    const qualities = [
      { name: '720p', height: 720, bitrate: '2500k' },
      { name: '480p', height: 480, bitrate: '1500k' },
      { name: '360p', height: 360, bitrate: '800k' }
    ];

    const processedUrls = {};

    for (const quality of qualities) {
      const outputFilename = `output_${quality.name}.mp4`;

      // Process video
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-b:v', quality.bitrate,
        '-vf', `scale=-2:${quality.height}`,
        '-preset', 'medium',
        '-movflags', '+faststart',
        '-y',
        outputFilename
      ]);

      // Read the processed file
      const outputData = await ffmpeg.readFile(outputFilename);

      // Upload to Firebase Storage
      const processedRef = ref(storage, `videos/processed/${fileId}/${quality.name}.mp4`);
      await uploadBytes(processedRef, outputData, {
        contentType: 'video/mp4'
      });

      // Get download URL
      const url = await getDownloadURL(processedRef);
      processedUrls[quality.name] = url;
    }

    return processedUrls;

  } catch (error) {
    console.error('Video processing error:', error);
    throw error;
  }
}

async function generateHLSPlaylist(processedUrls, fileId) {
  const playlist = `#EXTM3U
#EXT-X-VERSION:3

#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280x720
${processedUrls['720p']}

#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=854x480
${processedUrls['480p']}

#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
${processedUrls['360p']}`;

  // Upload playlist to Firebase Storage
  const playlistRef = ref(storage, `videos/processed/${fileId}/playlist.m3u8`);
  await uploadBytes(playlistRef, Buffer.from(playlist), {
    contentType: 'application/vnd.apple.mpegurl'
  });

  return await getDownloadURL(playlistRef);
}

export async function POST(request) {
  let inputPath = null;

  try {
    const { fileId, originalUrl } = await request.json();

    if (!fileId || !originalUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    await connectDB();

    // Update status to processing
    await File.findByIdAndUpdate(fileId, {
      processedStatus: 'processing',
      updatedAt: new Date()
    });

    // Download original video
    inputPath = await downloadVideo(originalUrl);

    // Process video and get processed URLs
    const processedUrls = await processVideo(inputPath, fileId);

    // Generate HLS playlist
    const playlistUrl = await generateHLSPlaylist(processedUrls, fileId);

    // Update document with processed URLs and playlist
    await File.findByIdAndUpdate(fileId, {
      processedStatus: 'completed',
      processedUrls,
      playlistUrl,
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Processing completed',
      processedUrls,
      playlistUrl
    });

  } catch (error) {
    console.error('Processing error:', error);

    // Update status to failed
    if (fileId) {
      await File.findByIdAndUpdate(fileId, {
        processedStatus: 'failed',
        processingError: error.message,
        updatedAt: new Date()
      });
    }

    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  } finally {
    // Clean up temporary files
    if (inputPath && fs.existsSync(inputPath)) {
      try {
        await fs.promises.unlink(inputPath);
      } catch (error) {
        console.error('Error cleaning up temporary file:', error);
      }
    }
  }
}
