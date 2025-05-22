import { router } from "../init";
import { coverLetterRouter } from "./coverLetter";
import { designRouter } from "./design";
import { jobsRouter } from "./jobs";
import { resumeRouter } from "./resume";

/**
 * Main application router
 * Contains all sub-routers for different features
 */
export const appRouter = router({
  resume: resumeRouter,
  design: designRouter,
  coverLetter: coverLetterRouter,
  jobs: jobsRouter,
});

// Export type definition for the client
export type AppRouter = typeof appRouter;
