declare namespace Express {
  interface Request {
    user: string;
    company: string;
    requiredAuth?: boolean;
    requiredCompany?: boolean;
  }
}
