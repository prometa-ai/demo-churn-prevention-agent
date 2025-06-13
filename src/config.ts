import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

interface Secrets {
  CHURN_PREVENTION_OPENAI_API_KEY: string;
}

interface GCPConfig {
  projectId: string;
  secretId: string;
  versionId: string;
}

class SecretManager {
  private static instance: SecretManager;
  private secrets: Secrets | null = null;
  private client: SecretManagerServiceClient;
  private gcpConfig: GCPConfig;

  private constructor() {
    this.client = new SecretManagerServiceClient();
    this.gcpConfig = {
      projectId: process.env.GCP_PROJECT_ID || '',
      secretId: process.env.SECRET_MANAGER_KEY || '',
      versionId: 'latest'
    };
  }

  public static getInstance(): SecretManager {
    if (!SecretManager.instance) {
      SecretManager.instance = new SecretManager();
    }
    return SecretManager.instance;
  }

  public async initialize(): Promise<void> {
    if (!this.secrets) {
      // In development, use environment variable directly
      if (process.env.NODE_ENV === 'development') {
        const apiKey = process.env.CHURN_PREVENTION_OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error('CHURN_PREVENTION_OPENAI_API_KEY environment variable must be set in development');
        }
        this.secrets = {
          CHURN_PREVENTION_OPENAI_API_KEY: apiKey,
        };
        return;
      }

      // In production, use Secret Manager
      if (!this.gcpConfig.projectId || !this.gcpConfig.secretId) {
        throw new Error('GCP_PROJECT_ID and SECRET_MANAGER_KEY environment variables must be set');
      }

      const name = `projects/${this.gcpConfig.projectId}/secrets/${this.gcpConfig.secretId}/versions/${this.gcpConfig.versionId}`;
      
      try {
        const [version] = await this.client.accessSecretVersion({ name });
        const secretsData = JSON.parse(version.payload?.data?.toString() || '{}');
        
        if (!secretsData.CHURN_PREVENTION_OPENAI_API_KEY) {
          throw new Error('CHURN_PREVENTION_OPENAI_API_KEY not found in secret manager');
        }

        this.secrets = {
          CHURN_PREVENTION_OPENAI_API_KEY: secretsData.CHURN_PREVENTION_OPENAI_API_KEY,
        };
      } catch (error) {
        throw new Error(`Failed to fetch secrets from Secret Manager: ${error}`);
      }
    }
  }

  public getSecret(key: keyof Secrets): string {
    if (!this.secrets) {
      throw new Error('Secrets not initialized. Call initialize() first.');
    }
    return this.secrets[key];
  }
}

const secretManager = SecretManager.getInstance();

export const getOpenAIApiKey = async (): Promise<string> => {
  await secretManager.initialize();
  return secretManager.getSecret('CHURN_PREVENTION_OPENAI_API_KEY');
}; 