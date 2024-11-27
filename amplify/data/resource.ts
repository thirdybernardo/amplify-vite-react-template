import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
      isDone: a.boolean(),
      owner: a.string(),
    })
    // .authorization((allow) => [allow.publicApiKey(), allow.owner()]),
    .authorization((allow) => [
      allow.publicApiKey(),
      allow.owner().to(['create', 'read', 'update']),
    ]),
  UserTodo: a
    .model({
      content: a.string(),
      isDone: a.boolean(),
      owner: a.string(),
    })
    //.authorization((allow) => [allow.publicApiKey(), allow.owner()]),
    .authorization((allow) => [allow.owner().to(['create', 'read', 'update'])]),
});

// Used for code completion / highlighting when making requests from frontend
export type Schema = ClientSchema<typeof schema>;

// defines the data resource to be deployed
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 30 },
  },
});
