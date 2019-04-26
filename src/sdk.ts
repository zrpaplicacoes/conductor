const uuid = require('uuid/v4');

import * as dotenv from 'dotenv';

import * as request from 'request';
import * as fs from 'fs';
import { URL } from 'url';

import { noop } from './util';



/**
 * @internal
 */
interface OAuth2Response {
  /**
   * The Authorization Token granted by the server
   */
  access_token: string;

  token_type: string;

  /**
   * Determines the validity time of the token in seconds.
   * When it is close to expiration, a new call must be made to
   * obtain a new token.
   */
  expires_in: number;
}

export enum Environment {
  staging = 'staging',
  prod = 'prod'
}

export enum LogLevel {
  DEBUG,
  INFO,
  WARNING,
  ERROR,
}

export interface Config {
  env?: Environment;
  clientId?: string;
  clientSecret?: string;
  logLevel?: LogLevel;
  validate?: boolean;
  productId: number;
  plasticId: number;
  comercialOriginId: number;
}

export class SDK {
  private static _instance: SDK;

  private _env: Environment;
  private _logLevel: LogLevel;
  private _clientId: string;
  private _clientSecret: string;
  private _validate: boolean;
  private _productId: number | undefined;
  private _plasticId: number | undefined;
  private _comercialOriginId: number | undefined;

  private _accessToken: string | undefined;
  private _expiresIn: number | undefined;
  private _dir: string | undefined;

  private constructor(c?: Config) {
    dotenv.config();

    this._env = (c && c.env) || Environment.staging;
    this._clientId = (c && c.clientId) || process.env['CDT_CLIENT_ID'] as string;
    this._clientSecret = (c && c.clientSecret) || process.env['CDT_CLIENT_SECRET'] as string;
    this._logLevel = (c && c.logLevel) || LogLevel.DEBUG;
    this._validate = (c && c.validate) || false;

    this._productId = c && c.productId;
    this._plasticId = c && c.plasticId;
    this._comercialOriginId = c && c.comercialOriginId;

    if (!this._productId || !this._plasticId || !this._comercialOriginId) {
      throw new Error(`
        Invalid configuration provided.
        A productId, plasticId and comercialOriginId are required.

        Please contact Conductor to get yours.
      `);
    }

    const dir = './tmp';

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    this._dir = fs.realpathSync(dir);

    this.getToken().then(this.onToken.bind(this));
  }

  static async token(): Promise<string> {
    if (SDK._instance._accessToken) {
      return new Promise<string>((resolve, _) => resolve(SDK._instance._accessToken));
    } else {
      return new Promise<string>((resolve, reject) => {
        const i = setInterval(() => {
          if (SDK._instance._accessToken) {
            clearInterval(i);
            i.unref();
            resolve(SDK._instance._accessToken);
          }
        }, 100);
      });
    }
  }

  static config(c?: Config): SDK {
    if (!SDK._instance) {

      SDK._instance = new SDK(c);
    }

    return SDK._instance;
  }

  static write(b: Buffer): string {
    const id: string = uuid();
    const path: string = SDK._instance._dir + `/${id}`;

    fs.writeFileSync(path, b, { encoding: 'utf-8' });

    return path;
  }

  static get isValidationEnabled(): boolean {
    return SDK._instance._validate;
  }

  static get isProd(): boolean {
    return SDK._instance._env === Environment.prod;
  }

  private onToken(response: OAuth2Response) {
    this._accessToken = response.access_token;
    this._expiresIn = response.expires_in;

    const i = setInterval(() => {
      this._expiresIn ? this._expiresIn -= 1 : noop();

      if (this._expiresIn && this._expiresIn <= 1800) {
        console.log(`Reloading token after ${(3600 - this._expiresIn) / 60} minutes.`);
        clearInterval(i);
        i.unref();
        this.getToken().then(this.onToken.bind(this));
      }
    }, 1000);
  }

  private getToken(): Promise<OAuth2Response> {
    return new Promise<OAuth2Response>((resolve, reject) => {
      const options: request.UrlOptions & request.CoreOptions = {
        method: 'POST',
        url: `https://${this._env === Environment.prod ? 'auth' : 'auth.hml'}.caradhras.io/oauth2/token`,
        qs: {
          grant_type: 'client_credentials',
          client_secret: this._clientSecret,
          client_id: this._clientId,
        },
        headers:
        {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {}
      };

      request(options, (error, response, body) => {
        if (error) throw new Error(error);

        resolve(JSON.parse(body) as OAuth2Response);
      });
    });
  }
}
