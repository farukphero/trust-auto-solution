import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorhandler';

const app: Application = express();

app.use(express.json());
app.use(cors());

app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Trust Auto Solution system start.');
});

// handle global error
app.use(globalErrorHandler);
app.use(notFound);
export default app;
