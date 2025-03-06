declare namespace Express {
  export interface Request {
    user?: { userId: string };  // Declaring the user property
  }
}
