import { NextFunction, Request, Response, Router } from "express";
import util from "util";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = Router();

const DIR = path.resolve(__dirname, '../../public/data/uploads/');

if (!fs.existsSync(DIR)){
    fs.mkdirSync(DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, DIR)
    },
    filename: (req, file, cb) => {
      const filename = file.originalname.toLowerCase().split(' ').join('-')
      cb(null, filename)
    },
});
  
const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5,
    },
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype == 'image/png' ||
        file.mimetype == 'image/jpg' ||
        file.mimetype == 'image/jpeg' ||
        file.mimetype == 'image/gif' ||
        file.mimetype == 'image/svg+xml' ||
        file.mimetype == 'image/webp' ||
        file.mimetype == 'image/avif' ||
        file.mimetype == 'image/apng' 
      ) {
        cb(null, true)
      } else {
        cb(null, false)
        return cb(new Error('Image type should be: .jpeg, .jpg and .png!'))
      }
    },
});

router.post("/image", upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return res.status(401).send("Unauthorized");
        if (!req.file) return res.status(400).send("Missing file");
        
        const permissions = await req.prisma.users.findUnique({
            where: {
                id: req.user.id
            },
            select: {
                id: true,
                permissions: true
            }
        });

        if (!permissions) return res.status(403).send("Forbidden");
        if (!permissions.permissions.includes("admin") && !permissions.permissions.includes("uploadImages")) return res.status(403).send("Forbidden");

        const image = await req.prisma.images.findFirst({
            where: {
                name: req.file.filename
            },
            select: {
                id: true,
                name: true,
            }
        });

        if (image) return res.status(400).send("Image already exists");

        const newImage = await req.prisma.images.create({
            data: {
                name: req.file.filename,
                user_id: req.user.id
            },
            select: {
                id: true,
                name: true,
            }
        });

        res.status(200).send(newImage);
    } catch (err: any) {
        if (!req.file) return res.status(400).send("Missing file");
        if (err.code == "LIMIT_FILE_SIZE") return res.status(500).send( "File size cannot be larger than 5MB!");
        res.status(500).send(`Could not upload the file: ${req.file.originalname}. ${err}`);
        next(err);
    }
});

router.get("/images/me", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).send("Unauthorized");

      const images = await req.prisma.images.findMany({
          where: {
              user_id: req.user.id
          },
          select: {
              id: true,
              name: true,
          }
      });

      res.status(200).send(images);
    } catch (err) {
      next(err)
    }
});

router.get("/images/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).send("Unauthorized");
      
      const image = await req.prisma.images.findUnique({
          where: {
              id: Number(req.params.id),
          },
          select: {
              id: true,
              name: true,
          }
      });

      if (!image) return res.status(404).send("Image not found");

      res.status(200).send(image);
    } catch (err) {
      next(err)
    }
});

router.delete("/images/me/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).send("Unauthorized");

      const image = await req.prisma.images.findUnique({
          where: {
              id: Number(req.params.id),
          },
          select: {
              id: true,
              name: true,
              user_id: true,
          }
      });

        if (!image) return res.status(404).send("Image not found");

        if (image.user_id !== req.user.id) return res.status(403).send("Forbidden");

        fs.unlink(path.resolve(DIR, image.name), (err) => {
            if (err) {
                console.error(err)
                return res.status(500).send("Could not delete image");
            }
        });

      await req.prisma.images.delete({
          where: {
              id: Number(req.params.id),
          }
      });

      res.status(200).send("Image deleted");
    } catch (err) {
      next(err)
    }
});

router.delete("/images/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).send("Unauthorized");

      const permissions = await req.prisma.users.findUnique({
          where: {
              id: req.user.id
          },
          select: {
              id: true,
              permissions: true
          }
      });

      if (!permissions) return res.status(403).send("Forbidden");
      if (!permissions.permissions.includes("admin")) return res.status(403).send("Forbidden");

        const image = await req.prisma.images.findUnique({
            where: {
                id: Number(req.params.id),
            },
            select: {
                id: true,
                name: true,
                user_id: true,
            }
        });

        if (!image) return res.status(404).send("Image not found");

        fs.unlink(path.resolve(DIR, image.name), (err) => {
            if (err) {
                console.error(err)
                return res.status(500).send("Could not delete image");
            }
        });

      await req.prisma.images.delete({
          where: {
              id: Number(req.params.id),
          }
      });

      res.status(200).send("Image deleted");
    } catch (err) {
      next(err)
    }
});


module.exports = router;