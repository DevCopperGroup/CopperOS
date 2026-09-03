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
    } catch (error: any) {
      const isZod = error instanceof ZodError || error?.name === 'ZodError' || Array.isArray(error?.issues) || Array.isArray(error?.errors);

      if (isZod) {
        const issues = error.issues || error.errors || [];
        const formattedErrors = issues.map((err: any) => ({
          field: err.path.join('.').replace(/^(body|query|params)\./, ''),
          message: err.message,
        }));

        res.status(400).json({
          message: formattedErrors[0]?.message || 'Erro de validação nos campos informados',
          errors: formattedErrors,
        });
        return;
      }

      console.error('Erro não esperado no middleware de validação:', error);
      res.status(500).json({ message: 'Erro interno na validação dos dados' });
    }
  };
};
