import type { Request, Response } from "express";
export declare const getAccessToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const haveAccessToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getSlackChannels: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const sendMessageToSlack: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getWorkSpaceDetails: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const sendScheduleMessageToSlack: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteScheduledMessage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getScheduledMessages: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=slackController.d.ts.map