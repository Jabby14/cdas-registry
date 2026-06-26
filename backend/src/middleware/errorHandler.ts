import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(err);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const field = Array.isArray(err.meta?.target)
      ? err.meta.target.join(', ')
      : err.meta?.target;
    res.status(409).json({ message: `A record with that ${field} already exists.` });
    return;
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    res.status(404).json({ message: 'Record not found.' });
    return;
  }

  const status = err.status || 500;
  const message = err.message || 'Something went wrong on the server.';
  res.status(status).json({ message });
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
}