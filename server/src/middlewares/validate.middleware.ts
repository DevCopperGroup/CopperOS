import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

/**
 * Middleware seguro e resiliente de validação com Zod.
 *
 * Substitui body/query/params pelos valores já validados e coeridos, de modo
 * que os controllers nunca vejam o corpo bruto da requisição.
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

        const primaryMessage =
          formattedErrors[0]?.message || 'Erro de validação nos campos informados';

        res.status(400).json({
          message: primaryMessage,
          errors: formattedErrors,
        });
        return;
      }

      if (result.data?.body !== undefined) {
        req.body = result.data.body;
      }
      if (result.data?.params !== undefined) {
        req.params = result.data.params;
      }
      if (result.data?.query !== undefined) {
        // No Express 5 req.query é um getter no protótipo: atribuir direto
        // lança TypeError em módulo ESM (strict mode).
        Object.defineProperty(req, 'query', {
          value: result.data.query,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }

      next();
    } catch (err) {
      // safeParseAsync não lança em falha de validação: cair aqui significa
      // defeito no schema ou num refinement, ou seja, erro de servidor.
      next(err);
    }
  };
};
