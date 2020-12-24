import { authentication, AuthenticationSession } from 'vscode';

export default async function getSession () : Promise<AuthenticationSession> {
  return await authentication.getSession('github', ['user', 'repo'], { createIfNone: true });
}
