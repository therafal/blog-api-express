import { NextFunction, Request, Response, Router } from "express";

const router = Router();

router.get(
  "/posts",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const posts = await req.prisma.posts.findMany({
        select: {
          id: true,
          title: true,
          author_id: true,
          created_at: true,
        },
      });

      if (!posts) return res.status(404).send("Not found");

      res.status(200).send(
        posts.map((post) => {
          return {
            id: post.id,
            title: post.title,
            author_id: post.author_id,
            created_at: Date.parse(post.created_at.toString()),
          };
        })
      );
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/posts/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const post = await req.prisma.posts.findUnique({
        where: {
          id: Number(req.params.id),
        },
        select: {
          id: true,
          title: true,
          content: true,
          author_id: true,
          created_at: true,
        },
      });

      if (!post) return res.status(404).send("Not found");

      res.status(200).send({
        id: post.id,
        title: post.title,
        content: post.content,
        author_id: post.author_id,
        created_at: Date.parse(post.created_at.toString()),
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/posts",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).send("Unauthorized");
      if (!req.body.title) return res.status(400).send("Missing title");
      if (!req.body.content) return res.status(400).send("Missing content");

      if (
        !req.user.permissions.includes("admin") &&
        !req.user.permissions.includes("managePosts")
      )
        return res.status(403).send("Forbidden");

      const post = await req.prisma.posts.create({
        data: {
          title: req.body.title,
          content: req.body.content,
          author_id: req.user.id,
        },
        select: {
          id: true,
        },
      });
      res.status(200).send(post);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/posts/me/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).send("Unauthorized");
      if (!req.body.title) return res.status(400).send("Missing title");
      if (!req.body.content) return res.status(400).send("Missing content");

      const post = await req.prisma.posts.findUnique({
        where: {
          id: Number(req.params.id),
        },
        select: {
          id: true,
          author_id: true,
        },
      });

      if (!post) return res.status(404).send("Not found");
      if (post.author_id !== req.user.id)
        return res.status(403).send("Forbidden");

      if (
        !req.user.permissions.includes("admin") &&
        !req.user.permissions.includes("managePosts")
      )
        return res.status(403).send("Forbidden");

      const updatedPost = await req.prisma.posts.update({
        where: {
          id: Number(req.params.id),
        },
        data: {
          title: req.body.title,
          content: req.body.content,
        },
        select: {
          id: true,
        },
      });
      res.status(200).send(updatedPost);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/posts/me/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).send("Unauthorized");

      const post = await req.prisma.posts.findUnique({
        where: {
          id: Number(req.params.id),
        },
        select: {
          id: true,
          author_id: true,
        },
      });

      if (!post) return res.status(404).send("Not found");
      if (post.author_id !== req.user.id)
        return res.status(403).send("Forbidden");

      if (
        !req.user.permissions.includes("admin") &&
        !req.user.permissions.includes("managePosts")
      )
        return res.status(403).send("Forbidden");

      await req.prisma.posts.delete({
        where: {
          id: Number(req.params.id),
        },
      });

      res.status(200).send("Post deleted");
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/posts/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).send("Unauthorized");
      if (!req.body.title) return res.status(400).send("Missing title");
      if (!req.body.content) return res.status(400).send("Missing content");

      if (!req.user.permissions.includes("admin"))
        res.status(403).send("Forbidden");

      const updatedPost = await req.prisma.posts.update({
        where: {
          id: Number(req.params.id),
        },
        data: {
          title: req.body.title,
          content: req.body.content,
        },
        select: {
          id: true,
        },
      });
      res.status(200).send(updatedPost);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/posts/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).send("Unauthorized");

      if (!req.user.permissions.includes("admin"))
        res.status(403).send("Forbidden");

      await req.prisma.posts.delete({
        where: {
          id: Number(req.params.id),
        },
      });
      res.status(200).send("Post deleted");
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
