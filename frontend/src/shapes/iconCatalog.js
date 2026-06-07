// shapes/iconCatalog.js
// Curated catalog of VERIFIED cloud/infra/tech icons from Iconify.
// Format: 'collection:icon-name' (see https://icon-sets.iconify.design)
//
// Collections used:
//   - logos:    SVG Logos (mainstream brand icons)
//   - gcp:      Google Cloud Platform (dedicated GCP icon set)
//   - devicon:  Devicon (1000+ language/framework icons)
//   - simple-icons: simple brand icons
//
// All IDs verified against Iconify.

export const ICON_CATEGORIES = [
  // ===== AWS =====
  {
    name: 'AWS',
    accent: '#FF9900',
    icons: [
      { id: 'logos:aws',                 label: 'AWS' },
      { id: 'logos:aws-lambda',          label: 'Lambda' },
      { id: 'logos:aws-s3',              label: 'S3' },
      { id: 'logos:aws-ec2',             label: 'EC2' },
      { id: 'logos:aws-rds',             label: 'RDS' },
      { id: 'logos:aws-dynamodb',        label: 'DynamoDB' },
      { id: 'logos:aws-cloudfront',      label: 'CloudFront' },
      { id: 'logos:aws-api-gateway',     label: 'API Gateway' },
      { id: 'logos:aws-iam',             label: 'IAM' },
      { id: 'logos:aws-sns',             label: 'SNS' },
      { id: 'logos:aws-sqs',             label: 'SQS' },
      { id: 'logos:aws-cloudwatch',      label: 'CloudWatch' },
      { id: 'logos:aws-route53',         label: 'Route 53' },
      { id: 'logos:aws-fargate',         label: 'Fargate' },
      { id: 'logos:aws-ecs',             label: 'ECS' },
      { id: 'logos:aws-eks',             label: 'EKS' },
      { id: 'logos:aws-glue',            label: 'Glue' },
      { id: 'logos:aws-cognito',         label: 'Cognito' },
    ],
  },

  // ===== Google Cloud (uses dedicated gcp: collection) =====
  {
    name: 'Google Cloud',
    accent: '#4285F4',
    icons: [
      { id: 'logos:google-cloud',                label: 'GCP' },
      { id: 'gcp:cloud-functions',                label: 'Functions' },
      { id: 'gcp:cloud-storage',                  label: 'Storage' },
      { id: 'gcp:cloud-run',                      label: 'Cloud Run' },
      { id: 'gcp:cloud-sql',                      label: 'Cloud SQL' },
      { id: 'gcp:pubsub',                         label: 'Pub/Sub' },
      { id: 'gcp:bigquery',                       label: 'BigQuery' },
      { id: 'gcp:bigtable',                       label: 'Bigtable' },
      { id: 'gcp:google-kubernetes-engine',       label: 'GKE' },
      { id: 'gcp:cloud-spanner',                  label: 'Spanner' },
      { id: 'gcp:dataflow',                       label: 'Dataflow' },
      { id: 'gcp:cloud-build',                    label: 'Cloud Build' },
      { id: 'gcp:cloud-cdn',                      label: 'Cloud CDN' },
      { id: 'gcp:cloud-load-balancing',           label: 'Load Balancing' },
      { id: 'gcp:firestore',                      label: 'Firestore' },
      { id: 'logos:firebase',                     label: 'Firebase' },
    ],
  },

  // ===== Azure =====
  {
    name: 'Azure',
    accent: '#0078D4',
    icons: [
      { id: 'logos:microsoft-azure',     label: 'Azure' },
      { id: 'logos:azure-functions',     label: 'Functions' },
      { id: 'logos:azure-pipelines',     label: 'Pipelines' },
      { id: 'logos:azure-devops',        label: 'DevOps' },
    ],
  },

  // ===== Databases =====
  {
    name: 'Databases',
    accent: '#10B981',
    icons: [
      { id: 'logos:postgresql',          label: 'PostgreSQL' },
      { id: 'logos:mysql',               label: 'MySQL' },
      { id: 'logos:mongodb-icon',        label: 'MongoDB' },
      { id: 'logos:redis',               label: 'Redis' },
      { id: 'logos:elasticsearch',       label: 'Elasticsearch' },
      { id: 'logos:sqlite',              label: 'SQLite' },
      { id: 'logos:snowflake-icon',      label: 'Snowflake' },
      { id: 'logos:supabase-icon',       label: 'Supabase' },
      { id: 'logos:planetscale-icon',    label: 'PlanetScale' },
      { id: 'logos:cassandra',           label: 'Cassandra' },
      { id: 'logos:influxdb',            label: 'InfluxDB' },
      { id: 'logos:neo4j',               label: 'Neo4j' },
      { id: 'devicon:cockroachdb',       label: 'CockroachDB' },
      { id: 'devicon:mariadb',           label: 'MariaDB' },
    ],
  },

  // ===== DevOps =====
  {
    name: 'DevOps',
    accent: '#326CE5',
    icons: [
      { id: 'logos:docker-icon',         label: 'Docker' },
      { id: 'logos:kubernetes',          label: 'Kubernetes' },
      { id: 'logos:terraform-icon',      label: 'Terraform' },
      { id: 'logos:ansible',             label: 'Ansible' },
      { id: 'logos:jenkins',             label: 'Jenkins' },
      { id: 'logos:github-actions',      label: 'GH Actions' },
      { id: 'logos:gitlab',              label: 'GitLab' },
      { id: 'logos:bitbucket',           label: 'Bitbucket' },
      { id: 'logos:circleci',            label: 'CircleCI' },
      { id: 'logos:vercel-icon',         label: 'Vercel' },
      { id: 'logos:netlify-icon',        label: 'Netlify' },
      { id: 'logos:cloudflare',          label: 'Cloudflare' },
      { id: 'logos:nginx',               label: 'Nginx' },
      { id: 'logos:prometheus',          label: 'Prometheus' },
      { id: 'logos:grafana',             label: 'Grafana' },
      { id: 'logos:datadog',             label: 'Datadog' },
      { id: 'logos:sentry-icon',         label: 'Sentry' },
      { id: 'logos:helm',                label: 'Helm' },
    ],
  },

  // ===== Backend =====
  {
    name: 'Backend',
    accent: '#8B5CF6',
    icons: [
      { id: 'logos:nodejs-icon',         label: 'Node.js' },
      { id: 'logos:python',              label: 'Python' },
      { id: 'logos:go',                  label: 'Go' },
      { id: 'logos:rust',                label: 'Rust' },
      { id: 'logos:java',                label: 'Java' },
      { id: 'logos:ruby',                label: 'Ruby' },
      { id: 'logos:php',                 label: 'PHP' },
      { id: 'logos:typescript-icon',     label: 'TypeScript' },
      { id: 'devicon:csharp',            label: 'C#' },
      { id: 'devicon:dotnetcore',        label: '.NET' },
      { id: 'devicon:elixir',            label: 'Elixir' },
      { id: 'devicon:scala',             label: 'Scala' },
      { id: 'logos:nestjs',              label: 'NestJS' },
      { id: 'logos:express',             label: 'Express' },
      { id: 'logos:django',              label: 'Django' },
      { id: 'logos:fastapi-icon',        label: 'FastAPI' },
      { id: 'logos:spring-icon',         label: 'Spring' },
      { id: 'logos:graphql',             label: 'GraphQL' },
      { id: 'logos:kafka',               label: 'Kafka' },
      { id: 'logos:rabbitmq-icon',       label: 'RabbitMQ' },
    ],
  },

  // ===== Frontend =====
  {
    name: 'Frontend',
    accent: '#F59E0B',
    icons: [
      { id: 'logos:react',               label: 'React' },
      { id: 'logos:vue',                 label: 'Vue' },
      { id: 'logos:angular-icon',        label: 'Angular' },
      { id: 'logos:svelte-icon',         label: 'Svelte' },
      { id: 'logos:nextjs-icon',         label: 'Next.js' },
      { id: 'devicon:nuxtjs',            label: 'Nuxt' },
      { id: 'devicon:remix',             label: 'Remix' },
      { id: 'logos:astro-icon',          label: 'Astro' },
      { id: 'logos:tailwindcss-icon',    label: 'Tailwind' },
      { id: 'logos:sass',                label: 'Sass' },
      { id: 'logos:webpack',             label: 'Webpack' },
      { id: 'logos:vitejs',              label: 'Vite' },
      { id: 'logos:html-5',              label: 'HTML' },
      { id: 'logos:css-3',               label: 'CSS' },
      { id: 'logos:javascript',          label: 'JavaScript' },
    ],
  },

  // ===== Tools =====
  {
    name: 'Tools',
    accent: '#EC4899',
    icons: [
      { id: 'logos:github-icon',         label: 'GitHub' },
      { id: 'logos:slack-icon',          label: 'Slack' },
      { id: 'logos:notion-icon',         label: 'Notion' },
      { id: 'logos:figma',               label: 'Figma' },
      { id: 'logos:stripe',              label: 'Stripe' },
      { id: 'logos:openai-icon',         label: 'OpenAI' },
      { id: 'logos:hugging-face-icon',   label: 'HuggingFace' },
      { id: 'simple-icons:anthropic',    label: 'Anthropic' },
      { id: 'logos:linear-icon',         label: 'Linear' },
      { id: 'logos:jira',                label: 'Jira' },
      { id: 'logos:auth0-icon',          label: 'Auth0' },
      { id: 'logos:twilio-icon',         label: 'Twilio' },
      { id: 'logos:sendgrid-icon',       label: 'SendGrid' },
      { id: 'logos:algolia',             label: 'Algolia' },
      { id: 'logos:posthog-icon',        label: 'PostHog' },
      { id: 'logos:zapier-icon',         label: 'Zapier' },
    ],
  },
];

// Flat list for search
export const ALL_ICONS = ICON_CATEGORIES.flatMap((cat) =>
  cat.icons.map((icon) => ({ ...icon, category: cat.name, accent: cat.accent }))
);
