export type SpotifyAuthorizeQuery = {
  response_type: string;
  client_id: string;
  scope: string;
  redirect_uri: string;
  state: string;
  show_dialog: boolean;
};
