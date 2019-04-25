const dotenv = require('dotenv');
const mapper = require('object-mapper');

import * as https from 'https';
import * as qs from 'querystring';

import { ClientRequest, OutgoingHttpHeaders } from 'http';
import { ErrorResponse } from './responses';
import { noop } from './util';
import { clearInterval } from 'timers';

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

export interface Config {
  env?: Environment;
  clientId?: string;
  clientSecret?: string;
  logLevel?: LogLevel;
  validate?: boolean;
}

export class SDK {
  private static _instance: SDK;
  private _env: Environment;
  private _clientId: string;
  private _clientSecret: string;
  private _logLevel: LogLevel;
  private _validate: boolean;
  private _prevConfig: Config;


  private _accessToken: string | undefined;
  private _expiresIn: number | undefined;
  private _tokenType: string | undefined;

  private constructor(c: Config) {
    this._prevConfig = c;
    dotenv.config();

    this._env = c.env || Environment.staging;
    this._clientId = c.clientId || process.env['CDT_CLIENT_ID'] as string;
    this._clientSecret = c.clientSecret || process.env['CDT_CLIENT_SECRET'] as string;
    this._logLevel = c.logLevel || LogLevel.DEBUG;
    this._validate = c.validate || false;

    this.getToken()
      .then(this.onToken.bind(this))
      .catch((response: ErrorResponse) => {
        console.table(response.error);
      });
  }

  static config(c?: Config): SDK {
    if (!SDK._instance) {

      SDK._instance = new SDK(c || {});
    }

    return SDK._instance;
  }

  private static i(): SDK {
    return SDK._instance;
  }

  static post<T>(
    path: string,
    // tslint:disable-next-line:no-any
    body: any,
    // tslint:disable-next-line:no-any
    query: any = {},
    // tslint:disable-next-line:no-any
    outgoingMap?: { [key: string]: any },
    // tslint:disable-next-line:no-any
    incomingMap?: { [key: string]: any },
    headers?: OutgoingHttpHeaders,
  ): Promise<T | Buffer> {
    return SDK.i().post<T>(path, body, headers);
  }


  private post<T>(
    path: string,
    // tslint:disable-next-line:no-any
    body: any,
    // tslint:disable-next-line:no-any
    query: any = {},
    // tslint:disable-next-line:no-any
    outgoingMap?: { [key: string]: any },
    // tslint:disable-next-line:no-any
    incomingMap?: { [key: string]: any },
    headers?: OutgoingHttpHeaders,
  ): Promise<T | Buffer> {
    return new Promise((resolve, reject) => {
      const options: https.RequestOptions = {
        'method': 'POST',
        'hostname': this.host,
        'path': `${path}${qs.stringify(query)}`,
        'headers': this.headers(true, headers),
      };

      const req: ClientRequest = https.request(options, (res) => {
        // tslint:disable-next-line:no-any
        const chunks: any[] = [];

        res.on("data", (chunk) => chunks.push(chunk));

        // tslint:disable-next-line:no-any
        res.on("end", (_args: any) => {
          let body;

          const buf = Buffer.concat(chunks);

          console.log('Hello2');

          try {
            body = JSON.parse(buf.toString());
            resolve(body as T);
          } catch {
            resolve(buf);
          }
        });

        res.on("error", (e) => {
          let body;
          try {
            body = JSON.parse(Buffer.concat(chunks).toString());
          } catch (e) {
            body = { error: e.toString() };
          }

          reject({
            error: body['error'] || body['message'],
            rawBody: body,
            statusCode: res.statusCode,
            errors: body['errors'],
            headers: res.headers,

          } as ErrorResponse);
        });
      });

      req.write(JSON.stringify(body));

      req.end();
    });
  }

  put() {

  }

  delete() {

  }

  static get validate(): boolean {
    return SDK.i()._validate;
  }

  get isProd(): boolean {
    return this._env === Environment.prod;
  }

  private onToken(response: OAuth2Response) {
    this._accessToken = response.access_token;
    this._expiresIn = response.expires_in;
    this._tokenType = response.token_type;

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

  private headers(auth = true, mergeWith: OutgoingHttpHeaders = {}): OutgoingHttpHeaders {
    let h = {
      ...{
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...(mergeWith)
    };

    if (auth) {
      h = {
        ...h, ...{ 'Authorization': `Bearer ${this._accessToken}` }
      };
    }

    return h;
  }

  private get authHost(): string {
    return this.isProd ? 'auth.caradhras.io' : 'auth.hml.caradhras.io';
  }

  private get host(): string {
    return this.isProd ? 'api.caradhras.io' : 'api.hml.caradhras.io';
  }

  private getToken(): Promise<OAuth2Response> {
    return new Promise((resolve, reject) => {
      const options: https.RequestOptions = {
        'method': 'POST',
        'hostname': this.authHost,
        'path': '/oauth2/token?grant_type=client_credentials',
        'headers': this.headers(false, {
          'Content-Type': 'application/x-www-form-urlencoded'
        })
      };

      const req: ClientRequest = https.request(options, (res) => {
        // tslint:disable-next-line:no-any
        const chunks: any[] = [];

        res.on("data", (chunk) => chunks.push(chunk));

        // tslint:disable-next-line:no-any
        res.on("end", (_args: any) => {
          const body = JSON.parse(Buffer.concat(chunks).toString());
          resolve(body as OAuth2Response);
        });

        res.on("error", (_) => {
          const error = `
              The following credentials were rejected by the OAuth Server:
              Client ID: ****${this._clientId.slice(-4)}
              Client Secret: ****${this._clientSecret.slice(-4)}
              OAuth Server: ${this.authHost}
            `;

          console.log(error);

          reject({
            error
          } as ErrorResponse);
        });
      });

      const postData = qs.stringify({
        client_id: this._clientId,
        client_secret: this._clientSecret,
      });

      req.write(postData);

      req.end();
    });
  }
}
