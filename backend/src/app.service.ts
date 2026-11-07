import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema.js';
import { Rating } from './schemas/rating.schema.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AppService {
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Rating.name) private ratingModel: Model<Rating>,
  ) {}

  getHello(): string {
    return 'Handsome Rating System API is running!';
  }

  async registerUser(file: any, name: string, studentId: string) {
    if (!file) {
      throw new HttpException('Image file is required', HttpStatus.BAD_REQUEST);
    }
    if (!name || !studentId) {
      throw new HttpException('Name and studentId are required', HttpStatus.BAD_REQUEST);
    }

    let faceEncoding: number[] = [];
    try {
      const formData = new FormData();
      const blob = new Blob([file.buffer], { type: file.mimetype || 'image/jpeg' });
      formData.append('file', blob, file.originalname || 'user_face.jpg');

      const aiResponse = await axios.post(`${this.aiServiceUrl}/api/ai/extract-encoding`, formData);
      if (aiResponse.data && aiResponse.data.success && Array.isArray(aiResponse.data.encoding)) {
        faceEncoding = aiResponse.data.encoding;
      } else {
        throw new Error('Invalid encoding response from AI service');
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message;
      throw new HttpException(`AI Service Error: ${detail}`, HttpStatus.BAD_REQUEST);
    }

    const standardImagePath = path.join(process.cwd(), 'src', 'assets', 'standard_face.jpg');
    let standardImageBuffer: Buffer;
    try {
      if (fs.existsSync(standardImagePath)) {
        standardImageBuffer = fs.readFileSync(standardImagePath);
      } else {
        standardImageBuffer = file.buffer;
      }
    } catch {
      standardImageBuffer = file.buffer;
    }

    let handsomeScore = 85;
    let aiComment = 'Khuôn mặt cân đối, tỷ lệ đẹp trai tuyệt vời!';

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const userPart = {
          inlineData: {
            data: file.buffer.toString('base64'),
            mimeType: file.mimetype || 'image/jpeg',
          },
        };

        const standardPart = {
          inlineData: {
            data: standardImageBuffer.toString('base64'),
            mimeType: 'image/jpeg',
          },
        };

        const prompt = `Compare image 1 (the user) with image 2 (the standard of beauty). Calculate a handsome score from 0 to 100 based on how closely they resemble image 2, but add some random fun variations. Return a JSON strictly in this format: { "score": number, "comment": "A funny, professional, and witty comment about their facial structure and how they compare to the standard." }`;

        const result = await model.generateContent([prompt, userPart, standardPart]);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (typeof parsed.score === 'number') handsomeScore = Math.min(100, Math.max(0, parsed.score));
          if (typeof parsed.comment === 'string' && parsed.comment.trim()) aiComment = parsed.comment.trim();
        }
      } else {
        handsomeScore = Math.floor(Math.random() * 20) + 80;
        aiComment = 'Gương mặt góc cạnh chuẩn soái ca, thần thái ngút ngàn!';
      }
    } catch (geminiError: any) {
      console.warn('Gemini API Warning (using fallback):', geminiError.message || geminiError);
      handsomeScore = Math.floor(Math.random() * 20) + 80;
      aiComment = 'Nhan sắc cực phẩm, tỷ lệ chuẩn mực đốn tim người nhìn!';
    }

    try {
      const user = await this.userModel.findOneAndUpdate(
        { studentId },
        { name, studentId, faceEncoding, handsomeScore, aiComment },
        { upsert: true, new: true },
      );
      return { success: true, message: 'Đăng ký thành công', user };
    } catch (dbError: any) {
      throw new HttpException(`Database Error: ${dbError.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async scanRecognize(file: any) {
    if (!file) {
      throw new HttpException('Webcam frame file is required', HttpStatus.BAD_REQUEST);
    }

    let faces: Array<{ box: any; encoding: number[] }> = [];
    try {
      const formData = new FormData();
      const blob = new Blob([file.buffer], { type: file.mimetype || 'image/jpeg' });
      formData.append('file', blob, file.originalname || 'frame.jpg');

      const aiResponse = await axios.post(`${this.aiServiceUrl}/api/ai/recognize`, formData);
      if (aiResponse.data && aiResponse.data.success && Array.isArray(aiResponse.data.faces)) {
        faces = aiResponse.data.faces;
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message;
      throw new HttpException(`AI Service Error: ${detail}`, HttpStatus.BAD_REQUEST);
    }

    if (faces.length === 0) {
      throw new HttpException('Không tìm thấy khuôn mặt trong ảnh', HttpStatus.NOT_FOUND);
    }

    const users = await this.userModel.find().exec();
    if (users.length === 0) {
      throw new HttpException('Chưa có người dùng nào được đăng ký trong hệ thống', HttpStatus.NOT_FOUND);
    }

    let bestMatchUser: User | null = null;
    let minDistance = 0.6;

    for (const face of faces) {
      for (const user of users) {
        if (!user.faceEncoding || user.faceEncoding.length !== 128) continue;
        const distance = this.euclideanDistance(face.encoding, user.faceEncoding);
        if (distance < minDistance) {
          minDistance = distance;
          bestMatchUser = user;
        }
      }
    }

    if (!bestMatchUser) {
      throw new HttpException('Không tìm thấy người dùng phù hợp', HttpStatus.NOT_FOUND);
    }

    await this.ratingModel.create({
      userId: bestMatchUser._id,
      name: bestMatchUser.name,
      studentId: bestMatchUser.studentId,
      timestamp: new Date(),
      status: 'Success',
    });

    return {
      success: true,
      match: true,
      user: {
        _id: bestMatchUser._id,
        name: bestMatchUser.name,
        studentId: bestMatchUser.studentId,
        handsomeScore: bestMatchUser.handsomeScore,
        aiComment: bestMatchUser.aiComment,
      },
    };
  }

  async getLeaderboard() {
    const users = await this.userModel
      .find({}, 'name studentId handsomeScore aiComment createdAt')
      .sort({ handsomeScore: -1 })
      .limit(50)
      .exec();

    return {
      success: true,
      data: users,
    };
  }

  private euclideanDistance(vecA: number[], vecB: number[]): number {
    let sum = 0;
    for (let i = 0; i < vecA.length; i++) {
      const diff = vecA[i] - vecB[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }
}

