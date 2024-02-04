
// Matches https URLs by getting everything after https and before a space or closing parenthesis
export const URL_REGEX = /(https?:\/\/[^\s()]+)/g;

// TODO: Make this more complex
export const CLAIM_REGEX = /Source|source|Link|link/;
