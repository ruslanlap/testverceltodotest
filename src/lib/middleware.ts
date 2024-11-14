import { VercelRequest, VercelResponse } from '@vercel/node';

export function runMiddleware(

  req: VercelRequest,

  res: VercelResponse,

  fn: Function

) {

  return new Promise((resolve, reject) => {

    fn(req, res, (result: any) => {

      if (result instanceof Error) {

        return reject(result);

      }

      return resolve(result);

    });

  });

}