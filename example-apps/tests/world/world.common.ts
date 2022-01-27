import {
  setWorldConstructor,
  setDefaultTimeout,
  World,
} from "@cucumber/cucumber";
import { Response } from "node-fetch";
import { config } from "../config";

// Override the default timeout to 10 seconds
setDefaultTimeout(10 * 1000);
export class CommonWorld extends World {
  private statusCode: number = 0;
  private responseBody: any = null;

  constructor(options: any) {
    super(options);
  }

  public getDefaultHeaders(): any {
    const result: any = {
      Accept: "application/json",
      "Accept-Language": "en-NZ",
    };

    if (!!config.hostName) {
      result.Host = config.hostName;
    }

    return result;
  }

  public getStatusCode(): number {
    return this.statusCode;
  }

  public getResponseBody(): any {
    return this.responseBody;
  }

  public async callApiAsync(apiInvocation: () => Promise<Response>) {
    try {
      const response = await apiInvocation();
      this.setResponse(response.status, await response.text());
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  private setResponse(statusCode: number, responseBody: any): void {
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}

setWorldConstructor(CommonWorld);
