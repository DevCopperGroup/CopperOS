import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

/**
 * Middleware seguro e resiliente de validação com Zod
 */
export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await schema.safeParseAsync({
        body: req.body || {},
        query: req.query || {},
        params: req.params || {},
      });

      if (!result.success) {
        const issues = result.error.issues || [];
        const formattedErrors = issues.map((err) => ({
          field: err.path.join('.').replace(/^(body|query|params)\./, ''),
          message: err.message,
        }));

        const primaryMessage = formattedErrors[0]?.message || 'Erro de validação nos campos informados';

        res.status(400).json({
          message: primaryMessage,
          errors: formattedErrors,
        });
        return;
      }

      if (result.data?.body) req.body = result.data.body;
      if (result.data?.query) req.query = result.data.query;
      if (result.data?.params) req.params = result.data.params;

      next();
    } catch (err: any) {
      console.error('Erro crítico na validação:', err);
      res.status(400).json({
        message: err.message || 'Erro de validação nos dados fornecidos',
      });
    }
  };
};
