import { notify2 } from './notify';
import { jwtAuthorize, saveCredentials } from './oauth2';

jwtAuthorize().then((client) => {
  saveCredentials(client);
  notify2('https://www.webmanajemen.com/chimeraland/monsters/cicada.html', 'URL_UPDATED', client.credentials);
});
