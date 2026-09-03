import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = parsed.body ?? req.body;
      req.query = parsed.query ?? req.query;
      req.params = parsed.params ?? req.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: 'Erro de validação nos campos informados',
          errors: error.errors.map((err) => ({
            field: err.path.join('.').replace(/^(body|query|params)\./, ''),
            message: err.message,
          })),
        });
        return;
      }

      res.status(500).json({ message: 'Erro interno na validação' });
    }
  };
};
