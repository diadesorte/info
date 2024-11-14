/*
1) Install dependencies
yarn add -D firebase pinia @pinia/nuxt

Add line above in Nuxt
  modules: [
    ["@pinia/nuxt", {}],
  ],

2) In Firebase panel, create project then set variables in .env

FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_MEASUREMENT_ID=

3) Insert into nuxt.config.ts
Dont forget to put the variables above in docker-compose.yml service "environment" attribute.

  runtimeConfig: {
    public: {
      firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        appId: process.env.FIREBASE_APP_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
      },
    },
  },

4) Create the file with this content
composables/useFirebase.js

5) Set the Firebase configurations, example:
- Activate and configure Authentication
- Activate and configure Firestore database with permissions
   allow read: if true;
   allow write: if request.auth != null;
*/

import { ref, reactive } from "vue";
import { defineStore } from "pinia";

import * as fireApp from "firebase/app";
import * as fireAuth from "firebase/auth";
import * as fireFirestore from "firebase/firestore";
import * as fireStorage from "firebase/storage";

export default defineStore("firebase", () => {
  const config = useRuntimeConfig();
  fireApp.initializeApp(config.public.firebase);
  const _auth = fireAuth.getAuth();
  const _storage = fireStorage.getStorage();
  const fireFirestoreDB = fireFirestore.getFirestore();

  const strategies = {
    login: {
      async email(data) {
        return await fireAuth.signInWithEmailAndPassword(
          _auth,
          data.email,
          data.password
        );
      },
    },
    register: {
      async email(data) {
        return await fireAuth.createUserWithEmailAndPassword(
          _auth,
          data.email,
          data.password
        );
      },
    },
  };

  const ready = ref(false);
  const user = ref(false);

  const auth = reactive({
    busy: false,
    success: false,
    error: false,

    async register(data = {}, strategy = "email") {
      data = { email: "", password: "", ...data };
      this.busy = true;
      this.success = false;
      this.error = false;
      try {
        if (typeof strategies["register"][strategy] != "undefined") {
          await strategies["register"][strategy](data);
          this.success = true;
          event.dispatch("registerSuccess");
        }
      } catch (err) {
        this.error = await this.exception(err);
        event.dispatch("registerError");
      }
      this.busy = false;
    },

    async login(data = {}, strategy = "email") {
      data = { email: "", password: "", ...data };
      this.busy = true;
      this.success = false;
      this.error = false;
      try {
        if (typeof strategies["login"][strategy] != "undefined") {
          await strategies["login"][strategy](data);
          this.success = true;
          event.dispatch("loginSuccess");
        }
      } catch (err) {
        this.error = await this.exception(err);
        event.dispatch("loginError");
      }
      this.busy = false;
    },

    async logout() {
      const r = await fireAuth.signOut(_auth);
      event.dispatch("logout");
      return r;
    },

    async update(data = {}) {
      data = { name: "", email: "", phoneNumber: "", photoURL: "", ...data };

      const profileUpdate = !(
        data.name == _auth.currentUser.displayName &&
        data.photoURL == _auth.currentUser.photoURL
      );

      const emailUpdate = !(data.email == _auth.currentUser.email);
      const phoneNumberUpdate = !(
        data.phoneNumber == _auth.currentUser.phoneNumber
      );

      if (profileUpdate) {
        await fireAuth.updateProfile(_auth.currentUser, {
          displayName: data.name,
          photoURL: data.photoURL,
        });
      }

      if (emailUpdate) {
        await fireAuth.updateEmail(_auth.currentUser, data.email);
      }
    },

    async exception(err) {
      return { code: "", message: "", customData: {}, name: false, ...err };
    },
  });

  const firestore = reactive({
    busy: false,
    error: false,
    async find(collection, value, by = "uid") {
      const docRef = fireFirestore.doc(fireFirestoreDB, collection, value);
      const docSnap = await fireFirestore.getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : false;
    },
    async save(collection, data = {}) {
      data = { uid: null, ...data };
      const ref = fireFirestore.collection(fireFirestoreDB, collection);

      if (!data.uid) {
        const created = await fireFirestore.addDoc(ref, data);
        data.uid = created.id;
      }

      await fireFirestore.setDoc(
        fireFirestore.doc(fireFirestoreDB, collection, data.uid),
        data
      );
      return data;
    },
    async delete(collection, value, by = "uid") {},
    async search(collection, query = {}) {
      query = {
        limit: 5,
        // orderBy: ["uid", "desc"],
        where: [],
        startAfter: false,
        endAt: false,
        ...query,
      };

      let prev = false;
      let next = false;

      const collectRef = fireFirestore.collection(fireFirestoreDB, collection);

      let queryArgs = [];

      if (query.orderBy) {
        queryArgs.push(fireFirestore.orderBy.apply(null, query.orderBy));
      }

      if (query.where.length > 0) {
        query.where.map((condition) => {
          queryArgs.push(fireFirestore.where.apply(null, condition));
        });
      }

      if (query.startAfter) {
        queryArgs.push(
          fireFirestore.startAfter(
            await fireFirestore.getDoc(
              fireFirestore.doc(fireFirestoreDB, collection, query.startAfter)
            )
          )
        );
      }

      if (query.endAt) {
        queryArgs.push(
          fireFirestore.endAt(
            await fireFirestore.getDoc(
              fireFirestore.doc(fireFirestoreDB, collection, query.endAt)
            )
          )
        );
      }

      if (query.limit) {
        queryArgs.push(fireFirestore.limit(query.limit));
      }

      this.busy = true;
      const docsQuery = fireFirestore.query.apply(null, [
        collectRef,
        ...queryArgs,
      ]);
      const docs = await fireFirestore.getDocs(docsQuery);

      let data = [];
      docs.forEach((doc) => {
        data.push({ ...doc.data(), uid: doc.id });
      });

      if (data.length == query.limit) {
        next = JSON.parse(JSON.stringify(query));
        next.startAfter = data[data.length - 1]["uid"];
        next.endAt = false;
      }

      this.busy = false;
      return { query, data, prev, next };
    },
    async onSnapshot(collection, uid, callback) {
      const doc = fireFirestore.doc(fireFirestoreDB, collection, uid);
      return fireFirestore.onSnapshot(doc, callback);
    },
  });

  const storage = reactive({
    busy: false,
    error: false,
    async upload(file) {
      if (file instanceof File) {
        const storageRef = fireStorage.ref(_storage, file.name);
        const snapshot = await fireStorage.uploadBytes(storageRef, file);
        const url = await fireStorage.getDownloadURL(snapshot.ref);
        return { url, snapshot };
      }

      return false;
    },
  });

  const event = reactive({
    events: [],
    async on(name, callback) {
      this.events.push({ name, callback });
    },
    async dispatch(eventName) {
      this.events.map(({ name, callback }) => {
        if (name != eventName) return;
        callback();
      });
    },
  });

  fireAuth.onAuthStateChanged(_auth, (authUser) => {
    ready.value = true;

    if (!authUser) {
      user.value = false;
      event.dispatch("onAuthStateChanged");
      return;
    }

    user.value = {
      uid: authUser.uid,
      name:
        (authUser.providerData[0]
          ? authUser.providerData[0]["displayName"]
          : null) || authUser.email,
      email: authUser.email,
      emailVerified: authUser.emailVerified,
      phoneNumber: authUser.providerData[0]
        ? authUser.providerData[0]["phoneNumber"]
        : "",
      photoURL: authUser.providerData[0]
        ? authUser.providerData[0]["photoURL"]
        : "",
    };

    event.dispatch("onAuthStateChanged");
  });

  return { ready, user, auth, firestore, storage, event };
});
