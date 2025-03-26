import { ClientCloud } from "biqpod/ui/apis";
export const cloud = new ClientCloud("tse");
const getUri = () => new URL("https://tseproject-001-site1.anytempurl.com");
import { mergeObject } from "biqpod/ui/utils";
export const saveToken = async (token: string | null) => {
  token
    ? localStorage.setItem("token", token)
    : localStorage.removeItem("token");
};
export const getToken = async () => {
  return localStorage.getItem("token");
};
cloud.set("auth", "signInWithEmailAndPassword", async (username, password) => {
  const baseUri = getUri();
  baseUri.pathname = "/api/admin/auth";
  const response = await fetch(baseUri, {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { token } = await response.json();
  saveToken(token);
});
cloud.set("auth", "signOut", async () => {
  saveToken(null);
});
cloud.set("auth", "getCurrentAuth", async () => {
  const token = await getToken();
  if (!token) {
    return null;
  }
  const fn = await cloud.app.functions.getUserFunction<any>("User.me", false, {
    method: "GET",
    isQuery: true,
  });
  if (!fn) {
    return null;
  }
  const { username } = await fn({});
  return username;
});
cloud.set("auth", "onAuthStateChanged", (callback) => {
  var token: string | null = null;
  var isFirst = true;
  const timer = setInterval(async () => {
    const newToken = await getToken();
    if (token !== newToken || isFirst) {
      token = newToken;
      isFirst = false;
      callback(await cloud.app.auth.getCurrentAuth());
    }
  }, 2000);
  return () => {
    clearInterval(timer);
  };
});
cloud.set(
  "functions",
  "getUserFunction",
  async (name, _isDev, metaData: any) => {
    const method = metaData?.method || "POST";
    const baseUri = getUri();
    baseUri.pathname = `/api/${name.replaceAll(".", "/")}`;
    return async (data: any) => {
      if (metaData?.isQuery) {
        baseUri.searchParams.append("data", JSON.stringify(data));
      }
      const token = await getToken();
      const response = await fetch(baseUri, {
        ...mergeObject(
          {
            method,
            headers: mergeObject<HeadersInit>(
              {
                "Content-Type": "application/json",
              },
              token && {
                Authorization: `Bearer ${token}`,
              }
            ),
          },
          !metaData?.isQuery && { body: JSON.stringify(data) }
        ),
      });
      return await response.json();
    };
  }
);
// this is needed in the project for default informations
cloud.setAsMain();
export const { nosql: db, auth, storage } = cloud.app;
export const {
  getDoc,
  getDocs,
  getCollections,
  createDoc,
  upsertDoc: setDoc,
  deleteDoc,
  onCollectionSnapshot,
  onDocSnapshot,
  onAutoSnapshot,
} = cloud.app.nosql;
export const {
  signIn,
  signOut,
  generateToken,
  onAuthStateChanged,
  deleteUser,
  signInWithCustomToken,
  getCurrentAuth,
} = cloud.app.auth;
export const {
  upsertFile: uploadFile,
  deleteFile,
  getDownloadURL,
  getFileContent: getContent,
} = cloud.app.storage;
