import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { bucket } from '../config/firebase';
import { uploadFiles } from '../service/file.service';
import * as path from 'path';

export type MediaItem = {
    file: Express.Multer.File;
    type: 'image' | 'video';
};

export type MediaItemResponse = {
    url: string
    type: string
};

const upload = multer({
    storage: multer.memoryStorage(), // 메모리에 저장
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 제한
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'video/mp4'];
        cb(null, allowed.includes(file.mimetype));
    },
});


export const uploadMediaFiles = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        await new Promise<void>((resolve, reject) => {
            upload.array('files', 10)(req, res, async (err) => {
                console.log(`uploadMediaFiles`)
                if (err) return reject(err);
                const files = req.files as Express.Multer.File[];
                const placeId = req.body.placeId as string;

                if (!placeId) return reject(new Error('placeId query param is required'));

                // 파일이 없을 경우 바로 응답
                if (!files?.length) {
                    return res
                        .status(200)
                        .json({});
                }

                // Multer.File 배열을 MediaItem 배열로 변환
                const mediaItems: MediaItem[] = files.map((file) => {
                    const isImage = file.mimetype.startsWith('image/');
                    const type = isImage ? 'image' : 'video';
                    return { file, type };
                });

                // 변환된 배열을 uploadFiles에 전달
                const result = await uploadFiles(placeId, mediaItems);
                res.status(200).json(result);
                resolve();
            });
        });
    } catch (e) {
        next(e);
    }
};