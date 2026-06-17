// auth.js
// SysSPS – Autenticação
// Versão: v3.0.0

const SESSION_KEY = "sps_session";

/* ===== Sessão ===== */

function getSession() {

const raw =
localStorage.getItem(
SESSION_KEY
);

return raw
? JSON.parse(raw)
: null;

}

function setSession(data) {

localStorage.setItem(
SESSION_KEY,
JSON.stringify(data)
);

}

function clearSession() {

localStorage.removeItem(
SESSION_KEY
);

}

/* ===== Login ===== */

async function login(
username,
password
) {

username =
username.trim();

const snap =
await db
.ref(
`app/users/${username}`
)
.once("value");

if (!snap.exists()) {

```
throw new Error(
  "Usuário não encontrado"
);
```

}

const user =
snap.val();

const ativo =
user.ativo === true ||
user.active === true;

if (!ativo) {

```
throw new Error(
  "Usuário inativo"
);
```

}

if (
String(user.password) !==
String(password)
) {

```
throw new Error(
  "Senha inválida"
);
```

}

const admin =
user.admin === true ||
user.role === "admin";

const nome =
user.nome ||
user.username ||
username;

const session = {

```
username,

nome,

admin,

loginAt:
  Date.now()
```

};

setSession(
session
);

return session;

}

/* ===== Proteção ===== */

function requireAuth() {

const session =
getSession();

if (!session) {

```
window.location.href =
  "./index.html";

throw new Error(
  "Não autenticado"
);
```

}

return session;

}

/* ===== Logout ===== */

function logout() {

clearSession();

window.location.href =
"./index.html";

}
