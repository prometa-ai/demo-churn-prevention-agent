interface Secrets {
  CHURN_PREVENTION_OPENAI_API_KEY: string;
}

class SecretManager {
  private static instance: SecretManager;
  private secrets: Secrets | null = null;

  private constructor() {}

  public static getInstance(): SecretManager {
    if (!SecretManager.instance) {
      SecretManager.instance = new SecretManager();
    }
    return SecretManager.instance;
  }

  public async initialize(): Promise<void> {
    if (!this.secrets) {
      const openaiApiKey = process.env.CHURN_PREVENTION_OPENAI_API_KEY;
      
      if (!openaiApiKey) {
        throw new Error('CHURN_PREVENTION_OPENAI_API_KEY environment variable is not set');
      }

      this.secrets = {
        CHURN_PREVENTION_OPENAI_API_KEY: openaiApiKey,
      };
    }
  }

  public getSecret(key: keyof Secrets): string {
    if (!this.secrets) {
      throw new Error('Secrets not initialized. Call initialize() first.');
    }
    return this.secrets[key];
  }
}

export const secretManager = SecretManager.getInstance();

export const getOpenAIApiKey = async (): Promise<string> => {
  await secretManager.initialize();
  return secretManager.getSecret('CHURN_PREVENTION_OPENAI_API_KEY');
}; 