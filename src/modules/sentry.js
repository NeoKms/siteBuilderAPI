const Sentry = require("@sentry/node");
const Tracing =  require("@sentry/tracing");
const config = require("../config");

module.exports = (app) => {
  if (config.SENTRY !== false) {
    Sentry.init({
      environment: config.PRODUCTION ? "production" : "develop",
      dsn: config.SENTRY,
      integrations: [
        new Sentry.Integrations.Http({breadcrumbs: true, tracing: true}),
        new Tracing.Integrations.Express({app}),
      ],
      tracesSampleRate: 1.0,
    });
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
  }
};
