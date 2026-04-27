import errorHandler from 'errorhandler';
import logger from './util/logger';
import app from './app';

/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());
/**
 * Start Express server.
 */
const server = app.listen(app.get('port'), () => {
    logger.info(
        `  App is running at http://localhost:${String(app.get('port'))} in ${String(app.get('env'))} mode`
    );
    logger.info('  Press CTRL-C to stop\n');
});

export default server;
