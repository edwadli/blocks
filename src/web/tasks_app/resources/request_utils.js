'use strict';

export {postJson};

function postJson(path, json_payload) {
  return fetch(path, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(json_payload),
  })
  .catch((error) => {
    console.error(error);
  });
}
