const process = require('process');
const { Metadata, credentials } = require('@grpc/grpc-js');
const { AwsLambdaInstrumentation } = require('@opentelemetry/instrumentation-aws-lambda');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');

// Honeycomb
const HONEYCOMB_API_KEY = process.env.HONEYCOMB_API_KEY || '';
const HONEYCOMB_DATASET = process.env.HONEYCOMB_DATASET || '';
const SERVICE_NAME = process.env.SERVICE_NAME || 'node-year-service';
const OTLP_ENDPOINT = process.env.HONEYCOMB_API_ENDPOINT || 'grpc://api.honeycomb.io:443/';

const metadata = new Metadata();
metadata.set('x-honeycomb-team', HONEYCOMB_API_KEY);
metadata.set('x-honeycomb-dataset', HONEYCOMB_DATASET);

const traceExporter = new OTLPTraceExporter({
  url: OTLP_ENDPOINT,
  credentials: credentials.createSsl(),
  metadata,
});

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
  }),
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
    new AwsLambdaInstrumentation({
      // By default, this instrumentation will try to read the context from the _X_AMZN_TRACE_ID environment variable set by Lambda,
      // set this to true or set the environment variable OTEL_LAMBDA_DISABLE_AWS_CONTEXT_PROPAGATION=true to disable this behavior
      disableAwsContextPropagation: true,
      requestHook: (span, { event, context }) => {
        span.setAttribute('faas.name', context.functionName);
      },
      responseHook: (span, { err, res }) => {
        if (err instanceof Error) span.setAttribute('faas.error', err.message);
        if (res) span.setAttribute('faas.res', res);
      },
    }),
  ],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
