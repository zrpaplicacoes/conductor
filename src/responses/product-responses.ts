import { Product } from "../models";

import { Response } from "./";

export interface ProductListResponse {
  data: Product[];
  response: Response;
}
